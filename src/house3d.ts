// The building plot: a voxel house on a 1 m grid, drawn in the same cube style as TOD Explorer.
// Shape: click corner points on the grass (rectangle, any right-angled outline, or an added wing).
// Windows: click a wall face, or drag one from the palette.

import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { FRAMES } from "./data";
import { Facade, House, PlacedWindow, WindowSize, canPlace, doorFace, faceKey, geometry, parse, validWindows, windowDims, windowSpan } from "./house";

export const PLOT = 16;

const WALL_COLORS: Record<string, string> = {
  wall_cavity_brick: "#c8664a",
  wall_etics_block: "#efe6d4",
  wall_monolithic: "#e9d9bd",
  wall_aerated: "#dcdcd6",
  wall_timber_frame: "#c99a62",
  wall_clt: "#b98550",
  wall_straw: "#e7cf8c",
};
const ROOF_COLORS: Record<string, string> = { roof_pitched_rafters: "#a8483a", roof_flat_concrete: "#8d9099" };
const FRAME_COLORS: Record<string, string> = { aluminium_old: "#a9adb4", aluminium_tb: "#5b6170", wood: "#9c6a3c", pvc: "#f4f4f0", passive: "#ece8dc" };
const GLASS: Record<string, string> = { single: "#9cc9ec", double_old: "#7fb6e3", double_hr: "#5b9bd5", triple: "#3d7fc0", triple_passive: "#2f6aa8" };

function shadedBox(): THREE.BoxGeometry {
  const g = new THREE.BoxGeometry(1, 1, 1);
  g.translate(0, 0.5, 0);
  const shade = [0.8, 0.8, 1.0, 0.5, 0.9, 0.7]; // +x, -x, +y, -y, +z, -z
  const colors: number[] = [];
  for (let face = 0; face < 6; face++) for (let v = 0; v < 4; v++) colors.push(shade[face], shade[face], shade[face]);
  g.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
  return g;
}

export interface Face {
  x: number;
  z: number;
  storey: number;
  facade: Facade;
}

interface Box {
  x: number; y: number; z: number; w: number; h: number; d: number; color: string;
  /** what the player hits when clicking this box */
  wall?: { x: number; z: number; storey: number };
  window?: Face;
}

/** rect: two opposite corners. corners: any right-angled outline. wing: a rectangle added to the house. */
export type Tool = "rect" | "corners" | "wing" | "window" | "look";
export type Pt = [number, number];

/** Cells (1 m squares) whose centre lies inside a closed outline of grid points. */
export function cellsInside(poly: Pt[]): Set<string> {
  const out = new Set<string>();
  const xs = poly.map((p) => p[0]), zs = poly.map((p) => p[1]);
  for (let x = Math.min(...xs); x < Math.max(...xs); x++)
    for (let z = Math.min(...zs); z < Math.max(...zs); z++) {
      const px = x + 0.5, pz = z + 0.5;
      let inside = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, zi] = poly[i], [xj, zj] = poly[j];
        if (zi > pz !== zj > pz && px < ((xj - xi) * (pz - zi)) / (zj - zi) + xi) inside = !inside;
      }
      if (inside) out.add(`${x},${z}`);
    }
  return out;
}

/** The extra corner needed to close an outline with straight walls (null if the last point already lines up with the first). */
export function closingCorner(pts: Pt[]): Pt | null {
  const first = pts[0], last = pts[pts.length - 1];
  if (pts.length < 2 || first[0] === last[0] || first[1] === last[1]) return null;
  const prev = pts[pts.length - 2];
  // keep turning: after an east-west side comes a north-south one
  return prev[1] === last[1] ? [last[0], first[1]] : [first[0], last[1]];
}

export function rectPoly(a: Pt, b: Pt): Pt[] {
  return [a, [b[0], a[1]], b, [a[0], b[1]]];
}

export class HouseView {
  private renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  private scene = new THREE.Scene();
  private camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -500, 500);
  private controls: OrbitControls;
  private geometry = shadedBox();
  private material = new THREE.MeshBasicMaterial({ vertexColors: true });
  /** the house has its own material so it can turn into a see-through ghost while a new outline is drawn */
  private houseMaterial = new THREE.MeshBasicMaterial({ vertexColors: true, transparent: true, opacity: 1, depthWrite: true });
  private mesh?: THREE.InstancedMesh;
  private boxes: Box[] = [];
  private ground: THREE.InstancedMesh;
  private hover = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ color: "#f5c542", transparent: true, opacity: 0.6 }));
  private raycaster = new THREE.Raycaster();
  private plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  private observer = new ResizeObserver(() => this.resize());
  private downAt?: [number, number];
  private house?: House;
  private draftGroup = new THREE.Group();
  private labelCache = new Map<string, THREE.SpriteMaterial>();
  /** corner points clicked so far (grid vertices) */
  draft: Pt[] = [];
  private hoverPt?: Pt;
  private _tool: Tool = "look";
  /** a closed outline: the cells inside it */
  onShape?: (cells: Set<string>, tool: Tool) => void;
  /** a short instruction for the player while drawing */
  onDraft?: (msg: string) => void;
  /** the window that a click or drop would place (for the hover preview) */
  placing: { size: WindowSize; w?: number; h?: number } = { size: "standard" };
  /** a window face was clicked or a window dropped on it */
  onFace?: (face: Face, existing: boolean) => void;

  get tool() {
    return this._tool;
  }
  set tool(t: Tool) {
    if (t !== this._tool) this.draft = [];
    this._tool = t;
    this.hover.visible = false;
    this.drawDraft();
  }

  constructor(private host: HTMLElement) {
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    host.appendChild(this.renderer.domElement);
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.maxPolarAngle = Math.PI * 0.42;
    this.controls.minZoom = 0.6;
    this.controls.maxZoom = 3;
    this.controls.enablePan = false;
    this.controls.target.set(PLOT / 2, 2, PLOT / 2);
    this.camera.position.set(PLOT / 2 + 30, 32, PLOT / 2 + 30);

    this.ground = new THREE.InstancedMesh(this.geometry, this.material, PLOT * PLOT);
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    let i = 0;
    for (let x = 0; x < PLOT; x++) for (let z = 0; z < PLOT; z++) {
      m.compose(new THREE.Vector3(x + 0.5, -0.4, z + 0.5), new THREE.Quaternion(), new THREE.Vector3(0.98, 0.4, 0.98));
      this.ground.setMatrixAt(i, m);
      this.ground.setColorAt(i, c.set((x + z) % 2 ? "#7cc84a" : "#6cbf3c"));
      i++;
    }
    this.scene.add(this.ground);
    this.hover.visible = false;
    this.hover.renderOrder = 10;
    this.scene.add(this.hover);
    this.addCompass();
    this.scene.add(this.draftGroup);

    const el = this.renderer.domElement;
    // Clicks (not drags: a drag turns the view) place corner points or windows.
    el.addEventListener("pointerdown", (e) => (this.downAt = [e.clientX, e.clientY]));
    el.addEventListener("pointerup", (e) => {
      if (e.button !== 0 || !this.downAt || Math.hypot(e.clientX - this.downAt[0], e.clientY - this.downAt[1]) > 6) return;
      if (this.tool === "window") {
        const hit = this.faceAt(e);
        if (hit) this.onFace?.(hit.face, hit.existing);
      } else if (this.isDrawTool()) this.clickPoint(e);
    });
    el.addEventListener("pointermove", (e) => {
      if (this.isDrawTool()) {
        const p = this.vertexAt(e) ?? undefined;
        if (p?.[0] !== this.hoverPt?.[0] || p?.[1] !== this.hoverPt?.[1]) {
          this.hoverPt = p;
          this.drawDraft();
        }
      } else this.showHover(e);
    });
    el.addEventListener("pointerleave", () => {
      this.hover.visible = false;
      this.hoverPt = undefined;
      this.drawDraft();
    });
    // Double-click finishes the outline: the last corner connects to the first one.
    el.addEventListener("dblclick", () => {
      if (this.tool !== "corners") return;
      if (this.draft.length >= 3) this.closeCorners();
      else if (this.draft.length) this.onDraft?.("Place at least 3 corners, then double-click to finish.");
    });
    window.addEventListener("keydown", (e) => {
      if (!this.isDrawTool() || !this.draft.length) return;
      if (e.key === "Escape") this.cancelDraft();
      if (e.key === "Backspace") this.undoPoint();
    });
    // Drag and drop from the window palette.
    el.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.showHover(e, true);
    });
    el.addEventListener("drop", (e) => {
      e.preventDefault();
      const hit = this.faceAt(e);
      this.hover.visible = false;
      if (hit && !hit.existing) this.onFace?.(hit.face, false);
    });
    this.observer.observe(host);
    this.resize();
    const loop = () => {
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(loop);
    };
    loop();
  }

  private addCompass() {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#23262f";
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.font = "bold 38px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("N", 32, 34);
    const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas) }));
    sprite.position.set(PLOT / 2, 1, -1.5);
    sprite.scale.set(1.6, 1.6, 1);
    this.scene.add(sprite);
  }

  private pointer(e: { clientX: number; clientY: number }) {
    const r = this.renderer.domElement.getBoundingClientRect();
    this.raycaster.setFromCamera(new THREE.Vector2(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1), this.camera);
  }

  isDrawTool() {
    return this.tool === "rect" || this.tool === "corners" || this.tool === "wing";
  }

  /** The grid point (corner of the 1 m squares) nearest the pointer. */
  vertexAt(e: { clientX: number; clientY: number }): Pt | null {
    this.pointer(e);
    const p = new THREE.Vector3();
    if (!this.raycaster.ray.intersectPlane(this.plane, p)) return null;
    const x = Math.round(p.x), z = Math.round(p.z);
    return x >= 0 && z >= 0 && x <= PLOT && z <= PLOT ? [x, z] : null;
  }

  /** Near the first corner (within 1 m) once there are 3 corners: a click there closes the outline. */
  private nearFirst(p: Pt | undefined) {
    const f = this.draft[0];
    return !!p && !!f && this.tool === "corners" && this.draft.length >= 3 && Math.abs(p[0] - f[0]) <= 1 && Math.abs(p[1] - f[1]) <= 1;
  }

  /** In corner mode each side runs north-south or east-west: snap to the longer direction. */
  private snapped(p: Pt): Pt {
    if (this.tool !== "corners" || !this.draft.length) return p;
    if (this.nearFirst(p)) return this.draft[0];
    const [lx, lz] = this.draft[this.draft.length - 1];
    return Math.abs(p[0] - lx) >= Math.abs(p[1] - lz) ? [p[0], lz] : [lx, p[1]];
  }

  /** Place a point at a grid vertex (also used by tests). */
  clickVertex(raw: Pt) {
    const d = this.draft;
    if (this.tool === "corners") {
      const first = d[0];
      const same = (a: Pt | undefined, b: Pt) => !!a && a[0] === b[0] && a[1] === b[1];
      if (this.nearFirst(raw)) return this.closeCorners();
      const p = this.snapped(raw);
      if (same(d[d.length - 1], p)) return;
      if (d.length >= 3 && same(first, p)) return this.closeCorners();
      d.push(p);
    } else if (!d.length) d.push(raw);
    else if (raw[0] !== d[0][0] && raw[1] !== d[0][1]) {
      const cells = cellsInside(rectPoly(d[0], raw));
      this.draft = [];
      this.drawDraft();
      this.onShape?.(cells, this.tool);
      return;
    }
    this.drawDraft();
  }

  private clickPoint(e: PointerEvent) {
    const raw = this.vertexAt(e);
    if (raw) this.clickVertex(raw);
  }

  /** Close the outline (adding one corner if the last side does not line up with the first point). */
  closeCorners() {
    const d = this.draft;
    if (d.length < 3) return;
    const corner = closingCorner(d);
    if (corner) d.push(corner);
    const cells = cellsInside(d);
    this.draft = [];
    this.drawDraft();
    this.onShape?.(cells, this.tool);
  }

  undoPoint() {
    this.draft.pop();
    this.drawDraft();
  }

  cancelDraft() {
    this.draft = [];
    this.drawDraft();
  }

  private label(text: string): THREE.Sprite {
    let mat = this.labelCache.get(text);
    if (!mat) {
      const canvas = document.createElement("canvas");
      canvas.width = 128;
      canvas.height = 56;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#23262f";
      ctx.beginPath();
      ctx.roundRect(4, 4, 120, 48, 14);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = "bold 30px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 64, 30);
      mat = new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(canvas), depthTest: false });
      this.labelCache.set(text, mat);
    }
    const s = new THREE.Sprite(mat);
    s.scale.set(1.6, 0.7, 1);
    s.renderOrder = 20;
    return s;
  }

  /** Posts at the corners, lines between them, the side being drawn, and length labels. */
  private drawDraft() {
    const g = this.draftGroup;
    for (const c of [...g.children]) {
      g.remove(c);
      if (c instanceof THREE.Mesh) (c.material as THREE.Material).dispose();
    }
    // While a new outline is being drawn, the old house turns into a faint ghost.
    const ghost = this.isDrawTool() && this.draft.length > 0 && this.tool !== "wing";
    this.houseMaterial.opacity = ghost ? 0.18 : 1;
    this.houseMaterial.depthWrite = !ghost;
    if (!this.isDrawTool()) return;
    const box = (x: number, z: number, w: number, h: number, d: number, color: string, opacity = 1) => {
      const m = new THREE.Mesh(this.geometry, new THREE.MeshBasicMaterial({ vertexColors: true, color, transparent: opacity < 1, opacity }));
      m.position.set(x, 0, z);
      m.scale.set(w, h, d);
      g.add(m);
    };
    const post = (p: Pt, color: string, big = false) => box(p[0], p[1], big ? 0.45 : 0.3, big ? 1.4 : 1, big ? 0.45 : 0.3, color);
    const side = (a: Pt, b: Pt, color: string) => {
      const len = Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
      if (!len) return;
      box((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.max(0.12, Math.abs(b[0] - a[0])), 0.15, Math.max(0.12, Math.abs(b[1] - a[1])), color);
      const l = this.label(`${len} m`);
      l.position.set((a[0] + b[0]) / 2, 1.2, (a[1] + b[1]) / 2);
      g.add(l);
    };
    const d = this.draft;
    const hp = this.hoverPt ? this.snapped(this.hoverPt) : undefined;
    let msg: string;
    if (this.tool === "corners") {
      const closing = this.nearFirst(this.hoverPt);
      d.forEach((p, i) => post(p, i === 0 ? "#2f9e44" : "#23262f", i === 0 && d.length >= 3));
      for (let i = 1; i < d.length; i++) side(d[i - 1], d[i], "#23262f");
      if (hp && d.length) side(d[d.length - 1], hp, closing ? "#2f9e44" : "#f5a142");
      if (hp && !closing) post(hp, "#f5c542");
      // Dashed preview of the side that a double-click would add.
      if (d.length >= 2 && !closing) {
        const last = d[d.length - 1];
        const pts = hp && (hp[0] !== last[0] || hp[1] !== last[1]) ? [...d, hp] : d;
        const end = pts[pts.length - 1], f = d[0];
        const corner = closingCorner(pts);
        if (corner) {
          side(end, corner, "#b9bcc2");
          side(corner, f, "#b9bcc2");
        } else side(end, f, "#b9bcc2");
      }
      msg = !d.length
        ? "Click on the grass to place the first corner."
        : closing
          ? "Click to close the shape."
          : d.length < 3
            ? "Click to place the next corner. Walls run straight north-south or east-west."
            : "Keep clicking corners. Double-click, or click the green post, to finish: the grey line closes it.";
    } else {
      if (d.length) post(d[0], "#23262f");
      if (hp) post(hp, "#f5c542");
      if (d.length && hp && hp[0] !== d[0][0] && hp[1] !== d[0][1]) {
        const poly = rectPoly(d[0], hp);
        for (let i = 0; i < 4; i++) side(poly[i], poly[(i + 1) % 4], "#f5a142");
        for (const k of cellsInside(poly)) {
          const [x, z] = parse(k);
          box(x + 0.5, z + 0.5, 0.96, 0.04, 0.96, "#f5c542", 0.5);
        }
      }
      msg = this.tool === "wing"
        ? d.length ? "Click the opposite corner of the new wing. It must touch the house." : "Click one corner of a new wing (an extension that touches the house)."
        : d.length ? "Click the opposite corner." : "Click one corner of the house on the grass.";
    }
    this.onDraft?.(msg);
  }

  /** The exterior wall face (or placed window) under the pointer. */
  faceAt(e: { clientX: number; clientY: number }): { face: Face; existing: boolean } | null {
    if (!this.mesh || !this.house) return null;
    this.pointer(e);
    const hit = this.raycaster.intersectObject(this.mesh)[0];
    if (!hit || hit.instanceId === undefined || !hit.face) return null;
    const b = this.boxes[hit.instanceId];
    if (b.window) return { face: b.window, existing: true };
    if (!b.wall) return null;
    const n = hit.face.normal;
    const facade: Facade | null = n.x > 0.5 ? "E" : n.x < -0.5 ? "W" : n.z > 0.5 ? "S" : n.z < -0.5 ? "N" : null;
    if (!facade) return null;
    const { x, z } = b.wall;
    const nb = facade === "E" ? `${x + 1},${z}` : facade === "W" ? `${x - 1},${z}` : facade === "S" ? `${x},${z + 1}` : `${x},${z - 1}`;
    if (this.house.cells.has(nb)) return null;
    const face = { x, z, storey: b.wall.storey, facade };
    const door = doorFace(this.house);
    if (door && faceKey(door) === faceKey(face)) return null;
    return { face, existing: false };
  }

  private showHover(e: { clientX: number; clientY: number }, forWindow = false) {
    if (!(this.tool === "window" || forWindow)) return void (this.hover.visible = false);
    const hit = this.faceAt(e);
    if (!hit || !this.house) return void (this.hover.visible = false);
    const f = hit.face, H = this.house.storeyHeight;
    const along = f.facade === "N" || f.facade === "S";
    const span = hit.existing ? 1 : windowSpan(this.placing);
    const fits = hit.existing || canPlace(this.house, { ...f, ...this.placing } as PlacedWindow);
    const off = 0.6, shift = (span - 1) / 2;
    this.hover.position.set(
      f.x + 0.5 + (f.facade === "E" ? off : f.facade === "W" ? -off : along ? shift : 0),
      f.storey * H + H / 2,
      f.z + 0.5 + (f.facade === "S" ? off : f.facade === "N" ? -off : along ? 0 : shift),
    );
    this.hover.scale.set(along ? span - 0.04 : 0.04, H * 0.96, along ? 0.04 : span - 0.04);
    (this.hover.material as THREE.MeshBasicMaterial).color.set(hit.existing || !fits ? "#ed1c24" : "#f5c542");
    this.hover.visible = true;
  }

  resize() {
    const w = this.host.clientWidth || 1, h = this.host.clientHeight || 1;
    this.renderer.setSize(w, h);
    const view = 26;
    const aspect = w / h;
    this.camera.left = (-view * aspect) / 2;
    this.camera.right = (view * aspect) / 2;
    this.camera.top = view / 2 + 1;
    this.camera.bottom = -view / 2 + 1;
    this.camera.updateProjectionMatrix();
  }

  turn(dir: 1 | -1) {
    const t = this.controls.target;
    const off = this.camera.position.clone().sub(t).applyAxisAngle(new THREE.Vector3(0, 1, 0), (dir * Math.PI) / 4);
    this.camera.position.copy(t).add(off);
  }

  zoom(f: number) {
    this.camera.zoom = Math.min(3, Math.max(0.6, this.camera.zoom * f));
    this.camera.updateProjectionMatrix();
  }

  render(h: House, opts: { roof?: boolean; systems?: boolean } = {}) {
    this.house = h;
    const showRoof = opts.roof ?? true;
    const showSystems = opts.systems ?? true;
    const boxes: Box[] = [];
    const g = geometry(h);
    const wallColor = WALL_COLORS[h.wall.construction] ?? "#ddd";
    const H = h.storeyHeight;
    const top = h.storeys * H;

    for (const k of h.cells) {
      const [x, z] = parse(k);
      for (let s = 0; s < h.storeys; s++) boxes.push({ x: x + 0.5, y: s * H, z: z + 0.5, w: 1, h: H, d: 1, color: wallColor, wall: { x, z, storey: s } });
    }

    // Windows and the front door. Frame and glass sit at clearly different depths (glass in front)
    // so their faces never share a plane: shared planes flicker when the view moves (z-fighting).
    const placeOnFace = (f: Face, w: number, hh: number, sill: number, color: string, isWindow: boolean, out: number, depth: number, shift = 0) => {
      const along = f.facade === "N" || f.facade === "S";
      boxes.push({
        x: f.x + 0.5 + (f.facade === "E" ? out : f.facade === "W" ? -out : along ? shift : 0),
        y: f.storey * H + sill,
        z: f.z + 0.5 + (f.facade === "S" ? out : f.facade === "N" ? -out : along ? 0 : shift),
        w: along ? w : depth, h: hh, d: along ? depth : w, color,
        window: isWindow ? f : undefined,
      });
    };
    // Frame at its real width around the glass; wide windows are centred over the faces they span.
    const bf = Math.max(0.05, FRAMES[h.frame]?.width_m ?? 0.12);
    const frameColor = FRAME_COLORS[h.frame] ?? "#f4f4f0";
    for (const w of validWindows(h)) {
      const d = windowDims(w);
      const shift = (windowSpan(w) - 1) / 2;
      const face = { x: w.x, z: w.z, storey: w.storey, facade: w.facade };
      placeOnFace(face, d.w, d.h, d.sill, frameColor, true, 0.52, 0.06, shift); // frame, front at 0.55
      placeOnFace(face, Math.max(0.05, d.w - 2 * bf), Math.max(0.05, d.h - 2 * bf), d.sill + bf, GLASS[h.window] ?? "#5b9bd5", true, 0.56, 0.04, shift); // glass, front at 0.58
    }
    const door = doorFace(h);
    if (door) placeOnFace(door, Math.min(0.98, h.doorW ?? 0.95), Math.min(H - 0.1, h.doorH ?? 2.3), 0, "#5a3a26", false, 0.53, 0.07);

    const roofColor = ROOF_COLORS[h.roofBuild.construction] ?? "#a8483a";
    const pvCells: { x: number; y: number; z: number }[] = [];
    if (showRoof && h.cells.size) {
      if (h.roof === "gable") {
        const { x0, x1, z0, z1 } = g.bbox;
        const half = (g.ridgeAlongX ? z1 - z0 : x1 - x0) / 2;
        for (const k of h.cells) {
          const [x, z] = parse(k);
          const d = g.ridgeAlongX ? Math.min(z - z0, z1 - 1 - z) : Math.min(x - x0, x1 - 1 - x);
          const hgt = Math.min(d + 1, half + 0.5) * 1.0;
          boxes.push({ x: x + 0.5, y: top, z: z + 0.5, w: 1.02, h: hgt, d: 1.02, color: roofColor });
          const sunny = g.ridgeAlongX ? z - z0 > (z1 - z0 - 1) / 2 : x - x0 > (x1 - x0 - 1) / 2;
          if (sunny) pvCells.push({ x, y: top + hgt, z });
        }
      } else {
        for (const k of h.cells) {
          const [x, z] = parse(k);
          boxes.push({ x: x + 0.5, y: top, z: z + 0.5, w: 1, h: 0.25, d: 1, color: roofColor });
          pvCells.push({ x, y: top + 0.25, z });
        }
      }
    }
    if (showSystems && h.cells.size) {
      pvCells.sort((a, b) => b.z - a.z || a.x - b.x);
      const panels = Math.min(pvCells.length, Math.ceil(h.pvPanels * 1.95));
      for (let i = 0; i < panels; i++) {
        const p = pvCells[i];
        boxes.push({ x: p.x + 0.5, y: p.y, z: p.z + 0.5, w: 0.92, h: 0.08, d: 0.92, color: "#1f3a6b" });
      }
      const st = Math.min(pvCells.length - panels, Math.ceil(h.solarThermal_m2));
      for (let i = 0; i < st; i++) {
        const p = pvCells[panels + i];
        boxes.push({ x: p.x + 0.5, y: p.y, z: p.z + 0.5, w: 0.92, h: 0.1, d: 0.92, color: "#2b2f36" });
      }
      const { x0, z0, z1 } = g.bbox;
      const zMid = Math.floor((z0 + z1) / 2) + 0.5;
      if (h.heating.startsWith("hp_air") || h.heating === "hp_hybrid") {
        boxes.push({ x: x0 - 0.6, y: 0, z: zMid, w: 0.5, h: 0.8, d: 0.9, color: "#e9edf2" });
        boxes.push({ x: x0 - 0.86, y: 0.2, z: zMid, w: 0.02, h: 0.45, d: 0.5, color: "#5b6170" });
      } else if (h.heating === "oil_boiler") {
        boxes.push({ x: x0 - 0.8, y: 0, z: zMid, w: 1.0, h: 0.9, d: 1.6, color: "#6b5a3e" });
      } else if (h.heating === "biomass_pellet") {
        boxes.push({ x: x0 - 0.7, y: 0, z: zMid, w: 0.9, h: 1.4, d: 0.9, color: "#b98550" });
      } else if (h.heating === "hp_ground_water") {
        boxes.push({ x: x0 - 1.2, y: -0.01, z: zMid, w: 0.4, h: 0.05, d: 0.4, color: "#5b6170" });
      }
    }

    if (this.mesh) {
      this.scene.remove(this.mesh);
      this.mesh.dispose();
    }
    const mesh = new THREE.InstancedMesh(this.geometry, this.houseMaterial, Math.max(1, boxes.length));
    const m = new THREE.Matrix4();
    const c = new THREE.Color();
    boxes.forEach((b, i) => {
      m.compose(new THREE.Vector3(b.x, b.y, b.z), new THREE.Quaternion(), new THREE.Vector3(b.w, b.h, b.d));
      mesh.setMatrixAt(i, m);
      mesh.setColorAt(i, c.set(b.color));
    });
    mesh.count = boxes.length;
    mesh.computeBoundingSphere();
    this.mesh = mesh;
    this.boxes = boxes;
    this.scene.add(mesh);
    this.drawDraft();
  }
}
