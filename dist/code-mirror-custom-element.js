class Af extends HTMLElement {
  constructor() {
    super(), this.attachShadow({ mode: "open" });
  }
}
class j {
  constructor() {
  }
  lineAt(e) {
    if (e < 0 || e > this.length)
      throw new RangeError(`Invalid position ${e} in document of length ${this.length}`);
    return this.lineInner(e, !1, 1, 0);
  }
  line(e) {
    if (e < 1 || e > this.lines)
      throw new RangeError(`Invalid line number ${e} in ${this.lines}-line document`);
    return this.lineInner(e, !0, 1, 0);
  }
  replace(e, t, i) {
    let r = [];
    return this.decompose(0, e, r, 2), i.length && i.decompose(0, i.length, r, 3), this.decompose(t, this.length, r, 1), Ge.from(r, this.length - (t - e) + i.length);
  }
  append(e) {
    return this.replace(this.length, this.length, e);
  }
  slice(e, t = this.length) {
    let i = [];
    return this.decompose(e, t, i, 0), Ge.from(i, t - e);
  }
  eq(e) {
    if (e == this)
      return !0;
    if (e.length != this.length || e.lines != this.lines)
      return !1;
    let t = this.scanIdentical(e, 1), i = this.length - this.scanIdentical(e, -1), r = new ui(this), s = new ui(e);
    for (let o = t, l = t; ; ) {
      if (r.next(o), s.next(o), o = 0, r.lineBreak != s.lineBreak || r.done != s.done || r.value != s.value)
        return !1;
      if (l += r.value.length, r.done || l >= i)
        return !0;
    }
  }
  iter(e = 1) {
    return new ui(this, e);
  }
  iterRange(e, t = this.length) {
    return new ka(this, e, t);
  }
  iterLines(e, t) {
    let i;
    if (e == null)
      i = this.iter();
    else {
      t == null && (t = this.lines + 1);
      let r = this.line(e).from;
      i = this.iterRange(r, Math.max(r, t == this.lines + 1 ? this.length : t <= 1 ? 0 : this.line(t - 1).to));
    }
    return new wa(i);
  }
  toString() {
    return this.sliceString(0);
  }
  toJSON() {
    let e = [];
    return this.flatten(e), e;
  }
  static of(e) {
    if (e.length == 0)
      throw new RangeError("A document must have at least one line");
    return e.length == 1 && !e[0] ? j.empty : e.length <= 32 ? new F(e) : Ge.from(F.split(e, []));
  }
}
class F extends j {
  constructor(e, t = Wf(e)) {
    super(), this.text = e, this.length = t;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(e, t, i, r) {
    for (let s = 0; ; s++) {
      let o = this.text[s], l = r + o.length;
      if ((t ? i : l) >= e)
        return new Xf(r, l, i, o);
      r = l + 1, i++;
    }
  }
  decompose(e, t, i, r) {
    let s = e <= 0 && t >= this.length ? this : new F(co(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (r & 1) {
      let o = i.pop(), l = Ki(s.text, o.text.slice(), 0, s.length);
      if (l.length <= 32)
        i.push(new F(l, o.length + s.length));
      else {
        let a = l.length >> 1;
        i.push(new F(l.slice(0, a)), new F(l.slice(a)));
      }
    } else
      i.push(s);
  }
  replace(e, t, i) {
    if (!(i instanceof F))
      return super.replace(e, t, i);
    let r = Ki(this.text, Ki(i.text, co(this.text, 0, e)), t), s = this.length + i.length - (t - e);
    return r.length <= 32 ? new F(r, s) : Ge.from(F.split(r, []), s);
  }
  sliceString(e, t = this.length, i = `
`) {
    let r = "";
    for (let s = 0, o = 0; s <= t && o < this.text.length; o++) {
      let l = this.text[o], a = s + l.length;
      s > e && o && (r += i), e < a && t > s && (r += l.slice(Math.max(0, e - s), t - s)), s = a + 1;
    }
    return r;
  }
  flatten(e) {
    for (let t of this.text)
      e.push(t);
  }
  scanIdentical() {
    return 0;
  }
  static split(e, t) {
    let i = [], r = -1;
    for (let s of e)
      i.push(s), r += s.length + 1, i.length == 32 && (t.push(new F(i, r)), i = [], r = -1);
    return r > -1 && t.push(new F(i, r)), t;
  }
}
class Ge extends j {
  constructor(e, t) {
    super(), this.children = e, this.length = t, this.lines = 0;
    for (let i of e)
      this.lines += i.lines;
  }
  lineInner(e, t, i, r) {
    for (let s = 0; ; s++) {
      let o = this.children[s], l = r + o.length, a = i + o.lines - 1;
      if ((t ? a : l) >= e)
        return o.lineInner(e, t, i, r);
      r = l + 1, i = a + 1;
    }
  }
  decompose(e, t, i, r) {
    for (let s = 0, o = 0; o <= t && s < this.children.length; s++) {
      let l = this.children[s], a = o + l.length;
      if (e <= a && t >= o) {
        let h = r & ((o <= e ? 1 : 0) | (a >= t ? 2 : 0));
        o >= e && a <= t && !h ? i.push(l) : l.decompose(e - o, t - o, i, h);
      }
      o = a + 1;
    }
  }
  replace(e, t, i) {
    if (i.lines < this.lines)
      for (let r = 0, s = 0; r < this.children.length; r++) {
        let o = this.children[r], l = s + o.length;
        if (e >= s && t <= l) {
          let a = o.replace(e - s, t - s, i), h = this.lines - o.lines + a.lines;
          if (a.lines < h >> 5 - 1 && a.lines > h >> 5 + 1) {
            let c = this.children.slice();
            return c[r] = a, new Ge(c, this.length - (t - e) + i.length);
          }
          return super.replace(s, l, a);
        }
        s = l + 1;
      }
    return super.replace(e, t, i);
  }
  sliceString(e, t = this.length, i = `
`) {
    let r = "";
    for (let s = 0, o = 0; s < this.children.length && o <= t; s++) {
      let l = this.children[s], a = o + l.length;
      o > e && s && (r += i), e < a && t > o && (r += l.sliceString(e - o, t - o, i)), o = a + 1;
    }
    return r;
  }
  flatten(e) {
    for (let t of this.children)
      t.flatten(e);
  }
  scanIdentical(e, t) {
    if (!(e instanceof Ge))
      return 0;
    let i = 0, [r, s, o, l] = t > 0 ? [0, 0, this.children.length, e.children.length] : [this.children.length - 1, e.children.length - 1, -1, -1];
    for (; ; r += t, s += t) {
      if (r == o || s == l)
        return i;
      let a = this.children[r], h = e.children[s];
      if (a != h)
        return i + a.scanIdentical(h, t);
      i += a.length + 1;
    }
  }
  static from(e, t = e.reduce((i, r) => i + r.length + 1, -1)) {
    let i = 0;
    for (let d of e)
      i += d.lines;
    if (i < 32) {
      let d = [];
      for (let O of e)
        O.flatten(d);
      return new F(d, t);
    }
    let r = Math.max(32, i >> 5), s = r << 1, o = r >> 1, l = [], a = 0, h = -1, c = [];
    function f(d) {
      let O;
      if (d.lines > s && d instanceof Ge)
        for (let g of d.children)
          f(g);
      else
        d.lines > o && (a > o || !a) ? (u(), l.push(d)) : d instanceof F && a && (O = c[c.length - 1]) instanceof F && d.lines + O.lines <= 32 ? (a += d.lines, h += d.length + 1, c[c.length - 1] = new F(O.text.concat(d.text), O.length + 1 + d.length)) : (a + d.lines > r && u(), a += d.lines, h += d.length + 1, c.push(d));
    }
    function u() {
      a != 0 && (l.push(c.length == 1 ? c[0] : Ge.from(c, h)), h = -1, a = c.length = 0);
    }
    for (let d of e)
      f(d);
    return u(), l.length == 1 ? l[0] : new Ge(l, t);
  }
}
j.empty = /* @__PURE__ */ new F([""], 0);
function Wf(n) {
  let e = -1;
  for (let t of n)
    e += t.length + 1;
  return e;
}
function Ki(n, e, t = 0, i = 1e9) {
  for (let r = 0, s = 0, o = !0; s < n.length && r <= i; s++) {
    let l = n[s], a = r + l.length;
    a >= t && (a > i && (l = l.slice(0, i - r)), r < t && (l = l.slice(t - r)), o ? (e[e.length - 1] += l, o = !1) : e.push(l)), r = a + 1;
  }
  return e;
}
function co(n, e, t) {
  return Ki(n, [""], e, t);
}
class ui {
  constructor(e, t = 1) {
    this.dir = t, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [e], this.offsets = [t > 0 ? 1 : (e instanceof F ? e.text.length : e.children.length) << 1];
  }
  nextInner(e, t) {
    for (this.done = this.lineBreak = !1; ; ) {
      let i = this.nodes.length - 1, r = this.nodes[i], s = this.offsets[i], o = s >> 1, l = r instanceof F ? r.text.length : r.children.length;
      if (o == (t > 0 ? l : 0)) {
        if (i == 0)
          return this.done = !0, this.value = "", this;
        t > 0 && this.offsets[i - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((s & 1) == (t > 0 ? 0 : 1)) {
        if (this.offsets[i] += t, e == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        e--;
      } else if (r instanceof F) {
        let a = r.text[o + (t < 0 ? -1 : 0)];
        if (this.offsets[i] += t, a.length > Math.max(0, e))
          return this.value = e == 0 ? a : t > 0 ? a.slice(e) : a.slice(0, a.length - e), this;
        e -= a.length;
      } else {
        let a = r.children[o + (t < 0 ? -1 : 0)];
        e > a.length ? (e -= a.length, this.offsets[i] += t) : (t < 0 && this.offsets[i]--, this.nodes.push(a), this.offsets.push(t > 0 ? 1 : (a instanceof F ? a.text.length : a.children.length) << 1));
      }
    }
  }
  next(e = 0) {
    return e < 0 && (this.nextInner(-e, -this.dir), e = this.value.length), this.nextInner(e, this.dir);
  }
}
class ka {
  constructor(e, t, i) {
    this.value = "", this.done = !1, this.cursor = new ui(e, t > i ? -1 : 1), this.pos = t > i ? e.length : 0, this.from = Math.min(t, i), this.to = Math.max(t, i);
  }
  nextInner(e, t) {
    if (t < 0 ? this.pos <= this.from : this.pos >= this.to)
      return this.value = "", this.done = !0, this;
    e += Math.max(0, t < 0 ? this.pos - this.to : this.from - this.pos);
    let i = t < 0 ? this.pos - this.from : this.to - this.pos;
    e > i && (e = i), i -= e;
    let { value: r } = this.cursor.next(e);
    return this.pos += (r.length + e) * t, this.value = r.length <= i ? r : t < 0 ? r.slice(r.length - i) : r.slice(0, i), this.done = !this.value, this;
  }
  next(e = 0) {
    return e < 0 ? e = Math.max(e, this.from - this.pos) : e > 0 && (e = Math.min(e, this.to - this.pos)), this.nextInner(e, this.cursor.dir);
  }
  get lineBreak() {
    return this.cursor.lineBreak && this.value != "";
  }
}
class wa {
  constructor(e) {
    this.inner = e, this.afterBreak = !0, this.value = "", this.done = !1;
  }
  next(e = 0) {
    let { done: t, lineBreak: i, value: r } = this.inner.next(e);
    return t ? (this.done = !0, this.value = "") : i ? this.afterBreak ? this.value = "" : (this.afterBreak = !0, this.next()) : (this.value = r, this.afterBreak = !1), this;
  }
  get lineBreak() {
    return !1;
  }
}
typeof Symbol < "u" && (j.prototype[Symbol.iterator] = function() {
  return this.iter();
}, ui.prototype[Symbol.iterator] = ka.prototype[Symbol.iterator] = wa.prototype[Symbol.iterator] = function() {
  return this;
});
class Xf {
  constructor(e, t, i, r) {
    this.from = e, this.to = t, this.number = i, this.text = r;
  }
  get length() {
    return this.to - this.from;
  }
}
let qt = /* @__PURE__ */ "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((n) => n ? parseInt(n, 36) : 1);
for (let n = 1; n < qt.length; n++)
  qt[n] += qt[n - 1];
function Zf(n) {
  for (let e = 1; e < qt.length; e += 2)
    if (qt[e] > n)
      return qt[e - 1] <= n;
  return !1;
}
function fo(n) {
  return n >= 127462 && n <= 127487;
}
const uo = 8205;
function ke(n, e, t = !0, i = !0) {
  return (t ? Ta : Df)(n, e, i);
}
function Ta(n, e, t) {
  if (e == n.length)
    return e;
  e && va(n.charCodeAt(e)) && Pa(n.charCodeAt(e - 1)) && e--;
  let i = ne(n, e);
  for (e += xe(i); e < n.length; ) {
    let r = ne(n, e);
    if (i == uo || r == uo || t && Zf(r))
      e += xe(r), i = r;
    else if (fo(r)) {
      let s = 0, o = e - 2;
      for (; o >= 0 && fo(ne(n, o)); )
        s++, o -= 2;
      if (s % 2 == 0)
        break;
      e += 2;
    } else
      break;
  }
  return e;
}
function Df(n, e, t) {
  for (; e > 0; ) {
    let i = Ta(n, e - 2, t);
    if (i < e)
      return i;
    e--;
  }
  return 0;
}
function va(n) {
  return n >= 56320 && n < 57344;
}
function Pa(n) {
  return n >= 55296 && n < 56320;
}
function ne(n, e) {
  let t = n.charCodeAt(e);
  if (!Pa(t) || e + 1 == n.length)
    return t;
  let i = n.charCodeAt(e + 1);
  return va(i) ? (t - 55296 << 10) + (i - 56320) + 65536 : t;
}
function As(n) {
  return n <= 65535 ? String.fromCharCode(n) : (n -= 65536, String.fromCharCode((n >> 10) + 55296, (n & 1023) + 56320));
}
function xe(n) {
  return n < 65536 ? 1 : 2;
}
const _r = /\r\n?|\n/;
var ae = /* @__PURE__ */ function(n) {
  return n[n.Simple = 0] = "Simple", n[n.TrackDel = 1] = "TrackDel", n[n.TrackBefore = 2] = "TrackBefore", n[n.TrackAfter = 3] = "TrackAfter", n;
}(ae || (ae = {}));
class Le {
  constructor(e) {
    this.sections = e;
  }
  get length() {
    let e = 0;
    for (let t = 0; t < this.sections.length; t += 2)
      e += this.sections[t];
    return e;
  }
  get newLength() {
    let e = 0;
    for (let t = 0; t < this.sections.length; t += 2) {
      let i = this.sections[t + 1];
      e += i < 0 ? this.sections[t] : i;
    }
    return e;
  }
  get empty() {
    return this.sections.length == 0 || this.sections.length == 2 && this.sections[1] < 0;
  }
  iterGaps(e) {
    for (let t = 0, i = 0, r = 0; t < this.sections.length; ) {
      let s = this.sections[t++], o = this.sections[t++];
      o < 0 ? (e(i, r, s), r += s) : r += o, i += s;
    }
  }
  iterChangedRanges(e, t = !1) {
    Ir(this, e, t);
  }
  get invertedDesc() {
    let e = [];
    for (let t = 0; t < this.sections.length; ) {
      let i = this.sections[t++], r = this.sections[t++];
      r < 0 ? e.push(i, r) : e.push(r, i);
    }
    return new Le(e);
  }
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : Ra(this, e);
  }
  mapDesc(e, t = !1) {
    return e.empty ? this : Gr(this, e, t);
  }
  mapPos(e, t = -1, i = ae.Simple) {
    let r = 0, s = 0;
    for (let o = 0; o < this.sections.length; ) {
      let l = this.sections[o++], a = this.sections[o++], h = r + l;
      if (a < 0) {
        if (h > e)
          return s + (e - r);
        s += l;
      } else {
        if (i != ae.Simple && h >= e && (i == ae.TrackDel && r < e && h > e || i == ae.TrackBefore && r < e || i == ae.TrackAfter && h > e))
          return null;
        if (h > e || h == e && t < 0 && !l)
          return e == r || t < 0 ? s : s + a;
        s += a;
      }
      r = h;
    }
    if (e > r)
      throw new RangeError(`Position ${e} is out of range for changeset of length ${r}`);
    return s;
  }
  touchesRange(e, t = e) {
    for (let i = 0, r = 0; i < this.sections.length && r <= t; ) {
      let s = this.sections[i++], o = this.sections[i++], l = r + s;
      if (o >= 0 && r <= t && l >= e)
        return r < e && l > t ? "cover" : !0;
      r = l;
    }
    return !1;
  }
  toString() {
    let e = "";
    for (let t = 0; t < this.sections.length; ) {
      let i = this.sections[t++], r = this.sections[t++];
      e += (e ? " " : "") + i + (r >= 0 ? ":" + r : "");
    }
    return e;
  }
  toJSON() {
    return this.sections;
  }
  static fromJSON(e) {
    if (!Array.isArray(e) || e.length % 2 || e.some((t) => typeof t != "number"))
      throw new RangeError("Invalid JSON representation of ChangeDesc");
    return new Le(e);
  }
  static create(e) {
    return new Le(e);
  }
}
class J extends Le {
  constructor(e, t) {
    super(e), this.inserted = t;
  }
  apply(e) {
    if (this.length != e.length)
      throw new RangeError("Applying change set to a document with the wrong length");
    return Ir(this, (t, i, r, s, o) => e = e.replace(r, r + (i - t), o), !1), e;
  }
  mapDesc(e, t = !1) {
    return Gr(this, e, t, !0);
  }
  invert(e) {
    let t = this.sections.slice(), i = [];
    for (let r = 0, s = 0; r < t.length; r += 2) {
      let o = t[r], l = t[r + 1];
      if (l >= 0) {
        t[r] = l, t[r + 1] = o;
        let a = r >> 1;
        for (; i.length < a; )
          i.push(j.empty);
        i.push(o ? e.slice(s, s + o) : j.empty);
      }
      s += o;
    }
    return new J(t, i);
  }
  compose(e) {
    return this.empty ? e : e.empty ? this : Ra(this, e, !0);
  }
  map(e, t = !1) {
    return e.empty ? this : Gr(this, e, t, !0);
  }
  iterChanges(e, t = !1) {
    Ir(this, e, t);
  }
  get desc() {
    return Le.create(this.sections);
  }
  filter(e) {
    let t = [], i = [], r = [], s = new Qi(this);
    e:
      for (let o = 0, l = 0; ; ) {
        let a = o == e.length ? 1e9 : e[o++];
        for (; l < a || l == a && s.len == 0; ) {
          if (s.done)
            break e;
          let c = Math.min(s.len, a - l);
          le(r, c, -1);
          let f = s.ins == -1 ? -1 : s.off == 0 ? s.ins : 0;
          le(t, c, f), f > 0 && at(i, t, s.text), s.forward(c), l += c;
        }
        let h = e[o++];
        for (; l < h; ) {
          if (s.done)
            break e;
          let c = Math.min(s.len, h - l);
          le(t, c, -1), le(r, c, s.ins == -1 ? -1 : s.off == 0 ? s.ins : 0), s.forward(c), l += c;
        }
      }
    return {
      changes: new J(t, i),
      filtered: Le.create(r)
    };
  }
  toJSON() {
    let e = [];
    for (let t = 0; t < this.sections.length; t += 2) {
      let i = this.sections[t], r = this.sections[t + 1];
      r < 0 ? e.push(i) : r == 0 ? e.push([i]) : e.push([i].concat(this.inserted[t >> 1].toJSON()));
    }
    return e;
  }
  static of(e, t, i) {
    let r = [], s = [], o = 0, l = null;
    function a(c = !1) {
      if (!c && !r.length)
        return;
      o < t && le(r, t - o, -1);
      let f = new J(r, s);
      l = l ? l.compose(f.map(l)) : f, r = [], s = [], o = 0;
    }
    function h(c) {
      if (Array.isArray(c))
        for (let f of c)
          h(f);
      else if (c instanceof J) {
        if (c.length != t)
          throw new RangeError(`Mismatched change set length (got ${c.length}, expected ${t})`);
        a(), l = l ? l.compose(c.map(l)) : c;
      } else {
        let { from: f, to: u = f, insert: d } = c;
        if (f > u || f < 0 || u > t)
          throw new RangeError(`Invalid change range ${f} to ${u} (in doc of length ${t})`);
        let O = d ? typeof d == "string" ? j.of(d.split(i || _r)) : d : j.empty, g = O.length;
        if (f == u && g == 0)
          return;
        f < o && a(), f > o && le(r, f - o, -1), le(r, u - f, g), at(s, r, O), o = u;
      }
    }
    return h(e), a(!l), l;
  }
  static empty(e) {
    return new J(e ? [e, -1] : [], []);
  }
  static fromJSON(e) {
    if (!Array.isArray(e))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let t = [], i = [];
    for (let r = 0; r < e.length; r++) {
      let s = e[r];
      if (typeof s == "number")
        t.push(s, -1);
      else {
        if (!Array.isArray(s) || typeof s[0] != "number" || s.some((o, l) => l && typeof o != "string"))
          throw new RangeError("Invalid JSON representation of ChangeSet");
        if (s.length == 1)
          t.push(s[0], 0);
        else {
          for (; i.length < r; )
            i.push(j.empty);
          i[r] = j.of(s.slice(1)), t.push(s[0], i[r].length);
        }
      }
    }
    return new J(t, i);
  }
  static createSet(e, t) {
    return new J(e, t);
  }
}
function le(n, e, t, i = !1) {
  if (e == 0 && t <= 0)
    return;
  let r = n.length - 2;
  r >= 0 && t <= 0 && t == n[r + 1] ? n[r] += e : e == 0 && n[r] == 0 ? n[r + 1] += t : i ? (n[r] += e, n[r + 1] += t) : n.push(e, t);
}
function at(n, e, t) {
  if (t.length == 0)
    return;
  let i = e.length - 2 >> 1;
  if (i < n.length)
    n[n.length - 1] = n[n.length - 1].append(t);
  else {
    for (; n.length < i; )
      n.push(j.empty);
    n.push(t);
  }
}
function Ir(n, e, t) {
  let i = n.inserted;
  for (let r = 0, s = 0, o = 0; o < n.sections.length; ) {
    let l = n.sections[o++], a = n.sections[o++];
    if (a < 0)
      r += l, s += l;
    else {
      let h = r, c = s, f = j.empty;
      for (; h += l, c += a, a && i && (f = f.append(i[o - 2 >> 1])), !(t || o == n.sections.length || n.sections[o + 1] < 0); )
        l = n.sections[o++], a = n.sections[o++];
      e(r, h, s, c, f), r = h, s = c;
    }
  }
}
function Gr(n, e, t, i = !1) {
  let r = [], s = i ? [] : null, o = new Qi(n), l = new Qi(e);
  for (let a = -1; ; )
    if (o.ins == -1 && l.ins == -1) {
      let h = Math.min(o.len, l.len);
      le(r, h, -1), o.forward(h), l.forward(h);
    } else if (l.ins >= 0 && (o.ins < 0 || a == o.i || o.off == 0 && (l.len < o.len || l.len == o.len && !t))) {
      let h = l.len;
      for (le(r, l.ins, -1); h; ) {
        let c = Math.min(o.len, h);
        o.ins >= 0 && a < o.i && o.len <= c && (le(r, 0, o.ins), s && at(s, r, o.text), a = o.i), o.forward(c), h -= c;
      }
      l.next();
    } else if (o.ins >= 0) {
      let h = 0, c = o.len;
      for (; c; )
        if (l.ins == -1) {
          let f = Math.min(c, l.len);
          h += f, c -= f, l.forward(f);
        } else if (l.ins == 0 && l.len < c)
          c -= l.len, l.next();
        else
          break;
      le(r, h, a < o.i ? o.ins : 0), s && a < o.i && at(s, r, o.text), a = o.i, o.forward(o.len - c);
    } else {
      if (o.done && l.done)
        return s ? J.createSet(r, s) : Le.create(r);
      throw new Error("Mismatched change set lengths");
    }
}
function Ra(n, e, t = !1) {
  let i = [], r = t ? [] : null, s = new Qi(n), o = new Qi(e);
  for (let l = !1; ; ) {
    if (s.done && o.done)
      return r ? J.createSet(i, r) : Le.create(i);
    if (s.ins == 0)
      le(i, s.len, 0, l), s.next();
    else if (o.len == 0 && !o.done)
      le(i, 0, o.ins, l), r && at(r, i, o.text), o.next();
    else {
      if (s.done || o.done)
        throw new Error("Mismatched change set lengths");
      {
        let a = Math.min(s.len2, o.len), h = i.length;
        if (s.ins == -1) {
          let c = o.ins == -1 ? -1 : o.off ? 0 : o.ins;
          le(i, a, c, l), r && c && at(r, i, o.text);
        } else
          o.ins == -1 ? (le(i, s.off ? 0 : s.len, a, l), r && at(r, i, s.textBit(a))) : (le(i, s.off ? 0 : s.len, o.off ? 0 : o.ins, l), r && !o.off && at(r, i, o.text));
        l = (s.ins > a || o.ins >= 0 && o.len > a) && (l || i.length > h), s.forward2(a), o.forward(a);
      }
    }
  }
}
class Qi {
  constructor(e) {
    this.set = e, this.i = 0, this.next();
  }
  next() {
    let { sections: e } = this.set;
    this.i < e.length ? (this.len = e[this.i++], this.ins = e[this.i++]) : (this.len = 0, this.ins = -2), this.off = 0;
  }
  get done() {
    return this.ins == -2;
  }
  get len2() {
    return this.ins < 0 ? this.len : this.ins;
  }
  get text() {
    let { inserted: e } = this.set, t = this.i - 2 >> 1;
    return t >= e.length ? j.empty : e[t];
  }
  textBit(e) {
    let { inserted: t } = this.set, i = this.i - 2 >> 1;
    return i >= t.length && !e ? j.empty : t[i].slice(this.off, e == null ? void 0 : this.off + e);
  }
  forward(e) {
    e == this.len ? this.next() : (this.len -= e, this.off += e);
  }
  forward2(e) {
    this.ins == -1 ? this.forward(e) : e == this.ins ? this.next() : (this.ins -= e, this.off += e);
  }
}
class kt {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.flags = i;
  }
  get anchor() {
    return this.flags & 16 ? this.to : this.from;
  }
  get head() {
    return this.flags & 16 ? this.from : this.to;
  }
  get empty() {
    return this.from == this.to;
  }
  get assoc() {
    return this.flags & 4 ? -1 : this.flags & 8 ? 1 : 0;
  }
  get bidiLevel() {
    let e = this.flags & 3;
    return e == 3 ? null : e;
  }
  get goalColumn() {
    let e = this.flags >> 5;
    return e == 33554431 ? void 0 : e;
  }
  map(e, t = -1) {
    let i, r;
    return this.empty ? i = r = e.mapPos(this.from, t) : (i = e.mapPos(this.from, 1), r = e.mapPos(this.to, -1)), i == this.from && r == this.to ? this : new kt(i, r, this.flags);
  }
  extend(e, t = e) {
    if (e <= this.anchor && t >= this.anchor)
      return m.range(e, t);
    let i = Math.abs(e - this.anchor) > Math.abs(t - this.anchor) ? e : t;
    return m.range(this.anchor, i);
  }
  eq(e) {
    return this.anchor == e.anchor && this.head == e.head;
  }
  toJSON() {
    return { anchor: this.anchor, head: this.head };
  }
  static fromJSON(e) {
    if (!e || typeof e.anchor != "number" || typeof e.head != "number")
      throw new RangeError("Invalid JSON representation for SelectionRange");
    return m.range(e.anchor, e.head);
  }
  static create(e, t, i) {
    return new kt(e, t, i);
  }
}
class m {
  constructor(e, t) {
    this.ranges = e, this.mainIndex = t;
  }
  map(e, t = -1) {
    return e.empty ? this : m.create(this.ranges.map((i) => i.map(e, t)), this.mainIndex);
  }
  eq(e) {
    if (this.ranges.length != e.ranges.length || this.mainIndex != e.mainIndex)
      return !1;
    for (let t = 0; t < this.ranges.length; t++)
      if (!this.ranges[t].eq(e.ranges[t]))
        return !1;
    return !0;
  }
  get main() {
    return this.ranges[this.mainIndex];
  }
  asSingle() {
    return this.ranges.length == 1 ? this : new m([this.main], 0);
  }
  addRange(e, t = !0) {
    return m.create([e].concat(this.ranges), t ? 0 : this.mainIndex + 1);
  }
  replaceRange(e, t = this.mainIndex) {
    let i = this.ranges.slice();
    return i[t] = e, m.create(i, this.mainIndex);
  }
  toJSON() {
    return { ranges: this.ranges.map((e) => e.toJSON()), main: this.mainIndex };
  }
  static fromJSON(e) {
    if (!e || !Array.isArray(e.ranges) || typeof e.main != "number" || e.main >= e.ranges.length)
      throw new RangeError("Invalid JSON representation for EditorSelection");
    return new m(e.ranges.map((t) => kt.fromJSON(t)), e.main);
  }
  static single(e, t = e) {
    return new m([m.range(e, t)], 0);
  }
  static create(e, t = 0) {
    if (e.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let i = 0, r = 0; r < e.length; r++) {
      let s = e[r];
      if (s.empty ? s.from <= i : s.from < i)
        return m.normalized(e.slice(), t);
      i = s.to;
    }
    return new m(e, t);
  }
  static cursor(e, t = 0, i, r) {
    return kt.create(e, e, (t == 0 ? 0 : t < 0 ? 4 : 8) | (i == null ? 3 : Math.min(2, i)) | (r != null ? r : 33554431) << 5);
  }
  static range(e, t, i) {
    let r = (i != null ? i : 33554431) << 5;
    return t < e ? kt.create(t, e, 16 | r | 8) : kt.create(e, t, r | (t > e ? 4 : 0));
  }
  static normalized(e, t = 0) {
    let i = e[t];
    e.sort((r, s) => r.from - s.from), t = e.indexOf(i);
    for (let r = 1; r < e.length; r++) {
      let s = e[r], o = e[r - 1];
      if (s.empty ? s.from <= o.to : s.from < o.to) {
        let l = o.from, a = Math.max(s.to, o.to);
        r <= t && t--, e.splice(--r, 2, s.anchor > s.head ? m.range(a, l) : m.range(l, a));
      }
    }
    return new m(e, t);
  }
}
function Ca(n, e) {
  for (let t of n.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let Ws = 0;
class v {
  constructor(e, t, i, r, s) {
    this.combine = e, this.compareInput = t, this.compare = i, this.isStatic = r, this.id = Ws++, this.default = e([]), this.extensions = typeof s == "function" ? s(this) : s;
  }
  static define(e = {}) {
    return new v(e.combine || ((t) => t), e.compareInput || ((t, i) => t === i), e.compare || (e.combine ? (t, i) => t === i : Xs), !!e.static, e.enables);
  }
  of(e) {
    return new en([], this, 0, e);
  }
  compute(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new en(e, this, 1, t);
  }
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new en(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (i) => i), this.compute([e], (i) => t(i.field(e)));
  }
}
function Xs(n, e) {
  return n == e || n.length == e.length && n.every((t, i) => t === e[i]);
}
class en {
  constructor(e, t, i, r) {
    this.dependencies = e, this.facet = t, this.type = i, this.value = r, this.id = Ws++;
  }
  dynamicSlot(e) {
    var t;
    let i = this.value, r = this.facet.compareInput, s = this.id, o = e[s] >> 1, l = this.type == 2, a = !1, h = !1, c = [];
    for (let f of this.dependencies)
      f == "doc" ? a = !0 : f == "selection" ? h = !0 : (((t = e[f.id]) !== null && t !== void 0 ? t : 1) & 1) == 0 && c.push(e[f.id]);
    return {
      create(f) {
        return f.values[o] = i(f), 1;
      },
      update(f, u) {
        if (a && u.docChanged || h && (u.docChanged || u.selection) || Vr(f, c)) {
          let d = i(f);
          if (l ? !Oo(d, f.values[o], r) : !r(d, f.values[o]))
            return f.values[o] = d, 1;
        }
        return 0;
      },
      reconfigure: (f, u) => {
        let d = i(f), O = u.config.address[s];
        if (O != null) {
          let g = un(u, O);
          if (this.dependencies.every((Q) => Q instanceof v ? u.facet(Q) === f.facet(Q) : Q instanceof Oe ? u.field(Q, !1) == f.field(Q, !1) : !0) || (l ? Oo(d, g, r) : r(d, g)))
            return f.values[o] = g, 0;
        }
        return f.values[o] = d, 1;
      }
    };
  }
}
function Oo(n, e, t) {
  if (n.length != e.length)
    return !1;
  for (let i = 0; i < n.length; i++)
    if (!t(n[i], e[i]))
      return !1;
  return !0;
}
function Vr(n, e) {
  let t = !1;
  for (let i of e)
    di(n, i) & 1 && (t = !0);
  return t;
}
function Mf(n, e, t) {
  let i = t.map((a) => n[a.id]), r = t.map((a) => a.type), s = i.filter((a) => !(a & 1)), o = n[e.id] >> 1;
  function l(a) {
    let h = [];
    for (let c = 0; c < i.length; c++) {
      let f = un(a, i[c]);
      if (r[c] == 2)
        for (let u of f)
          h.push(u);
      else
        h.push(f);
    }
    return e.combine(h);
  }
  return {
    create(a) {
      for (let h of i)
        di(a, h);
      return a.values[o] = l(a), 1;
    },
    update(a, h) {
      if (!Vr(a, s))
        return 0;
      let c = l(a);
      return e.compare(c, a.values[o]) ? 0 : (a.values[o] = c, 1);
    },
    reconfigure(a, h) {
      let c = Vr(a, i), f = h.config.facets[e.id], u = h.facet(e);
      if (f && !c && Xs(t, f))
        return a.values[o] = u, 0;
      let d = l(a);
      return e.compare(d, u) ? (a.values[o] = u, 0) : (a.values[o] = d, 1);
    }
  };
}
const po = /* @__PURE__ */ v.define({ static: !0 });
class Oe {
  constructor(e, t, i, r, s) {
    this.id = e, this.createF = t, this.updateF = i, this.compareF = r, this.spec = s, this.provides = void 0;
  }
  static define(e) {
    let t = new Oe(Ws++, e.create, e.update, e.compare || ((i, r) => i === r), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(po).find((i) => i.field == this);
    return ((t == null ? void 0 : t.create) || this.createF)(e);
  }
  slot(e) {
    let t = e[this.id] >> 1;
    return {
      create: (i) => (i.values[t] = this.create(i), 1),
      update: (i, r) => {
        let s = i.values[t], o = this.updateF(s, r);
        return this.compareF(s, o) ? 0 : (i.values[t] = o, 1);
      },
      reconfigure: (i, r) => r.config.address[this.id] != null ? (i.values[t] = r.field(this), 0) : (i.values[t] = this.create(i), 1)
    };
  }
  init(e) {
    return [this, po.of({ field: this, create: e })];
  }
  get extension() {
    return this;
  }
}
const Dt = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function ti(n) {
  return (e) => new Aa(e, n);
}
const Ct = {
  highest: /* @__PURE__ */ ti(Dt.highest),
  high: /* @__PURE__ */ ti(Dt.high),
  default: /* @__PURE__ */ ti(Dt.default),
  low: /* @__PURE__ */ ti(Dt.low),
  lowest: /* @__PURE__ */ ti(Dt.lowest)
};
class Aa {
  constructor(e, t) {
    this.inner = e, this.prec = t;
  }
}
class En {
  of(e) {
    return new Nr(this, e);
  }
  reconfigure(e) {
    return En.reconfigure.of({ compartment: this, extension: e });
  }
  get(e) {
    return e.config.compartments.get(this);
  }
}
class Nr {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
}
class fn {
  constructor(e, t, i, r, s, o) {
    for (this.base = e, this.compartments = t, this.dynamicSlots = i, this.address = r, this.staticValues = s, this.facets = o, this.statusTemplate = []; this.statusTemplate.length < i.length; )
      this.statusTemplate.push(0);
  }
  staticFacet(e) {
    let t = this.address[e.id];
    return t == null ? e.default : this.staticValues[t >> 1];
  }
  static resolve(e, t, i) {
    let r = [], s = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ new Map();
    for (let u of jf(e, t, o))
      u instanceof Oe ? r.push(u) : (s[u.facet.id] || (s[u.facet.id] = [])).push(u);
    let l = /* @__PURE__ */ Object.create(null), a = [], h = [];
    for (let u of r)
      l[u.id] = h.length << 1, h.push((d) => u.slot(d));
    let c = i == null ? void 0 : i.config.facets;
    for (let u in s) {
      let d = s[u], O = d[0].facet, g = c && c[u] || [];
      if (d.every((Q) => Q.type == 0))
        if (l[O.id] = a.length << 1 | 1, Xs(g, d))
          a.push(i.facet(O));
        else {
          let Q = O.combine(d.map((b) => b.value));
          a.push(i && O.compare(Q, i.facet(O)) ? i.facet(O) : Q);
        }
      else {
        for (let Q of d)
          Q.type == 0 ? (l[Q.id] = a.length << 1 | 1, a.push(Q.value)) : (l[Q.id] = h.length << 1, h.push((b) => Q.dynamicSlot(b)));
        l[O.id] = h.length << 1, h.push((Q) => Mf(Q, O, d));
      }
    }
    let f = h.map((u) => u(l));
    return new fn(e, o, f, l, a, s);
  }
}
function jf(n, e, t) {
  let i = [[], [], [], [], []], r = /* @__PURE__ */ new Map();
  function s(o, l) {
    let a = r.get(o);
    if (a != null) {
      if (a <= l)
        return;
      let h = i[a].indexOf(o);
      h > -1 && i[a].splice(h, 1), o instanceof Nr && t.delete(o.compartment);
    }
    if (r.set(o, l), Array.isArray(o))
      for (let h of o)
        s(h, l);
    else if (o instanceof Nr) {
      if (t.has(o.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let h = e.get(o.compartment) || o.inner;
      t.set(o.compartment, h), s(h, l);
    } else if (o instanceof Aa)
      s(o.inner, o.prec);
    else if (o instanceof Oe)
      i[l].push(o), o.provides && s(o.provides, l);
    else if (o instanceof en)
      i[l].push(o), o.facet.extensions && s(o.facet.extensions, l);
    else {
      let h = o.extension;
      if (!h)
        throw new Error(`Unrecognized extension value in extension set (${o}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      s(h, l);
    }
  }
  return s(n, Dt.default), i.reduce((o, l) => o.concat(l));
}
function di(n, e) {
  if (e & 1)
    return 2;
  let t = e >> 1, i = n.status[t];
  if (i == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (i & 2)
    return i;
  n.status[t] = 4;
  let r = n.computeSlot(n, n.config.dynamicSlots[t]);
  return n.status[t] = 2 | r;
}
function un(n, e) {
  return e & 1 ? n.config.staticValues[e >> 1] : n.values[e >> 1];
}
const Wa = /* @__PURE__ */ v.define(), Xa = /* @__PURE__ */ v.define({
  combine: (n) => n.some((e) => e),
  static: !0
}), Za = /* @__PURE__ */ v.define({
  combine: (n) => n.length ? n[0] : void 0,
  static: !0
}), Da = /* @__PURE__ */ v.define(), Ma = /* @__PURE__ */ v.define(), ja = /* @__PURE__ */ v.define(), za = /* @__PURE__ */ v.define({
  combine: (n) => n.length ? n[0] : !1
});
class At {
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  static define() {
    return new zf();
  }
}
class zf {
  of(e) {
    return new At(this, e);
  }
}
class qf {
  constructor(e) {
    this.map = e;
  }
  of(e) {
    return new Z(this, e);
  }
}
class Z {
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  map(e) {
    let t = this.type.map(this.value, e);
    return t === void 0 ? void 0 : t == this.value ? this : new Z(this.type, t);
  }
  is(e) {
    return this.type == e;
  }
  static define(e = {}) {
    return new qf(e.map || ((t) => t));
  }
  static mapEffects(e, t) {
    if (!e.length)
      return e;
    let i = [];
    for (let r of e) {
      let s = r.map(t);
      s && i.push(s);
    }
    return i;
  }
}
Z.reconfigure = /* @__PURE__ */ Z.define();
Z.appendConfig = /* @__PURE__ */ Z.define();
class K {
  constructor(e, t, i, r, s, o) {
    this.startState = e, this.changes = t, this.selection = i, this.effects = r, this.annotations = s, this.scrollIntoView = o, this._doc = null, this._state = null, i && Ca(i, t.newLength), s.some((l) => l.type == K.time) || (this.annotations = s.concat(K.time.of(Date.now())));
  }
  static create(e, t, i, r, s, o) {
    return new K(e, t, i, r, s, o);
  }
  get newDoc() {
    return this._doc || (this._doc = this.changes.apply(this.startState.doc));
  }
  get newSelection() {
    return this.selection || this.startState.selection.map(this.changes);
  }
  get state() {
    return this._state || this.startState.applyTransaction(this), this._state;
  }
  annotation(e) {
    for (let t of this.annotations)
      if (t.type == e)
        return t.value;
  }
  get docChanged() {
    return !this.changes.empty;
  }
  get reconfigured() {
    return this.startState.config != this.state.config;
  }
  isUserEvent(e) {
    let t = this.annotation(K.userEvent);
    return !!(t && (t == e || t.length > e.length && t.slice(0, e.length) == e && t[e.length] == "."));
  }
}
K.time = /* @__PURE__ */ At.define();
K.userEvent = /* @__PURE__ */ At.define();
K.addToHistory = /* @__PURE__ */ At.define();
K.remote = /* @__PURE__ */ At.define();
function Ef(n, e) {
  let t = [];
  for (let i = 0, r = 0; ; ) {
    let s, o;
    if (i < n.length && (r == e.length || e[r] >= n[i]))
      s = n[i++], o = n[i++];
    else if (r < e.length)
      s = e[r++], o = e[r++];
    else
      return t;
    !t.length || t[t.length - 1] < s ? t.push(s, o) : t[t.length - 1] < o && (t[t.length - 1] = o);
  }
}
function qa(n, e, t) {
  var i;
  let r, s, o;
  return t ? (r = e.changes, s = J.empty(e.changes.length), o = n.changes.compose(e.changes)) : (r = e.changes.map(n.changes), s = n.changes.mapDesc(e.changes, !0), o = n.changes.compose(r)), {
    changes: o,
    selection: e.selection ? e.selection.map(s) : (i = n.selection) === null || i === void 0 ? void 0 : i.map(r),
    effects: Z.mapEffects(n.effects, r).concat(Z.mapEffects(e.effects, s)),
    annotations: n.annotations.length ? n.annotations.concat(e.annotations) : e.annotations,
    scrollIntoView: n.scrollIntoView || e.scrollIntoView
  };
}
function Br(n, e, t) {
  let i = e.selection, r = Et(e.annotations);
  return e.userEvent && (r = r.concat(K.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof J ? e.changes : J.of(e.changes || [], t, n.facet(Za)),
    selection: i && (i instanceof m ? i : m.single(i.anchor, i.head)),
    effects: Et(e.effects),
    annotations: r,
    scrollIntoView: !!e.scrollIntoView
  };
}
function Ea(n, e, t) {
  let i = Br(n, e.length ? e[0] : {}, n.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let s = 1; s < e.length; s++) {
    e[s].filter === !1 && (t = !1);
    let o = !!e[s].sequential;
    i = qa(i, Br(n, e[s], o ? i.changes.newLength : n.doc.length), o);
  }
  let r = K.create(n, i.changes, i.selection, i.effects, i.annotations, i.scrollIntoView);
  return If(t ? _f(r) : r);
}
function _f(n) {
  let e = n.startState, t = !0;
  for (let r of e.facet(Da)) {
    let s = r(n);
    if (s === !1) {
      t = !1;
      break;
    }
    Array.isArray(s) && (t = t === !0 ? s : Ef(t, s));
  }
  if (t !== !0) {
    let r, s;
    if (t === !1)
      s = n.changes.invertedDesc, r = J.empty(e.doc.length);
    else {
      let o = n.changes.filter(t);
      r = o.changes, s = o.filtered.mapDesc(o.changes).invertedDesc;
    }
    n = K.create(e, r, n.selection && n.selection.map(s), Z.mapEffects(n.effects, s), n.annotations, n.scrollIntoView);
  }
  let i = e.facet(Ma);
  for (let r = i.length - 1; r >= 0; r--) {
    let s = i[r](n);
    s instanceof K ? n = s : Array.isArray(s) && s.length == 1 && s[0] instanceof K ? n = s[0] : n = Ea(e, Et(s), !1);
  }
  return n;
}
function If(n) {
  let e = n.startState, t = e.facet(ja), i = n;
  for (let r = t.length - 1; r >= 0; r--) {
    let s = t[r](n);
    s && Object.keys(s).length && (i = qa(n, Br(e, s, n.changes.newLength), !0));
  }
  return i == n ? n : K.create(e, n.changes, n.selection, i.effects, i.annotations, i.scrollIntoView);
}
const Gf = [];
function Et(n) {
  return n == null ? Gf : Array.isArray(n) ? n : [n];
}
var fe = /* @__PURE__ */ function(n) {
  return n[n.Word = 0] = "Word", n[n.Space = 1] = "Space", n[n.Other = 2] = "Other", n;
}(fe || (fe = {}));
const Vf = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let Lr;
try {
  Lr = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function Nf(n) {
  if (Lr)
    return Lr.test(n);
  for (let e = 0; e < n.length; e++) {
    let t = n[e];
    if (/\w/.test(t) || t > "\x80" && (t.toUpperCase() != t.toLowerCase() || Vf.test(t)))
      return !0;
  }
  return !1;
}
function Bf(n) {
  return (e) => {
    if (!/\S/.test(e))
      return fe.Space;
    if (Nf(e))
      return fe.Word;
    for (let t = 0; t < n.length; t++)
      if (e.indexOf(n[t]) > -1)
        return fe.Word;
    return fe.Other;
  };
}
class M {
  constructor(e, t, i, r, s, o) {
    this.config = e, this.doc = t, this.selection = i, this.values = r, this.status = e.statusTemplate.slice(), this.computeSlot = s, o && (o._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      di(this, l << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let i = this.config.address[e.id];
    if (i == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return di(this, i), un(this, i);
  }
  update(...e) {
    return Ea(this, e, !0);
  }
  applyTransaction(e) {
    let t = this.config, { base: i, compartments: r } = t;
    for (let o of e.effects)
      o.is(En.reconfigure) ? (t && (r = /* @__PURE__ */ new Map(), t.compartments.forEach((l, a) => r.set(a, l)), t = null), r.set(o.value.compartment, o.value.extension)) : o.is(Z.reconfigure) ? (t = null, i = o.value) : o.is(Z.appendConfig) && (t = null, i = Et(i).concat(o.value));
    let s;
    t ? s = e.startState.values.slice() : (t = fn.resolve(i, r, this), s = new M(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (l, a) => a.reconfigure(l, this), null).values), new M(t, e.newDoc, e.newSelection, s, (o, l) => l.update(o, e), e);
  }
  replaceSelection(e) {
    return typeof e == "string" && (e = this.toText(e)), this.changeByRange((t) => ({
      changes: { from: t.from, to: t.to, insert: e },
      range: m.cursor(t.from + e.length)
    }));
  }
  changeByRange(e) {
    let t = this.selection, i = e(t.ranges[0]), r = this.changes(i.changes), s = [i.range], o = Et(i.effects);
    for (let l = 1; l < t.ranges.length; l++) {
      let a = e(t.ranges[l]), h = this.changes(a.changes), c = h.map(r);
      for (let u = 0; u < l; u++)
        s[u] = s[u].map(c);
      let f = r.mapDesc(h, !0);
      s.push(a.range.map(f)), r = r.compose(c), o = Z.mapEffects(o, c).concat(Z.mapEffects(Et(a.effects), f));
    }
    return {
      changes: r,
      selection: m.create(s, t.mainIndex),
      effects: o
    };
  }
  changes(e = []) {
    return e instanceof J ? e : J.of(e, this.doc.length, this.facet(M.lineSeparator));
  }
  toText(e) {
    return j.of(e.split(this.facet(M.lineSeparator) || _r));
  }
  sliceDoc(e = 0, t = this.doc.length) {
    return this.doc.sliceString(e, t, this.lineBreak);
  }
  facet(e) {
    let t = this.config.address[e.id];
    return t == null ? e.default : (di(this, t), un(this, t));
  }
  toJSON(e) {
    let t = {
      doc: this.sliceDoc(),
      selection: this.selection.toJSON()
    };
    if (e)
      for (let i in e) {
        let r = e[i];
        r instanceof Oe && this.config.address[r.id] != null && (t[i] = r.spec.toJSON(this.field(e[i]), this));
      }
    return t;
  }
  static fromJSON(e, t = {}, i) {
    if (!e || typeof e.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let r = [];
    if (i) {
      for (let s in i)
        if (Object.prototype.hasOwnProperty.call(e, s)) {
          let o = i[s], l = e[s];
          r.push(o.init((a) => o.spec.fromJSON(l, a)));
        }
    }
    return M.create({
      doc: e.doc,
      selection: m.fromJSON(e.selection),
      extensions: t.extensions ? r.concat([t.extensions]) : r
    });
  }
  static create(e = {}) {
    let t = fn.resolve(e.extensions || [], /* @__PURE__ */ new Map()), i = e.doc instanceof j ? e.doc : j.of((e.doc || "").split(t.staticFacet(M.lineSeparator) || _r)), r = e.selection ? e.selection instanceof m ? e.selection : m.single(e.selection.anchor, e.selection.head) : m.single(0);
    return Ca(r, i.length), t.staticFacet(Xa) || (r = r.asSingle()), new M(t, i, r, t.dynamicSlots.map(() => null), (s, o) => o.create(s), null);
  }
  get tabSize() {
    return this.facet(M.tabSize);
  }
  get lineBreak() {
    return this.facet(M.lineSeparator) || `
`;
  }
  get readOnly() {
    return this.facet(za);
  }
  phrase(e, ...t) {
    for (let i of this.facet(M.phrases))
      if (Object.prototype.hasOwnProperty.call(i, e)) {
        e = i[e];
        break;
      }
    return t.length && (e = e.replace(/\$(\$|\d*)/g, (i, r) => {
      if (r == "$")
        return "$";
      let s = +(r || 1);
      return !s || s > t.length ? i : t[s - 1];
    })), e;
  }
  languageDataAt(e, t, i = -1) {
    let r = [];
    for (let s of this.facet(Wa))
      for (let o of s(this, t, i))
        Object.prototype.hasOwnProperty.call(o, e) && r.push(o[e]);
    return r;
  }
  charCategorizer(e) {
    return Bf(this.languageDataAt("wordChars", e).join(""));
  }
  wordAt(e) {
    let { text: t, from: i, length: r } = this.doc.lineAt(e), s = this.charCategorizer(e), o = e - i, l = e - i;
    for (; o > 0; ) {
      let a = ke(t, o, !1);
      if (s(t.slice(a, o)) != fe.Word)
        break;
      o = a;
    }
    for (; l < r; ) {
      let a = ke(t, l);
      if (s(t.slice(l, a)) != fe.Word)
        break;
      l = a;
    }
    return o == l ? null : m.range(o + i, l + i);
  }
}
M.allowMultipleSelections = Xa;
M.tabSize = /* @__PURE__ */ v.define({
  combine: (n) => n.length ? n[0] : 4
});
M.lineSeparator = Za;
M.readOnly = za;
M.phrases = /* @__PURE__ */ v.define({
  compare(n, e) {
    let t = Object.keys(n), i = Object.keys(e);
    return t.length == i.length && t.every((r) => n[r] == e[r]);
  }
});
M.languageData = Wa;
M.changeFilter = Da;
M.transactionFilter = Ma;
M.transactionExtender = ja;
En.reconfigure = /* @__PURE__ */ Z.define();
function yt(n, e, t = {}) {
  let i = {};
  for (let r of n)
    for (let s of Object.keys(r)) {
      let o = r[s], l = i[s];
      if (l === void 0)
        i[s] = o;
      else if (!(l === o || o === void 0))
        if (Object.hasOwnProperty.call(t, s))
          i[s] = t[s](l, o);
        else
          throw new Error("Config merge conflict for field " + s);
    }
  for (let r in e)
    i[r] === void 0 && (i[r] = e[r]);
  return i;
}
class vt {
  eq(e) {
    return this == e;
  }
  range(e, t = e) {
    return bi.create(e, t, this);
  }
}
vt.prototype.startSide = vt.prototype.endSide = 0;
vt.prototype.point = !1;
vt.prototype.mapMode = ae.TrackDel;
class bi {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.value = i;
  }
  static create(e, t, i) {
    return new bi(e, t, i);
  }
}
function Ur(n, e) {
  return n.from - e.from || n.value.startSide - e.value.startSide;
}
class Zs {
  constructor(e, t, i, r) {
    this.from = e, this.to = t, this.value = i, this.maxPoint = r;
  }
  get length() {
    return this.to[this.to.length - 1];
  }
  findIndex(e, t, i, r = 0) {
    let s = i ? this.to : this.from;
    for (let o = r, l = s.length; ; ) {
      if (o == l)
        return o;
      let a = o + l >> 1, h = s[a] - e || (i ? this.value[a].endSide : this.value[a].startSide) - t;
      if (a == o)
        return h >= 0 ? o : l;
      h >= 0 ? l = a : o = a + 1;
    }
  }
  between(e, t, i, r) {
    for (let s = this.findIndex(t, -1e9, !0), o = this.findIndex(i, 1e9, !1, s); s < o; s++)
      if (r(this.from[s] + e, this.to[s] + e, this.value[s]) === !1)
        return !1;
  }
  map(e, t) {
    let i = [], r = [], s = [], o = -1, l = -1;
    for (let a = 0; a < this.value.length; a++) {
      let h = this.value[a], c = this.from[a] + e, f = this.to[a] + e, u, d;
      if (c == f) {
        let O = t.mapPos(c, h.startSide, h.mapMode);
        if (O == null || (u = d = O, h.startSide != h.endSide && (d = t.mapPos(c, h.endSide), d < u)))
          continue;
      } else if (u = t.mapPos(c, h.startSide), d = t.mapPos(f, h.endSide), u > d || u == d && h.startSide > 0 && h.endSide <= 0)
        continue;
      (d - u || h.endSide - h.startSide) < 0 || (o < 0 && (o = u), h.point && (l = Math.max(l, d - u)), i.push(h), r.push(u - o), s.push(d - o));
    }
    return { mapped: i.length ? new Zs(r, s, i, l) : null, pos: o };
  }
}
class z {
  constructor(e, t, i, r) {
    this.chunkPos = e, this.chunk = t, this.nextLayer = i, this.maxPoint = r;
  }
  static create(e, t, i, r) {
    return new z(e, t, i, r);
  }
  get length() {
    let e = this.chunk.length - 1;
    return e < 0 ? 0 : Math.max(this.chunkEnd(e), this.nextLayer.length);
  }
  get size() {
    if (this.isEmpty)
      return 0;
    let e = this.nextLayer.size;
    for (let t of this.chunk)
      e += t.value.length;
    return e;
  }
  chunkEnd(e) {
    return this.chunkPos[e] + this.chunk[e].length;
  }
  update(e) {
    let { add: t = [], sort: i = !1, filterFrom: r = 0, filterTo: s = this.length } = e, o = e.filter;
    if (t.length == 0 && !o)
      return this;
    if (i && (t = t.slice().sort(Ur)), this.isEmpty)
      return t.length ? z.of(t) : this;
    let l = new _a(this, null, -1).goto(0), a = 0, h = [], c = new pt();
    for (; l.value || a < t.length; )
      if (a < t.length && (l.from - t[a].from || l.startSide - t[a].value.startSide) >= 0) {
        let f = t[a++];
        c.addInner(f.from, f.to, f.value) || h.push(f);
      } else
        l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (a == t.length || this.chunkEnd(l.chunkIndex) < t[a].from) && (!o || r > this.chunkEnd(l.chunkIndex) || s < this.chunkPos[l.chunkIndex]) && c.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!o || r > l.to || s < l.from || o(l.from, l.to, l.value)) && (c.addInner(l.from, l.to, l.value) || h.push(bi.create(l.from, l.to, l.value))), l.next());
    return c.finishInner(this.nextLayer.isEmpty && !h.length ? z.empty : this.nextLayer.update({ add: h, filter: o, filterFrom: r, filterTo: s }));
  }
  map(e) {
    if (e.empty || this.isEmpty)
      return this;
    let t = [], i = [], r = -1;
    for (let o = 0; o < this.chunk.length; o++) {
      let l = this.chunkPos[o], a = this.chunk[o], h = e.touchesRange(l, l + a.length);
      if (h === !1)
        r = Math.max(r, a.maxPoint), t.push(a), i.push(e.mapPos(l));
      else if (h === !0) {
        let { mapped: c, pos: f } = a.map(l, e);
        c && (r = Math.max(r, c.maxPoint), t.push(c), i.push(f));
      }
    }
    let s = this.nextLayer.map(e);
    return t.length == 0 ? s : new z(i, t, s || z.empty, r);
  }
  between(e, t, i) {
    if (!this.isEmpty) {
      for (let r = 0; r < this.chunk.length; r++) {
        let s = this.chunkPos[r], o = this.chunk[r];
        if (t >= s && e <= s + o.length && o.between(s, e - s, t - s, i) === !1)
          return;
      }
      this.nextLayer.between(e, t, i);
    }
  }
  iter(e = 0) {
    return yi.from([this]).goto(e);
  }
  get isEmpty() {
    return this.nextLayer == this;
  }
  static iter(e, t = 0) {
    return yi.from(e).goto(t);
  }
  static compare(e, t, i, r, s = -1) {
    let o = e.filter((f) => f.maxPoint > 0 || !f.isEmpty && f.maxPoint >= s), l = t.filter((f) => f.maxPoint > 0 || !f.isEmpty && f.maxPoint >= s), a = go(o, l, i), h = new ii(o, a, s), c = new ii(l, a, s);
    i.iterGaps((f, u, d) => mo(h, f, c, u, d, r)), i.empty && i.length == 0 && mo(h, 0, c, 0, 0, r);
  }
  static eq(e, t, i = 0, r) {
    r == null && (r = 1e9);
    let s = e.filter((c) => !c.isEmpty && t.indexOf(c) < 0), o = t.filter((c) => !c.isEmpty && e.indexOf(c) < 0);
    if (s.length != o.length)
      return !1;
    if (!s.length)
      return !0;
    let l = go(s, o), a = new ii(s, l, 0).goto(i), h = new ii(o, l, 0).goto(i);
    for (; ; ) {
      if (a.to != h.to || !Yr(a.active, h.active) || a.point && (!h.point || !a.point.eq(h.point)))
        return !1;
      if (a.to > r)
        return !0;
      a.next(), h.next();
    }
  }
  static spans(e, t, i, r, s = -1) {
    let o = new ii(e, null, s).goto(t), l = t, a = o.openStart;
    for (; ; ) {
      let h = Math.min(o.to, i);
      if (o.point ? (r.point(l, h, o.point, o.activeForPoint(o.to), a, o.pointRank), a = o.openEnd(h) + (o.to > h ? 1 : 0)) : h > l && (r.span(l, h, o.active, a), a = o.openEnd(h)), o.to > i)
        break;
      l = o.to, o.next();
    }
    return a;
  }
  static of(e, t = !1) {
    let i = new pt();
    for (let r of e instanceof bi ? [e] : t ? Lf(e) : e)
      i.add(r.from, r.to, r.value);
    return i.finish();
  }
}
z.empty = /* @__PURE__ */ new z([], [], null, -1);
function Lf(n) {
  if (n.length > 1)
    for (let e = n[0], t = 1; t < n.length; t++) {
      let i = n[t];
      if (Ur(e, i) > 0)
        return n.slice().sort(Ur);
      e = i;
    }
  return n;
}
z.empty.nextLayer = z.empty;
class pt {
  constructor() {
    this.chunks = [], this.chunkPos = [], this.chunkStart = -1, this.last = null, this.lastFrom = -1e9, this.lastTo = -1e9, this.from = [], this.to = [], this.value = [], this.maxPoint = -1, this.setMaxPoint = -1, this.nextLayer = null;
  }
  finishChunk(e) {
    this.chunks.push(new Zs(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
  }
  add(e, t, i) {
    this.addInner(e, t, i) || (this.nextLayer || (this.nextLayer = new pt())).add(e, t, i);
  }
  addInner(e, t, i) {
    let r = e - this.lastTo || i.startSide - this.last.endSide;
    if (r <= 0 && (e - this.lastFrom || i.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    return r < 0 ? !1 : (this.from.length == 250 && this.finishChunk(!0), this.chunkStart < 0 && (this.chunkStart = e), this.from.push(e - this.chunkStart), this.to.push(t - this.chunkStart), this.last = i, this.lastFrom = e, this.lastTo = t, this.value.push(i), i.point && (this.maxPoint = Math.max(this.maxPoint, t - e)), !0);
  }
  addChunk(e, t) {
    if ((e - this.lastTo || t.value[0].startSide - this.last.endSide) < 0)
      return !1;
    this.from.length && this.finishChunk(!0), this.setMaxPoint = Math.max(this.setMaxPoint, t.maxPoint), this.chunks.push(t), this.chunkPos.push(e);
    let i = t.value.length - 1;
    return this.last = t.value[i], this.lastFrom = t.from[i] + e, this.lastTo = t.to[i] + e, !0;
  }
  finish() {
    return this.finishInner(z.empty);
  }
  finishInner(e) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return e;
    let t = z.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(e) : e, this.setMaxPoint);
    return this.from = null, t;
  }
}
function go(n, e, t) {
  let i = /* @__PURE__ */ new Map();
  for (let s of n)
    for (let o = 0; o < s.chunk.length; o++)
      s.chunk[o].maxPoint <= 0 && i.set(s.chunk[o], s.chunkPos[o]);
  let r = /* @__PURE__ */ new Set();
  for (let s of e)
    for (let o = 0; o < s.chunk.length; o++) {
      let l = i.get(s.chunk[o]);
      l != null && (t ? t.mapPos(l) : l) == s.chunkPos[o] && !(t != null && t.touchesRange(l, l + s.chunk[o].length)) && r.add(s.chunk[o]);
    }
  return r;
}
class _a {
  constructor(e, t, i, r = 0) {
    this.layer = e, this.skip = t, this.minPoint = i, this.rank = r;
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  get endSide() {
    return this.value ? this.value.endSide : 0;
  }
  goto(e, t = -1e9) {
    return this.chunkIndex = this.rangeIndex = 0, this.gotoInner(e, t, !1), this;
  }
  gotoInner(e, t, i) {
    for (; this.chunkIndex < this.layer.chunk.length; ) {
      let r = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(r) || this.layer.chunkEnd(this.chunkIndex) < e || r.maxPoint < this.minPoint))
        break;
      this.chunkIndex++, i = !1;
    }
    if (this.chunkIndex < this.layer.chunk.length) {
      let r = this.layer.chunk[this.chunkIndex].findIndex(e - this.layer.chunkPos[this.chunkIndex], t, !0);
      (!i || this.rangeIndex < r) && this.setRangeIndex(r);
    }
    this.next();
  }
  forward(e, t) {
    (this.to - e || this.endSide - t) < 0 && this.gotoInner(e, t, !0);
  }
  next() {
    for (; ; )
      if (this.chunkIndex == this.layer.chunk.length) {
        this.from = this.to = 1e9, this.value = null;
        break;
      } else {
        let e = this.layer.chunkPos[this.chunkIndex], t = this.layer.chunk[this.chunkIndex], i = e + t.from[this.rangeIndex];
        if (this.from = i, this.to = e + t.to[this.rangeIndex], this.value = t.value[this.rangeIndex], this.setRangeIndex(this.rangeIndex + 1), this.minPoint < 0 || this.value.point && this.to - this.from >= this.minPoint)
          break;
      }
  }
  setRangeIndex(e) {
    if (e == this.layer.chunk[this.chunkIndex].value.length) {
      if (this.chunkIndex++, this.skip)
        for (; this.chunkIndex < this.layer.chunk.length && this.skip.has(this.layer.chunk[this.chunkIndex]); )
          this.chunkIndex++;
      this.rangeIndex = 0;
    } else
      this.rangeIndex = e;
  }
  nextChunk() {
    this.chunkIndex++, this.rangeIndex = 0, this.next();
  }
  compare(e) {
    return this.from - e.from || this.startSide - e.startSide || this.rank - e.rank || this.to - e.to || this.endSide - e.endSide;
  }
}
class yi {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, i = -1) {
    let r = [];
    for (let s = 0; s < e.length; s++)
      for (let o = e[s]; !o.isEmpty; o = o.nextLayer)
        o.maxPoint >= i && r.push(new _a(o, t, i, s));
    return r.length == 1 ? r[0] : new yi(r);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let i of this.heap)
      i.goto(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      ar(this.heap, i);
    return this.next(), this;
  }
  forward(e, t) {
    for (let i of this.heap)
      i.forward(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      ar(this.heap, i);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), ar(this.heap, 0);
    }
  }
}
function ar(n, e) {
  for (let t = n[e]; ; ) {
    let i = (e << 1) + 1;
    if (i >= n.length)
      break;
    let r = n[i];
    if (i + 1 < n.length && r.compare(n[i + 1]) >= 0 && (r = n[i + 1], i++), t.compare(r) < 0)
      break;
    n[i] = t, n[e] = r, e = i;
  }
}
class ii {
  constructor(e, t, i) {
    this.minPoint = i, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = yi.from(e, t, i);
  }
  goto(e, t = -1e9) {
    return this.cursor.goto(e, t), this.active.length = this.activeTo.length = this.activeRank.length = 0, this.minActive = -1, this.to = e, this.endSide = t, this.openStart = -1, this.next(), this;
  }
  forward(e, t) {
    for (; this.minActive > -1 && (this.activeTo[this.minActive] - e || this.active[this.minActive].endSide - t) < 0; )
      this.removeActive(this.minActive);
    this.cursor.forward(e, t);
  }
  removeActive(e) {
    Di(this.active, e), Di(this.activeTo, e), Di(this.activeRank, e), this.minActive = Qo(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: i, to: r, rank: s } = this.cursor;
    for (; t < this.activeRank.length && this.activeRank[t] <= s; )
      t++;
    Mi(this.active, t, i), Mi(this.activeTo, t, r), Mi(this.activeRank, t, s), e && Mi(e, t, this.cursor.from), this.minActive = Qo(this.active, this.activeTo);
  }
  next() {
    let e = this.to, t = this.point;
    this.point = null;
    let i = this.openStart < 0 ? [] : null, r = 0;
    for (; ; ) {
      let s = this.minActive;
      if (s > -1 && (this.activeTo[s] - this.cursor.from || this.active[s].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[s] > e) {
          this.to = this.activeTo[s], this.endSide = this.active[s].endSide;
          break;
        }
        this.removeActive(s), i && Di(i, s);
      } else if (this.cursor.value)
        if (this.cursor.from > e) {
          this.to = this.cursor.from, this.endSide = this.cursor.startSide;
          break;
        } else {
          let o = this.cursor.value;
          if (!o.point)
            this.addActive(i), this.cursor.next();
          else if (t && this.cursor.to == this.to && this.cursor.from < this.cursor.to)
            this.cursor.next();
          else {
            this.point = o, this.pointFrom = this.cursor.from, this.pointRank = this.cursor.rank, this.to = this.cursor.to, this.endSide = o.endSide, this.cursor.from < e && (r = 1), this.cursor.next(), this.forward(this.to, this.endSide);
            break;
          }
        }
      else {
        this.to = this.endSide = 1e9;
        break;
      }
    }
    if (i) {
      let s = 0;
      for (; s < i.length && i[s] < e; )
        s++;
      this.openStart = s + r;
    }
  }
  activeForPoint(e) {
    if (!this.active.length)
      return this.active;
    let t = [];
    for (let i = this.active.length - 1; i >= 0 && !(this.activeRank[i] < this.pointRank); i--)
      (this.activeTo[i] > e || this.activeTo[i] == e && this.active[i].endSide >= this.point.endSide) && t.push(this.active[i]);
    return t.reverse();
  }
  openEnd(e) {
    let t = 0;
    for (let i = this.activeTo.length - 1; i >= 0 && this.activeTo[i] > e; i--)
      t++;
    return t;
  }
}
function mo(n, e, t, i, r, s) {
  n.goto(e), t.goto(i);
  let o = i + r, l = i, a = i - e;
  for (; ; ) {
    let h = n.to + a - t.to || n.endSide - t.endSide, c = h < 0 ? n.to + a : t.to, f = Math.min(c, o);
    if (n.point || t.point ? n.point && t.point && (n.point == t.point || n.point.eq(t.point)) && Yr(n.activeForPoint(n.to + a), t.activeForPoint(t.to)) || s.comparePoint(l, f, n.point, t.point) : f > l && !Yr(n.active, t.active) && s.compareRange(l, f, n.active, t.active), c > o)
      break;
    l = c, h <= 0 && n.next(), h >= 0 && t.next();
  }
}
function Yr(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++)
    if (n[t] != e[t] && !n[t].eq(e[t]))
      return !1;
  return !0;
}
function Di(n, e) {
  for (let t = e, i = n.length - 1; t < i; t++)
    n[t] = n[t + 1];
  n.pop();
}
function Mi(n, e, t) {
  for (let i = n.length - 1; i >= e; i--)
    n[i + 1] = n[i];
  n[e] = t;
}
function Qo(n, e) {
  let t = -1, i = 1e9;
  for (let r = 0; r < e.length; r++)
    (e[r] - i || n[r].endSide - n[t].endSide) < 0 && (t = r, i = e[r]);
  return t;
}
function _n(n, e, t = n.length) {
  let i = 0;
  for (let r = 0; r < t; )
    n.charCodeAt(r) == 9 ? (i += e - i % e, r++) : (i++, r = ke(n, r));
  return i;
}
function Uf(n, e, t, i) {
  for (let r = 0, s = 0; ; ) {
    if (s >= e)
      return r;
    if (r == n.length)
      break;
    s += n.charCodeAt(r) == 9 ? t - s % t : 1, r = ke(n, r);
  }
  return i === !0 ? -1 : n.length;
}
const Fr = "\u037C", bo = typeof Symbol > "u" ? "__" + Fr : Symbol.for(Fr), Hr = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet"), yo = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class gt {
  constructor(e, t) {
    this.rules = [];
    let { finish: i } = t || {};
    function r(o) {
      return /^@/.test(o) ? [o] : o.split(/,\s*/);
    }
    function s(o, l, a, h) {
      let c = [], f = /^@(\w+)\b/.exec(o[0]), u = f && f[1] == "keyframes";
      if (f && l == null)
        return a.push(o[0] + ";");
      for (let d in l) {
        let O = l[d];
        if (/&/.test(d))
          s(
            d.split(/,\s*/).map((g) => o.map((Q) => g.replace(/&/, Q))).reduce((g, Q) => g.concat(Q)),
            O,
            a
          );
        else if (O && typeof O == "object") {
          if (!f)
            throw new RangeError("The value of a property (" + d + ") should be a primitive value.");
          s(r(d), O, c, u);
        } else
          O != null && c.push(d.replace(/_.*/, "").replace(/[A-Z]/g, (g) => "-" + g.toLowerCase()) + ": " + O + ";");
      }
      (c.length || u) && a.push((i && !f && !h ? o.map(i) : o).join(", ") + " {" + c.join(" ") + "}");
    }
    for (let o in e)
      s(r(o), e[o], this.rules);
  }
  getRules() {
    return this.rules.join(`
`);
  }
  static newName() {
    let e = yo[bo] || 1;
    return yo[bo] = e + 1, Fr + e.toString(36);
  }
  static mount(e, t) {
    (e[Hr] || new Yf(e)).mount(Array.isArray(t) ? t : [t]);
  }
}
let ji = null;
class Yf {
  constructor(e) {
    if (!e.head && e.adoptedStyleSheets && typeof CSSStyleSheet < "u") {
      if (ji)
        return e.adoptedStyleSheets = [ji.sheet].concat(e.adoptedStyleSheets), e[Hr] = ji;
      this.sheet = new CSSStyleSheet(), e.adoptedStyleSheets = [this.sheet].concat(e.adoptedStyleSheets), ji = this;
    } else {
      this.styleTag = (e.ownerDocument || e).createElement("style");
      let t = e.head || e;
      t.insertBefore(this.styleTag, t.firstChild);
    }
    this.modules = [], e[Hr] = this;
  }
  mount(e) {
    let t = this.sheet, i = 0, r = 0;
    for (let s = 0; s < e.length; s++) {
      let o = e[s], l = this.modules.indexOf(o);
      if (l < r && l > -1 && (this.modules.splice(l, 1), r--, l = -1), l == -1) {
        if (this.modules.splice(r++, 0, o), t)
          for (let a = 0; a < o.rules.length; a++)
            t.insertRule(o.rules[a], i++);
      } else {
        for (; r < l; )
          i += this.modules[r++].rules.length;
        i += o.rules.length, r++;
      }
    }
    if (!t) {
      let s = "";
      for (let o = 0; o < this.modules.length; o++)
        s += this.modules[o].getRules() + `
`;
      this.styleTag.textContent = s;
    }
  }
}
var mt = {
  8: "Backspace",
  9: "Tab",
  10: "Enter",
  12: "NumLock",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  44: "PrintScreen",
  45: "Insert",
  46: "Delete",
  59: ";",
  61: "=",
  91: "Meta",
  92: "Meta",
  106: "*",
  107: "+",
  108: ",",
  109: "-",
  110: ".",
  111: "/",
  144: "NumLock",
  145: "ScrollLock",
  160: "Shift",
  161: "Shift",
  162: "Control",
  163: "Control",
  164: "Alt",
  165: "Alt",
  173: "-",
  186: ";",
  187: "=",
  188: ",",
  189: "-",
  190: ".",
  191: "/",
  192: "`",
  219: "[",
  220: "\\",
  221: "]",
  222: "'"
}, Gt = {
  48: ")",
  49: "!",
  50: "@",
  51: "#",
  52: "$",
  53: "%",
  54: "^",
  55: "&",
  56: "*",
  57: "(",
  59: ":",
  61: "+",
  173: "_",
  186: ":",
  187: "+",
  188: "<",
  189: "_",
  190: ">",
  191: "?",
  192: "~",
  219: "{",
  220: "|",
  221: "}",
  222: '"'
}, So = typeof navigator < "u" && /Chrome\/(\d+)/.exec(navigator.userAgent), Ff = typeof navigator < "u" && /Apple Computer/.test(navigator.vendor), Hf = typeof navigator < "u" && /Gecko\/\d+/.test(navigator.userAgent), xo = typeof navigator < "u" && /Mac/.test(navigator.platform), Jf = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent), Kf = So && (xo || +So[1] < 57) || Hf && xo;
for (var re = 0; re < 10; re++)
  mt[48 + re] = mt[96 + re] = String(re);
for (var re = 1; re <= 24; re++)
  mt[re + 111] = "F" + re;
for (var re = 65; re <= 90; re++)
  mt[re] = String.fromCharCode(re + 32), Gt[re] = String.fromCharCode(re);
for (var hr in mt)
  Gt.hasOwnProperty(hr) || (Gt[hr] = mt[hr]);
function eu(n) {
  var e = Kf && (n.ctrlKey || n.altKey || n.metaKey) || (Ff || Jf) && n.shiftKey && n.key && n.key.length == 1 || n.key == "Unidentified", t = !e && n.key || (n.shiftKey ? Gt : mt)[n.keyCode] || n.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
function dn(n) {
  let e;
  return n.nodeType == 11 ? e = n.getSelection ? n : n.ownerDocument : e = n, e.getSelection();
}
function Vt(n, e) {
  return e ? n == e || n.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function tu() {
  let n = document.activeElement;
  for (; n && n.shadowRoot; )
    n = n.shadowRoot.activeElement;
  return n;
}
function tn(n, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return Vt(n, e.anchorNode);
  } catch {
    return !1;
  }
}
function Si(n) {
  return n.nodeType == 3 ? Nt(n, 0, n.nodeValue.length).getClientRects() : n.nodeType == 1 ? n.getClientRects() : [];
}
function On(n, e, t, i) {
  return t ? $o(n, e, t, i, -1) || $o(n, e, t, i, 1) : !1;
}
function pn(n) {
  for (var e = 0; ; e++)
    if (n = n.previousSibling, !n)
      return e;
}
function $o(n, e, t, i, r) {
  for (; ; ) {
    if (n == t && e == i)
      return !0;
    if (e == (r < 0 ? 0 : xi(n))) {
      if (n.nodeName == "DIV")
        return !1;
      let s = n.parentNode;
      if (!s || s.nodeType != 1)
        return !1;
      e = pn(n) + (r < 0 ? 0 : 1), n = s;
    } else if (n.nodeType == 1) {
      if (n = n.childNodes[e + (r < 0 ? -1 : 0)], n.nodeType == 1 && n.contentEditable == "false")
        return !1;
      e = r < 0 ? xi(n) : 0;
    } else
      return !1;
  }
}
function xi(n) {
  return n.nodeType == 3 ? n.nodeValue.length : n.childNodes.length;
}
const Ia = { left: 0, right: 0, top: 0, bottom: 0 };
function In(n, e) {
  let t = e ? n.left : n.right;
  return { left: t, right: t, top: n.top, bottom: n.bottom };
}
function iu(n) {
  return {
    left: 0,
    right: n.innerWidth,
    top: 0,
    bottom: n.innerHeight
  };
}
function nu(n, e, t, i, r, s, o, l) {
  let a = n.ownerDocument, h = a.defaultView;
  for (let c = n; c; )
    if (c.nodeType == 1) {
      let f, u = c == a.body;
      if (u)
        f = iu(h);
      else {
        if (c.scrollHeight <= c.clientHeight && c.scrollWidth <= c.clientWidth) {
          c = c.parentNode;
          continue;
        }
        let g = c.getBoundingClientRect();
        f = {
          left: g.left,
          right: g.left + c.clientWidth,
          top: g.top,
          bottom: g.top + c.clientHeight
        };
      }
      let d = 0, O = 0;
      if (r == "nearest")
        e.top < f.top ? (O = -(f.top - e.top + o), t > 0 && e.bottom > f.bottom + O && (O = e.bottom - f.bottom + O + o)) : e.bottom > f.bottom && (O = e.bottom - f.bottom + o, t < 0 && e.top - O < f.top && (O = -(f.top + O - e.top + o)));
      else {
        let g = e.bottom - e.top, Q = f.bottom - f.top;
        O = (r == "center" && g <= Q ? e.top + g / 2 - Q / 2 : r == "start" || r == "center" && t < 0 ? e.top - o : e.bottom - Q + o) - f.top;
      }
      if (i == "nearest" ? e.left < f.left ? (d = -(f.left - e.left + s), t > 0 && e.right > f.right + d && (d = e.right - f.right + d + s)) : e.right > f.right && (d = e.right - f.right + s, t < 0 && e.left < f.left + d && (d = -(f.left + d - e.left + s))) : d = (i == "center" ? e.left + (e.right - e.left) / 2 - (f.right - f.left) / 2 : i == "start" == l ? e.left - s : e.right - (f.right - f.left) + s) - f.left, d || O)
        if (u)
          h.scrollBy(d, O);
        else {
          if (O) {
            let g = c.scrollTop;
            c.scrollTop += O, O = c.scrollTop - g;
          }
          if (d) {
            let g = c.scrollLeft;
            c.scrollLeft += d, d = c.scrollLeft - g;
          }
          e = {
            left: e.left - d,
            top: e.top - O,
            right: e.right - d,
            bottom: e.bottom - O
          };
        }
      if (u)
        break;
      c = c.assignedSlot || c.parentNode, i = r = "nearest";
    } else if (c.nodeType == 11)
      c = c.host;
    else
      break;
}
class ru {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    this.set(e.anchorNode, e.anchorOffset, e.focusNode, e.focusOffset);
  }
  set(e, t, i, r) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = i, this.focusOffset = r;
  }
}
let Zt = null;
function Ga(n) {
  if (n.setActive)
    return n.setActive();
  if (Zt)
    return n.focus(Zt);
  let e = [];
  for (let t = n; t && (e.push(t, t.scrollTop, t.scrollLeft), t != t.ownerDocument); t = t.parentNode)
    ;
  if (n.focus(Zt == null ? {
    get preventScroll() {
      return Zt = { preventScroll: !0 }, !0;
    }
  } : void 0), !Zt) {
    Zt = !1;
    for (let t = 0; t < e.length; ) {
      let i = e[t++], r = e[t++], s = e[t++];
      i.scrollTop != r && (i.scrollTop = r), i.scrollLeft != s && (i.scrollLeft = s);
    }
  }
}
let ko;
function Nt(n, e, t = e) {
  let i = ko || (ko = document.createRange());
  return i.setEnd(n, t), i.setStart(n, e), i;
}
function Oi(n, e, t) {
  let i = { key: e, code: e, keyCode: t, which: t, cancelable: !0 }, r = new KeyboardEvent("keydown", i);
  r.synthetic = !0, n.dispatchEvent(r);
  let s = new KeyboardEvent("keyup", i);
  return s.synthetic = !0, n.dispatchEvent(s), r.defaultPrevented || s.defaultPrevented;
}
function su(n) {
  for (; n; ) {
    if (n && (n.nodeType == 9 || n.nodeType == 11 && n.host))
      return n;
    n = n.assignedSlot || n.parentNode;
  }
  return null;
}
function Va(n) {
  for (; n.attributes.length; )
    n.removeAttributeNode(n.attributes[0]);
}
function ou(n, e) {
  let t = e.focusNode, i = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != i)
    return !1;
  for (; ; )
    if (i) {
      if (t.nodeType != 1)
        return !1;
      let r = t.childNodes[i - 1];
      r.contentEditable == "false" ? i-- : (t = r, i = xi(t));
    } else {
      if (t == n)
        return !0;
      i = pn(t), t = t.parentNode;
    }
}
class se {
  constructor(e, t, i = !0) {
    this.node = e, this.offset = t, this.precise = i;
  }
  static before(e, t) {
    return new se(e.parentNode, pn(e), t);
  }
  static after(e, t) {
    return new se(e.parentNode, pn(e) + 1, t);
  }
}
const Ds = [];
class G {
  constructor() {
    this.parent = null, this.dom = null, this.dirty = 2;
  }
  get editorView() {
    if (!this.parent)
      throw new Error("Accessing view in orphan content view");
    return this.parent.editorView;
  }
  get overrideDOMText() {
    return null;
  }
  get posAtStart() {
    return this.parent ? this.parent.posBefore(this) : 0;
  }
  get posAtEnd() {
    return this.posAtStart + this.length;
  }
  posBefore(e) {
    let t = this.posAtStart;
    for (let i of this.children) {
      if (i == e)
        return t;
      t += i.length + i.breakAfter;
    }
    throw new RangeError("Invalid child in posBefore");
  }
  posAfter(e) {
    return this.posBefore(e) + e.length;
  }
  coordsAt(e, t) {
    return null;
  }
  sync(e) {
    if (this.dirty & 2) {
      let t = this.dom, i = null, r;
      for (let s of this.children) {
        if (s.dirty) {
          if (!s.dom && (r = i ? i.nextSibling : t.firstChild)) {
            let o = G.get(r);
            (!o || !o.parent && o.constructor == s.constructor) && s.reuseDOM(r);
          }
          s.sync(e), s.dirty = 0;
        }
        if (r = i ? i.nextSibling : t.firstChild, e && !e.written && e.node == t && r != s.dom && (e.written = !0), s.dom.parentNode == t)
          for (; r && r != s.dom; )
            r = wo(r);
        else
          t.insertBefore(s.dom, r);
        i = s.dom;
      }
      for (r = i ? i.nextSibling : t.firstChild, r && e && e.node == t && (e.written = !0); r; )
        r = wo(r);
    } else if (this.dirty & 1)
      for (let t of this.children)
        t.dirty && (t.sync(e), t.dirty = 0);
  }
  reuseDOM(e) {
  }
  localPosFromDOM(e, t) {
    let i;
    if (e == this.dom)
      i = this.dom.childNodes[t];
    else {
      let r = xi(e) == 0 ? 0 : t == 0 ? -1 : 1;
      for (; ; ) {
        let s = e.parentNode;
        if (s == this.dom)
          break;
        r == 0 && s.firstChild != s.lastChild && (e == s.firstChild ? r = -1 : r = 1), e = s;
      }
      r < 0 ? i = e : i = e.nextSibling;
    }
    if (i == this.dom.firstChild)
      return 0;
    for (; i && !G.get(i); )
      i = i.nextSibling;
    if (!i)
      return this.length;
    for (let r = 0, s = 0; ; r++) {
      let o = this.children[r];
      if (o.dom == i)
        return s;
      s += o.length + o.breakAfter;
    }
  }
  domBoundsAround(e, t, i = 0) {
    let r = -1, s = -1, o = -1, l = -1;
    for (let a = 0, h = i, c = i; a < this.children.length; a++) {
      let f = this.children[a], u = h + f.length;
      if (h < e && u > t)
        return f.domBoundsAround(e, t, h);
      if (u >= e && r == -1 && (r = a, s = h), h > t && f.dom.parentNode == this.dom) {
        o = a, l = c;
        break;
      }
      c = u, h = u + f.breakAfter;
    }
    return {
      from: s,
      to: l < 0 ? i + this.length : l,
      startDOM: (r ? this.children[r - 1].dom.nextSibling : null) || this.dom.firstChild,
      endDOM: o < this.children.length && o >= 0 ? this.children[o].dom : null
    };
  }
  markDirty(e = !1) {
    this.dirty |= 2, this.markParentsDirty(e);
  }
  markParentsDirty(e) {
    for (let t = this.parent; t; t = t.parent) {
      if (e && (t.dirty |= 2), t.dirty & 1)
        return;
      t.dirty |= 1, e = !1;
    }
  }
  setParent(e) {
    this.parent != e && (this.parent = e, this.dirty && this.markParentsDirty(!0));
  }
  setDOM(e) {
    this.dom && (this.dom.cmView = null), this.dom = e, e.cmView = this;
  }
  get rootView() {
    for (let e = this; ; ) {
      let t = e.parent;
      if (!t)
        return e;
      e = t;
    }
  }
  replaceChildren(e, t, i = Ds) {
    this.markDirty();
    for (let r = e; r < t; r++) {
      let s = this.children[r];
      s.parent == this && s.destroy();
    }
    this.children.splice(e, t - e, ...i);
    for (let r = 0; r < i.length; r++)
      i[r].setParent(this);
  }
  ignoreMutation(e) {
    return !1;
  }
  ignoreEvent(e) {
    return !1;
  }
  childCursor(e = this.length) {
    return new Na(this.children, e, this.children.length);
  }
  childPos(e, t = 1) {
    return this.childCursor().findPos(e, t);
  }
  toString() {
    let e = this.constructor.name.replace("View", "");
    return e + (this.children.length ? "(" + this.children.join() + ")" : this.length ? "[" + (e == "Text" ? this.text : this.length) + "]" : "") + (this.breakAfter ? "#" : "");
  }
  static get(e) {
    return e.cmView;
  }
  get isEditable() {
    return !0;
  }
  merge(e, t, i, r, s, o) {
    return !1;
  }
  become(e) {
    return !1;
  }
  getSide() {
    return 0;
  }
  destroy() {
    this.parent = null;
  }
}
G.prototype.breakAfter = 0;
function wo(n) {
  let e = n.nextSibling;
  return n.parentNode.removeChild(n), e;
}
class Na {
  constructor(e, t, i) {
    this.children = e, this.pos = t, this.i = i, this.off = 0;
  }
  findPos(e, t = 1) {
    for (; ; ) {
      if (e > this.pos || e == this.pos && (t > 0 || this.i == 0 || this.children[this.i - 1].breakAfter))
        return this.off = e - this.pos, this;
      let i = this.children[--this.i];
      this.pos -= i.length + i.breakAfter;
    }
  }
}
function Ba(n, e, t, i, r, s, o, l, a) {
  let { children: h } = n, c = h.length ? h[e] : null, f = s.length ? s[s.length - 1] : null, u = f ? f.breakAfter : o;
  if (!(e == i && c && !o && !u && s.length < 2 && c.merge(t, r, s.length ? f : null, t == 0, l, a))) {
    if (i < h.length) {
      let d = h[i];
      d && r < d.length ? (e == i && (d = d.split(r), r = 0), !u && f && d.merge(0, r, f, !0, 0, a) ? s[s.length - 1] = d : (r && d.merge(0, r, null, !1, 0, a), s.push(d))) : d != null && d.breakAfter && (f ? f.breakAfter = 1 : o = 1), i++;
    }
    for (c && (c.breakAfter = o, t > 0 && (!o && s.length && c.merge(t, c.length, s[0], !1, l, 0) ? c.breakAfter = s.shift().breakAfter : (t < c.length || c.children.length && c.children[c.children.length - 1].length == 0) && c.merge(t, c.length, null, !1, l, 0), e++)); e < i && s.length; )
      if (h[i - 1].become(s[s.length - 1]))
        i--, s.pop(), a = s.length ? 0 : l;
      else if (h[e].become(s[0]))
        e++, s.shift(), l = s.length ? 0 : a;
      else
        break;
    !s.length && e && i < h.length && !h[e - 1].breakAfter && h[i].merge(0, 0, h[e - 1], !1, l, a) && e--, (e < i || s.length) && n.replaceChildren(e, i, s);
  }
}
function La(n, e, t, i, r, s) {
  let o = n.childCursor(), { i: l, off: a } = o.findPos(t, 1), { i: h, off: c } = o.findPos(e, -1), f = e - t;
  for (let u of i)
    f += u.length;
  n.length += f, Ba(n, h, c, l, a, i, 0, r, s);
}
let $e = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, Jr = typeof document < "u" ? document : { documentElement: { style: {} } };
const Kr = /* @__PURE__ */ /Edge\/(\d+)/.exec($e.userAgent), Ua = /* @__PURE__ */ /MSIE \d/.test($e.userAgent), es = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec($e.userAgent), Gn = !!(Ua || es || Kr), To = !Gn && /* @__PURE__ */ /gecko\/(\d+)/i.test($e.userAgent), cr = !Gn && /* @__PURE__ */ /Chrome\/(\d+)/.exec($e.userAgent), vo = "webkitFontSmoothing" in Jr.documentElement.style, Ya = !Gn && /* @__PURE__ */ /Apple Computer/.test($e.vendor), Po = Ya && (/* @__PURE__ */ /Mobile\/\w+/.test($e.userAgent) || $e.maxTouchPoints > 2);
var w = {
  mac: Po || /* @__PURE__ */ /Mac/.test($e.platform),
  windows: /* @__PURE__ */ /Win/.test($e.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test($e.platform),
  ie: Gn,
  ie_version: Ua ? Jr.documentMode || 6 : es ? +es[1] : Kr ? +Kr[1] : 0,
  gecko: To,
  gecko_version: To ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec($e.userAgent) || [0, 0])[1] : 0,
  chrome: !!cr,
  chrome_version: cr ? +cr[1] : 0,
  ios: Po,
  android: /* @__PURE__ */ /Android\b/.test($e.userAgent),
  webkit: vo,
  safari: Ya,
  webkit_version: vo ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0,
  tabSize: Jr.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
const lu = 256;
class Qt extends G {
  constructor(e) {
    super(), this.text = e;
  }
  get length() {
    return this.text.length;
  }
  createDOM(e) {
    this.setDOM(e || document.createTextNode(this.text));
  }
  sync(e) {
    this.dom || this.createDOM(), this.dom.nodeValue != this.text && (e && e.node == this.dom && (e.written = !0), this.dom.nodeValue = this.text);
  }
  reuseDOM(e) {
    e.nodeType == 3 && this.createDOM(e);
  }
  merge(e, t, i) {
    return i && (!(i instanceof Qt) || this.length - (t - e) + i.length > lu) ? !1 : (this.text = this.text.slice(0, e) + (i ? i.text : "") + this.text.slice(t), this.markDirty(), !0);
  }
  split(e) {
    let t = new Qt(this.text.slice(e));
    return this.text = this.text.slice(0, e), this.markDirty(), t;
  }
  localPosFromDOM(e, t) {
    return e == this.dom ? t : t ? this.text.length : 0;
  }
  domAtPos(e) {
    return new se(this.dom, e);
  }
  domBoundsAround(e, t, i) {
    return { from: i, to: i + this.length, startDOM: this.dom, endDOM: this.dom.nextSibling };
  }
  coordsAt(e, t) {
    return ts(this.dom, e, t);
  }
}
class Ue extends G {
  constructor(e, t = [], i = 0) {
    super(), this.mark = e, this.children = t, this.length = i;
    for (let r of t)
      r.setParent(this);
  }
  setAttrs(e) {
    if (Va(e), this.mark.class && (e.className = this.mark.class), this.mark.attrs)
      for (let t in this.mark.attrs)
        e.setAttribute(t, this.mark.attrs[t]);
    return e;
  }
  reuseDOM(e) {
    e.nodeName == this.mark.tagName.toUpperCase() && (this.setDOM(e), this.dirty |= 6);
  }
  sync(e) {
    this.dom ? this.dirty & 4 && this.setAttrs(this.dom) : this.setDOM(this.setAttrs(document.createElement(this.mark.tagName))), super.sync(e);
  }
  merge(e, t, i, r, s, o) {
    return i && (!(i instanceof Ue && i.mark.eq(this.mark)) || e && s <= 0 || t < this.length && o <= 0) ? !1 : (La(this, e, t, i ? i.children : [], s - 1, o - 1), this.markDirty(), !0);
  }
  split(e) {
    let t = [], i = 0, r = -1, s = 0;
    for (let l of this.children) {
      let a = i + l.length;
      a > e && t.push(i < e ? l.split(e - i) : l), r < 0 && i >= e && (r = s), i = a, s++;
    }
    let o = this.length - e;
    return this.length = e, r > -1 && (this.children.length = r, this.markDirty()), new Ue(this.mark, t, o);
  }
  domAtPos(e) {
    return Ja(this.dom, this.children, e);
  }
  coordsAt(e, t) {
    return eh(this, e, t);
  }
}
function ts(n, e, t) {
  let i = n.nodeValue.length;
  e > i && (e = i);
  let r = e, s = e, o = 0;
  e == 0 && t < 0 || e == i && t >= 0 ? w.chrome || w.gecko || (e ? (r--, o = 1) : s < i && (s++, o = -1)) : t < 0 ? r-- : s < i && s++;
  let l = Nt(n, r, s).getClientRects();
  if (!l.length)
    return Ia;
  let a = l[(o ? o < 0 : t >= 0) ? 0 : l.length - 1];
  return w.safari && !o && a.width == 0 && (a = Array.prototype.find.call(l, (h) => h.width) || a), o ? In(a, o < 0) : a || null;
}
class ht extends G {
  constructor(e, t, i) {
    super(), this.widget = e, this.length = t, this.side = i, this.prevWidget = null;
  }
  static create(e, t, i) {
    return new (e.customView || ht)(e, t, i);
  }
  split(e) {
    let t = ht.create(this.widget, this.length - e, this.side);
    return this.length -= e, t;
  }
  sync() {
    (!this.dom || !this.widget.updateDOM(this.dom)) && (this.dom && this.prevWidget && this.prevWidget.destroy(this.dom), this.prevWidget = null, this.setDOM(this.widget.toDOM(this.editorView)), this.dom.contentEditable = "false");
  }
  getSide() {
    return this.side;
  }
  merge(e, t, i, r, s, o) {
    return i && (!(i instanceof ht) || !this.widget.compare(i.widget) || e > 0 && s <= 0 || t < this.length && o <= 0) ? !1 : (this.length = e + (i ? i.length : 0) + (this.length - t), !0);
  }
  become(e) {
    return e.length == this.length && e instanceof ht && e.side == this.side && this.widget.constructor == e.widget.constructor ? (this.widget.eq(e.widget) || this.markDirty(!0), this.dom && !this.prevWidget && (this.prevWidget = this.widget), this.widget = e.widget, !0) : !1;
  }
  ignoreMutation() {
    return !0;
  }
  ignoreEvent(e) {
    return this.widget.ignoreEvent(e);
  }
  get overrideDOMText() {
    if (this.length == 0)
      return j.empty;
    let e = this;
    for (; e.parent; )
      e = e.parent;
    let t = e.editorView, i = t && t.state.doc, r = this.posAtStart;
    return i ? i.slice(r, r + this.length) : j.empty;
  }
  domAtPos(e) {
    return e == 0 ? se.before(this.dom) : se.after(this.dom, e == this.length);
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(e, t) {
    let i = this.dom.getClientRects(), r = null;
    if (!i.length)
      return Ia;
    for (let s = e > 0 ? i.length - 1 : 0; r = i[s], !(e > 0 ? s == 0 : s == i.length - 1 || r.top < r.bottom); s += e > 0 ? -1 : 1)
      ;
    return e == 0 && t > 0 || e == this.length && t <= 0 ? r : In(r, e == 0);
  }
  get isEditable() {
    return !1;
  }
  destroy() {
    super.destroy(), this.dom && this.widget.destroy(this.dom);
  }
}
class Fa extends ht {
  domAtPos(e) {
    let { topView: t, text: i } = this.widget;
    return t ? is(e, 0, t, i, (r, s) => r.domAtPos(s), (r) => new se(i, Math.min(r, i.nodeValue.length))) : new se(i, Math.min(e, i.nodeValue.length));
  }
  sync() {
    this.setDOM(this.widget.toDOM());
  }
  localPosFromDOM(e, t) {
    let { topView: i, text: r } = this.widget;
    return i ? Ha(e, t, i, r) : Math.min(t, this.length);
  }
  ignoreMutation() {
    return !1;
  }
  get overrideDOMText() {
    return null;
  }
  coordsAt(e, t) {
    let { topView: i, text: r } = this.widget;
    return i ? is(e, t, i, r, (s, o, l) => s.coordsAt(o, l), (s, o) => ts(r, s, o)) : ts(r, e, t);
  }
  destroy() {
    var e;
    super.destroy(), (e = this.widget.topView) === null || e === void 0 || e.destroy();
  }
  get isEditable() {
    return !0;
  }
}
function is(n, e, t, i, r, s) {
  if (t instanceof Ue) {
    for (let o of t.children) {
      let l = Vt(o.dom, i), a = l ? i.nodeValue.length : o.length;
      if (n < a || n == a && o.getSide() <= 0)
        return l ? is(n, e, o, i, r, s) : r(o, n, e);
      n -= a;
    }
    return r(t, t.length, -1);
  } else
    return t.dom == i ? s(n, e) : r(t, n, e);
}
function Ha(n, e, t, i) {
  if (t instanceof Ue)
    for (let r of t.children) {
      let s = 0, o = Vt(r.dom, i);
      if (Vt(r.dom, n))
        return s + (o ? Ha(n, e, r, i) : r.localPosFromDOM(n, e));
      s += o ? i.nodeValue.length : r.length;
    }
  else if (t.dom == i)
    return Math.min(e, i.nodeValue.length);
  return t.localPosFromDOM(n, e);
}
class Bt extends G {
  constructor(e) {
    super(), this.side = e;
  }
  get length() {
    return 0;
  }
  merge() {
    return !1;
  }
  become(e) {
    return e instanceof Bt && e.side == this.side;
  }
  split() {
    return new Bt(this.side);
  }
  sync() {
    if (!this.dom) {
      let e = document.createElement("img");
      e.className = "cm-widgetBuffer", e.setAttribute("aria-hidden", "true"), this.setDOM(e);
    }
  }
  getSide() {
    return this.side;
  }
  domAtPos(e) {
    return se.before(this.dom);
  }
  localPosFromDOM() {
    return 0;
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(e) {
    let t = this.dom.getBoundingClientRect(), i = au(this, this.side > 0 ? -1 : 1);
    return i && i.top < t.bottom && i.bottom > t.top ? { left: t.left, right: t.right, top: i.top, bottom: i.bottom } : t;
  }
  get overrideDOMText() {
    return j.empty;
  }
}
Qt.prototype.children = ht.prototype.children = Bt.prototype.children = Ds;
function au(n, e) {
  let t = n.parent, i = t ? t.children.indexOf(n) : -1;
  for (; t && i >= 0; )
    if (e < 0 ? i > 0 : i < t.children.length) {
      let r = t.children[i + e];
      if (r instanceof Qt) {
        let s = r.coordsAt(e < 0 ? r.length : 0, e);
        if (s)
          return s;
      }
      i += e;
    } else if (t instanceof Ue && t.parent)
      i = t.parent.children.indexOf(t) + (e < 0 ? 0 : 1), t = t.parent;
    else {
      let r = t.dom.lastChild;
      if (r && r.nodeName == "BR")
        return r.getClientRects()[0];
      break;
    }
}
function Ja(n, e, t) {
  let i = 0;
  for (let r = 0; i < e.length; i++) {
    let s = e[i], o = r + s.length;
    if (!(o == r && s.getSide() <= 0)) {
      if (t > r && t < o && s.dom.parentNode == n)
        return s.domAtPos(t - r);
      if (t <= r)
        break;
      r = o;
    }
  }
  for (; i > 0; i--) {
    let r = e[i - 1].dom;
    if (r.parentNode == n)
      return se.after(r);
  }
  return new se(n, 0);
}
function Ka(n, e, t) {
  let i, { children: r } = n;
  t > 0 && e instanceof Ue && r.length && (i = r[r.length - 1]) instanceof Ue && i.mark.eq(e.mark) ? Ka(i, e.children[0], t - 1) : (r.push(e), e.setParent(n)), n.length += e.length;
}
function eh(n, e, t) {
  for (let s = 0, o = 0; o < n.children.length; o++) {
    let l = n.children[o], a = s + l.length, h;
    if ((t <= 0 || a == n.length || l.getSide() > 0 ? a >= e : a > e) && (e < a || o + 1 == n.children.length || (h = n.children[o + 1]).length || h.getSide() > 0)) {
      let c = 0;
      if (a == s) {
        if (l.getSide() <= 0)
          continue;
        c = t = -l.getSide();
      }
      let f = l.coordsAt(Math.max(0, e - s), t);
      return c && f ? In(f, t < 0) : f;
    }
    s = a;
  }
  let i = n.dom.lastChild;
  if (!i)
    return n.dom.getBoundingClientRect();
  let r = Si(i);
  return r[r.length - 1] || null;
}
function ns(n, e) {
  for (let t in n)
    t == "class" && e.class ? e.class += " " + n.class : t == "style" && e.style ? e.style += ";" + n.style : e[t] = n[t];
  return e;
}
function Ms(n, e) {
  if (n == e)
    return !0;
  if (!n || !e)
    return !1;
  let t = Object.keys(n), i = Object.keys(e);
  if (t.length != i.length)
    return !1;
  for (let r of t)
    if (i.indexOf(r) == -1 || n[r] !== e[r])
      return !1;
  return !0;
}
function rs(n, e, t) {
  let i = null;
  if (e)
    for (let r in e)
      t && r in t || n.removeAttribute(i = r);
  if (t)
    for (let r in t)
      e && e[r] == t[r] || n.setAttribute(i = r, t[r]);
  return !!i;
}
class St {
  eq(e) {
    return !1;
  }
  updateDOM(e) {
    return !1;
  }
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  get estimatedHeight() {
    return -1;
  }
  ignoreEvent(e) {
    return !0;
  }
  get customView() {
    return null;
  }
  destroy(e) {
  }
}
var E = /* @__PURE__ */ function(n) {
  return n[n.Text = 0] = "Text", n[n.WidgetBefore = 1] = "WidgetBefore", n[n.WidgetAfter = 2] = "WidgetAfter", n[n.WidgetRange = 3] = "WidgetRange", n;
}(E || (E = {}));
class C extends vt {
  constructor(e, t, i, r) {
    super(), this.startSide = e, this.endSide = t, this.widget = i, this.spec = r;
  }
  get heightRelevant() {
    return !1;
  }
  static mark(e) {
    return new Vn(e);
  }
  static widget(e) {
    let t = e.side || 0, i = !!e.block;
    return t += i ? t > 0 ? 3e8 : -4e8 : t > 0 ? 1e8 : -1e8, new Pt(e, t, t, i, e.widget || null, !1);
  }
  static replace(e) {
    let t = !!e.block, i, r;
    if (e.isBlockGap)
      i = -5e8, r = 4e8;
    else {
      let { start: s, end: o } = th(e, t);
      i = (s ? t ? -3e8 : -1 : 5e8) - 1, r = (o ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new Pt(e, i, r, t, e.widget || null, !0);
  }
  static line(e) {
    return new Ri(e);
  }
  static set(e, t = !1) {
    return z.of(e, t);
  }
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
C.none = z.empty;
class Vn extends C {
  constructor(e) {
    let { start: t, end: i } = th(e);
    super(t ? -1 : 5e8, i ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.class = e.class || "", this.attrs = e.attributes || null;
  }
  eq(e) {
    return this == e || e instanceof Vn && this.tagName == e.tagName && this.class == e.class && Ms(this.attrs, e.attrs);
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
Vn.prototype.point = !1;
class Ri extends C {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof Ri && Ms(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
Ri.prototype.mapMode = ae.TrackBefore;
Ri.prototype.point = !0;
class Pt extends C {
  constructor(e, t, i, r, s, o) {
    super(t, i, s, e), this.block = r, this.isReplace = o, this.mapMode = r ? t <= 0 ? ae.TrackBefore : ae.TrackAfter : ae.TrackDel;
  }
  get type() {
    return this.startSide < this.endSide ? E.WidgetRange : this.startSide <= 0 ? E.WidgetBefore : E.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && this.widget.estimatedHeight >= 5;
  }
  eq(e) {
    return e instanceof Pt && hu(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
  }
  range(e, t = e) {
    if (this.isReplace && (e > t || e == t && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && t != e)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(e, t);
  }
}
Pt.prototype.point = !0;
function th(n, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: i } = n;
  return t == null && (t = n.inclusive), i == null && (i = n.inclusive), { start: t != null ? t : e, end: i != null ? i : e };
}
function hu(n, e) {
  return n == e || !!(n && e && n.compare(e));
}
function ss(n, e, t, i = 0) {
  let r = t.length - 1;
  r >= 0 && t[r] + i >= n ? t[r] = Math.max(t[r], e) : t.push(n, e);
}
class ue extends G {
  constructor() {
    super(...arguments), this.children = [], this.length = 0, this.prevAttrs = void 0, this.attrs = null, this.breakAfter = 0;
  }
  merge(e, t, i, r, s, o) {
    if (i) {
      if (!(i instanceof ue))
        return !1;
      this.dom || i.transferDOM(this);
    }
    return r && this.setDeco(i ? i.attrs : null), La(this, e, t, i ? i.children : [], s, o), !0;
  }
  split(e) {
    let t = new ue();
    if (t.breakAfter = this.breakAfter, this.length == 0)
      return t;
    let { i, off: r } = this.childPos(e);
    r && (t.append(this.children[i].split(r), 0), this.children[i].merge(r, this.children[i].length, null, !1, 0, 0), i++);
    for (let s = i; s < this.children.length; s++)
      t.append(this.children[s], 0);
    for (; i > 0 && this.children[i - 1].length == 0; )
      this.children[--i].destroy();
    return this.children.length = i, this.markDirty(), this.length = e, t;
  }
  transferDOM(e) {
    !this.dom || (this.markDirty(), e.setDOM(this.dom), e.prevAttrs = this.prevAttrs === void 0 ? this.attrs : this.prevAttrs, this.prevAttrs = void 0, this.dom = null);
  }
  setDeco(e) {
    Ms(this.attrs, e) || (this.dom && (this.prevAttrs = this.attrs, this.markDirty()), this.attrs = e);
  }
  append(e, t) {
    Ka(this, e, t);
  }
  addLineDeco(e) {
    let t = e.spec.attributes, i = e.spec.class;
    t && (this.attrs = ns(t, this.attrs || {})), i && (this.attrs = ns({ class: i }, this.attrs || {}));
  }
  domAtPos(e) {
    return Ja(this.dom, this.children, e);
  }
  reuseDOM(e) {
    e.nodeName == "DIV" && (this.setDOM(e), this.dirty |= 6);
  }
  sync(e) {
    var t;
    this.dom ? this.dirty & 4 && (Va(this.dom), this.dom.className = "cm-line", this.prevAttrs = this.attrs ? null : void 0) : (this.setDOM(document.createElement("div")), this.dom.className = "cm-line", this.prevAttrs = this.attrs ? null : void 0), this.prevAttrs !== void 0 && (rs(this.dom, this.prevAttrs, this.attrs), this.dom.classList.add("cm-line"), this.prevAttrs = void 0), super.sync(e);
    let i = this.dom.lastChild;
    for (; i && G.get(i) instanceof Ue; )
      i = i.lastChild;
    if (!i || !this.length || i.nodeName != "BR" && ((t = G.get(i)) === null || t === void 0 ? void 0 : t.isEditable) == !1 && (!w.ios || !this.children.some((r) => r instanceof Qt))) {
      let r = document.createElement("BR");
      r.cmIgnore = !0, this.dom.appendChild(r);
    }
  }
  measureTextSize() {
    if (this.children.length == 0 || this.length > 20)
      return null;
    let e = 0;
    for (let t of this.children) {
      if (!(t instanceof Qt))
        return null;
      let i = Si(t.dom);
      if (i.length != 1)
        return null;
      e += i[0].width;
    }
    return {
      lineHeight: this.dom.getBoundingClientRect().height,
      charWidth: e / this.length
    };
  }
  coordsAt(e, t) {
    return eh(this, e, t);
  }
  become(e) {
    return !1;
  }
  get type() {
    return E.Text;
  }
  static find(e, t) {
    for (let i = 0, r = 0; i < e.children.length; i++) {
      let s = e.children[i], o = r + s.length;
      if (o >= t) {
        if (s instanceof ue)
          return s;
        if (o > t)
          break;
      }
      r = o + s.breakAfter;
    }
    return null;
  }
}
class Tt extends G {
  constructor(e, t, i) {
    super(), this.widget = e, this.length = t, this.type = i, this.breakAfter = 0, this.prevWidget = null;
  }
  merge(e, t, i, r, s, o) {
    return i && (!(i instanceof Tt) || !this.widget.compare(i.widget) || e > 0 && s <= 0 || t < this.length && o <= 0) ? !1 : (this.length = e + (i ? i.length : 0) + (this.length - t), !0);
  }
  domAtPos(e) {
    return e == 0 ? se.before(this.dom) : se.after(this.dom, e == this.length);
  }
  split(e) {
    let t = this.length - e;
    this.length = e;
    let i = new Tt(this.widget, t, this.type);
    return i.breakAfter = this.breakAfter, i;
  }
  get children() {
    return Ds;
  }
  sync() {
    (!this.dom || !this.widget.updateDOM(this.dom)) && (this.dom && this.prevWidget && this.prevWidget.destroy(this.dom), this.prevWidget = null, this.setDOM(this.widget.toDOM(this.editorView)), this.dom.contentEditable = "false");
  }
  get overrideDOMText() {
    return this.parent ? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd) : j.empty;
  }
  domBoundsAround() {
    return null;
  }
  become(e) {
    return e instanceof Tt && e.type == this.type && e.widget.constructor == this.widget.constructor ? (e.widget.eq(this.widget) || this.markDirty(!0), this.dom && !this.prevWidget && (this.prevWidget = this.widget), this.widget = e.widget, this.length = e.length, this.breakAfter = e.breakAfter, !0) : !1;
  }
  ignoreMutation() {
    return !0;
  }
  ignoreEvent(e) {
    return this.widget.ignoreEvent(e);
  }
  destroy() {
    super.destroy(), this.dom && this.widget.destroy(this.dom);
  }
}
class js {
  constructor(e, t, i, r) {
    this.doc = e, this.pos = t, this.end = i, this.disallowBlockEffectsFor = r, this.content = [], this.curLine = null, this.breakAtStart = 0, this.pendingBuffer = 0, this.atCursorPos = !0, this.openStart = -1, this.openEnd = -1, this.text = "", this.textOff = 0, this.cursor = e.iter(), this.skip = t;
  }
  posCovered() {
    if (this.content.length == 0)
      return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
    let e = this.content[this.content.length - 1];
    return !e.breakAfter && !(e instanceof Tt && e.type == E.WidgetBefore);
  }
  getLine() {
    return this.curLine || (this.content.push(this.curLine = new ue()), this.atCursorPos = !0), this.curLine;
  }
  flushBuffer(e) {
    this.pendingBuffer && (this.curLine.append(zi(new Bt(-1), e), e.length), this.pendingBuffer = 0);
  }
  addBlockWidget(e) {
    this.flushBuffer([]), this.curLine = null, this.content.push(e);
  }
  finish(e) {
    e ? this.pendingBuffer = 0 : this.flushBuffer([]), this.posCovered() || this.getLine();
  }
  buildText(e, t, i) {
    for (; e > 0; ) {
      if (this.textOff == this.text.length) {
        let { value: s, lineBreak: o, done: l } = this.cursor.next(this.skip);
        if (this.skip = 0, l)
          throw new Error("Ran out of text content when drawing inline views");
        if (o) {
          this.posCovered() || this.getLine(), this.content.length ? this.content[this.content.length - 1].breakAfter = 1 : this.breakAtStart = 1, this.flushBuffer([]), this.curLine = null, e--;
          continue;
        } else
          this.text = s, this.textOff = 0;
      }
      let r = Math.min(this.text.length - this.textOff, e, 512);
      this.flushBuffer(t.slice(0, i)), this.getLine().append(zi(new Qt(this.text.slice(this.textOff, this.textOff + r)), t), i), this.atCursorPos = !0, this.textOff += r, e -= r, i = 0;
    }
  }
  span(e, t, i, r) {
    this.buildText(t - e, i, r), this.pos = t, this.openStart < 0 && (this.openStart = r);
  }
  point(e, t, i, r, s, o) {
    if (this.disallowBlockEffectsFor[o] && i instanceof Pt) {
      if (i.block)
        throw new RangeError("Block decorations may not be specified via plugins");
      if (t > this.doc.lineAt(this.pos).to)
        throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
    }
    let l = t - e;
    if (i instanceof Pt)
      if (i.block) {
        let { type: a } = i;
        a == E.WidgetAfter && !this.posCovered() && this.getLine(), this.addBlockWidget(new Tt(i.widget || new Ro("div"), l, a));
      } else {
        let a = ht.create(i.widget || new Ro("span"), l, i.startSide), h = this.atCursorPos && !a.isEditable && s <= r.length && (e < t || i.startSide > 0), c = !a.isEditable && (e < t || i.startSide <= 0), f = this.getLine();
        this.pendingBuffer == 2 && !h && (this.pendingBuffer = 0), this.flushBuffer(r), h && (f.append(zi(new Bt(1), r), s), s = r.length + Math.max(0, s - r.length)), f.append(zi(a, r), s), this.atCursorPos = c, this.pendingBuffer = c ? e < t ? 1 : 2 : 0;
      }
    else
      this.doc.lineAt(this.pos).from == this.pos && this.getLine().addLineDeco(i);
    l && (this.textOff + l <= this.text.length ? this.textOff += l : (this.skip += l - (this.text.length - this.textOff), this.text = "", this.textOff = 0), this.pos = t), this.openStart < 0 && (this.openStart = s);
  }
  static build(e, t, i, r, s) {
    let o = new js(e, t, i, s);
    return o.openEnd = z.spans(r, t, i, o), o.openStart < 0 && (o.openStart = o.openEnd), o.finish(o.openEnd), o;
  }
}
function zi(n, e) {
  for (let t of e)
    n = new Ue(t, [n], n.length);
  return n;
}
class Ro extends St {
  constructor(e) {
    super(), this.tag = e;
  }
  eq(e) {
    return e.tag == this.tag;
  }
  toDOM() {
    return document.createElement(this.tag);
  }
  updateDOM(e) {
    return e.nodeName.toLowerCase() == this.tag;
  }
}
const ih = /* @__PURE__ */ v.define(), nh = /* @__PURE__ */ v.define(), rh = /* @__PURE__ */ v.define(), sh = /* @__PURE__ */ v.define(), os = /* @__PURE__ */ v.define(), oh = /* @__PURE__ */ v.define(), lh = /* @__PURE__ */ v.define({
  combine: (n) => n.some((e) => e)
});
class gn {
  constructor(e, t = "nearest", i = "nearest", r = 5, s = 5) {
    this.range = e, this.y = t, this.x = i, this.yMargin = r, this.xMargin = s;
  }
  map(e) {
    return e.empty ? this : new gn(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin);
  }
}
const Co = /* @__PURE__ */ Z.define({ map: (n, e) => n.map(e) });
function Me(n, e, t) {
  let i = n.facet(sh);
  i.length ? i[0](e) : window.onerror ? window.onerror(String(e), t, void 0, void 0, e) : t ? console.error(t + ":", e) : console.error(e);
}
const Nn = /* @__PURE__ */ v.define({ combine: (n) => n.length ? n[0] : !0 });
let cu = 0;
const ai = /* @__PURE__ */ v.define();
class he {
  constructor(e, t, i, r) {
    this.id = e, this.create = t, this.domEventHandlers = i, this.extension = r(this);
  }
  static define(e, t) {
    const { eventHandlers: i, provide: r, decorations: s } = t || {};
    return new he(cu++, e, i, (o) => {
      let l = [ai.of(o)];
      return s && l.push($i.of((a) => {
        let h = a.plugin(o);
        return h ? s(h) : C.none;
      })), r && l.push(r(o)), l;
    });
  }
  static fromClass(e, t) {
    return he.define((i) => new e(i), t);
  }
}
class fr {
  constructor(e) {
    this.spec = e, this.mustUpdate = null, this.value = null;
  }
  update(e) {
    if (this.value) {
      if (this.mustUpdate) {
        let t = this.mustUpdate;
        if (this.mustUpdate = null, this.value.update)
          try {
            this.value.update(t);
          } catch (i) {
            if (Me(t.state, i, "CodeMirror plugin crashed"), this.value.destroy)
              try {
                this.value.destroy();
              } catch {
              }
            this.deactivate();
          }
      }
    } else if (this.spec)
      try {
        this.value = this.spec.create(e);
      } catch (t) {
        Me(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(e) {
    var t;
    if (!((t = this.value) === null || t === void 0) && t.destroy)
      try {
        this.value.destroy();
      } catch (i) {
        Me(e.state, i, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const ah = /* @__PURE__ */ v.define(), hh = /* @__PURE__ */ v.define(), $i = /* @__PURE__ */ v.define(), ch = /* @__PURE__ */ v.define(), fh = /* @__PURE__ */ v.define(), hi = /* @__PURE__ */ v.define();
class et {
  constructor(e, t, i, r) {
    this.fromA = e, this.toA = t, this.fromB = i, this.toB = r;
  }
  join(e) {
    return new et(Math.min(this.fromA, e.fromA), Math.max(this.toA, e.toA), Math.min(this.fromB, e.fromB), Math.max(this.toB, e.toB));
  }
  addToSet(e) {
    let t = e.length, i = this;
    for (; t > 0; t--) {
      let r = e[t - 1];
      if (!(r.fromA > i.toA)) {
        if (r.toA < i.fromA)
          break;
        i = i.join(r), e.splice(t - 1, 1);
      }
    }
    return e.splice(t, 0, i), e;
  }
  static extendWithRanges(e, t) {
    if (t.length == 0)
      return e;
    let i = [];
    for (let r = 0, s = 0, o = 0, l = 0; ; r++) {
      let a = r == e.length ? null : e[r], h = o - l, c = a ? a.fromB : 1e9;
      for (; s < t.length && t[s] < c; ) {
        let f = t[s], u = t[s + 1], d = Math.max(l, f), O = Math.min(c, u);
        if (d <= O && new et(d + h, O + h, d, O).addToSet(i), u > c)
          break;
        s += 2;
      }
      if (!a)
        return i;
      new et(a.fromA, a.toA, a.fromB, a.toB).addToSet(i), o = a.toA, l = a.toB;
    }
  }
}
class mn {
  constructor(e, t, i) {
    this.view = e, this.state = t, this.transactions = i, this.flags = 0, this.startState = e.state, this.changes = J.empty(this.startState.doc.length);
    for (let o of i)
      this.changes = this.changes.compose(o.changes);
    let r = [];
    this.changes.iterChangedRanges((o, l, a, h) => r.push(new et(o, l, a, h))), this.changedRanges = r;
    let s = e.hasFocus;
    s != e.inputState.notifiedFocused && (e.inputState.notifiedFocused = s, this.flags |= 1);
  }
  static create(e, t, i) {
    return new mn(e, t, i);
  }
  get viewportChanged() {
    return (this.flags & 4) > 0;
  }
  get heightChanged() {
    return (this.flags & 2) > 0;
  }
  get geometryChanged() {
    return this.docChanged || (this.flags & 10) > 0;
  }
  get focusChanged() {
    return (this.flags & 1) > 0;
  }
  get docChanged() {
    return !this.changes.empty;
  }
  get selectionSet() {
    return this.transactions.some((e) => e.selection);
  }
  get empty() {
    return this.flags == 0 && this.transactions.length == 0;
  }
}
var U = /* @__PURE__ */ function(n) {
  return n[n.LTR = 0] = "LTR", n[n.RTL = 1] = "RTL", n;
}(U || (U = {}));
const ls = U.LTR, fu = U.RTL;
function uh(n) {
  let e = [];
  for (let t = 0; t < n.length; t++)
    e.push(1 << +n[t]);
  return e;
}
const uu = /* @__PURE__ */ uh("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), du = /* @__PURE__ */ uh("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), as = /* @__PURE__ */ Object.create(null), ze = [];
for (let n of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ n.charCodeAt(0), t = /* @__PURE__ */ n.charCodeAt(1);
  as[e] = t, as[t] = -e;
}
function Ou(n) {
  return n <= 247 ? uu[n] : 1424 <= n && n <= 1524 ? 2 : 1536 <= n && n <= 1785 ? du[n - 1536] : 1774 <= n && n <= 2220 ? 4 : 8192 <= n && n <= 8203 || n == 8204 ? 256 : 1;
}
const pu = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
class _t {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.level = i;
  }
  get dir() {
    return this.level % 2 ? fu : ls;
  }
  side(e, t) {
    return this.dir == t == e ? this.to : this.from;
  }
  static find(e, t, i, r) {
    let s = -1;
    for (let o = 0; o < e.length; o++) {
      let l = e[o];
      if (l.from <= t && l.to >= t) {
        if (l.level == i)
          return o;
        (s < 0 || (r != 0 ? r < 0 ? l.from < t : l.to > t : e[s].level > l.level)) && (s = o);
      }
    }
    if (s < 0)
      throw new RangeError("Index out of range");
    return s;
  }
}
const V = [];
function gu(n, e) {
  let t = n.length, i = e == ls ? 1 : 2, r = e == ls ? 2 : 1;
  if (!n || i == 1 && !pu.test(n))
    return dh(t);
  for (let o = 0, l = i, a = i; o < t; o++) {
    let h = Ou(n.charCodeAt(o));
    h == 512 ? h = l : h == 8 && a == 4 && (h = 16), V[o] = h == 4 ? 2 : h, h & 7 && (a = h), l = h;
  }
  for (let o = 0, l = i, a = i; o < t; o++) {
    let h = V[o];
    if (h == 128)
      o < t - 1 && l == V[o + 1] && l & 24 ? h = V[o] = l : V[o] = 256;
    else if (h == 64) {
      let c = o + 1;
      for (; c < t && V[c] == 64; )
        c++;
      let f = o && l == 8 || c < t && V[c] == 8 ? a == 1 ? 1 : 8 : 256;
      for (let u = o; u < c; u++)
        V[u] = f;
      o = c - 1;
    } else
      h == 8 && a == 1 && (V[o] = 1);
    l = h, h & 7 && (a = h);
  }
  for (let o = 0, l = 0, a = 0, h, c, f; o < t; o++)
    if (c = as[h = n.charCodeAt(o)])
      if (c < 0) {
        for (let u = l - 3; u >= 0; u -= 3)
          if (ze[u + 1] == -c) {
            let d = ze[u + 2], O = d & 2 ? i : d & 4 ? d & 1 ? r : i : 0;
            O && (V[o] = V[ze[u]] = O), l = u;
            break;
          }
      } else {
        if (ze.length == 189)
          break;
        ze[l++] = o, ze[l++] = h, ze[l++] = a;
      }
    else if ((f = V[o]) == 2 || f == 1) {
      let u = f == i;
      a = u ? 0 : 1;
      for (let d = l - 3; d >= 0; d -= 3) {
        let O = ze[d + 2];
        if (O & 2)
          break;
        if (u)
          ze[d + 2] |= 2;
        else {
          if (O & 4)
            break;
          ze[d + 2] |= 4;
        }
      }
    }
  for (let o = 0; o < t; o++)
    if (V[o] == 256) {
      let l = o + 1;
      for (; l < t && V[l] == 256; )
        l++;
      let a = (o ? V[o - 1] : i) == 1, h = (l < t ? V[l] : i) == 1, c = a == h ? a ? 1 : 2 : i;
      for (let f = o; f < l; f++)
        V[f] = c;
      o = l - 1;
    }
  let s = [];
  if (i == 1)
    for (let o = 0; o < t; ) {
      let l = o, a = V[o++] != 1;
      for (; o < t && a == (V[o] != 1); )
        o++;
      if (a)
        for (let h = o; h > l; ) {
          let c = h, f = V[--h] != 2;
          for (; h > l && f == (V[h - 1] != 2); )
            h--;
          s.push(new _t(h, c, f ? 2 : 1));
        }
      else
        s.push(new _t(l, o, 0));
    }
  else
    for (let o = 0; o < t; ) {
      let l = o, a = V[o++] == 2;
      for (; o < t && a == (V[o] == 2); )
        o++;
      s.push(new _t(l, o, a ? 1 : 2));
    }
  return s;
}
function dh(n) {
  return [new _t(0, n, 0)];
}
let Oh = "";
function mu(n, e, t, i, r) {
  var s;
  let o = i.head - n.from, l = -1;
  if (o == 0) {
    if (!r || !n.length)
      return null;
    e[0].level != t && (o = e[0].side(!1, t), l = 0);
  } else if (o == n.length) {
    if (r)
      return null;
    let u = e[e.length - 1];
    u.level != t && (o = u.side(!0, t), l = e.length - 1);
  }
  l < 0 && (l = _t.find(e, o, (s = i.bidiLevel) !== null && s !== void 0 ? s : -1, i.assoc));
  let a = e[l];
  o == a.side(r, t) && (a = e[l += r ? 1 : -1], o = a.side(!r, t));
  let h = r == (a.dir == t), c = ke(n.text, o, h);
  if (Oh = n.text.slice(Math.min(o, c), Math.max(o, c)), c != a.side(r, t))
    return m.cursor(c + n.from, h ? -1 : 1, a.level);
  let f = l == (r ? e.length - 1 : 0) ? null : e[l + (r ? 1 : -1)];
  return !f && a.level != t ? m.cursor(r ? n.to : n.from, r ? -1 : 1, t) : f && f.level < a.level ? m.cursor(f.side(!r, t) + n.from, r ? 1 : -1, f.level) : m.cursor(c + n.from, r ? -1 : 1, a.level);
}
const ct = "\uFFFF";
class ph {
  constructor(e, t) {
    this.points = e, this.text = "", this.lineSeparator = t.facet(M.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += ct;
  }
  readRange(e, t) {
    if (!e)
      return this;
    let i = e.parentNode;
    for (let r = e; ; ) {
      this.findPointBefore(i, r), this.readNode(r);
      let s = r.nextSibling;
      if (s == t)
        break;
      let o = G.get(r), l = G.get(s);
      (o && l ? o.breakAfter : (o ? o.breakAfter : Ao(r)) || Ao(s) && (r.nodeName != "BR" || r.cmIgnore)) && this.lineBreak(), r = s;
    }
    return this.findPointBefore(i, t), this;
  }
  readTextNode(e) {
    let t = e.nodeValue;
    for (let i of this.points)
      i.node == e && (i.pos = this.text.length + Math.min(i.offset, t.length));
    for (let i = 0, r = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
      let s = -1, o = 1, l;
      if (this.lineSeparator ? (s = t.indexOf(this.lineSeparator, i), o = this.lineSeparator.length) : (l = r.exec(t)) && (s = l.index, o = l[0].length), this.append(t.slice(i, s < 0 ? t.length : s)), s < 0)
        break;
      if (this.lineBreak(), o > 1)
        for (let a of this.points)
          a.node == e && a.pos > this.text.length && (a.pos -= o - 1);
      i = s + o;
    }
  }
  readNode(e) {
    if (e.cmIgnore)
      return;
    let t = G.get(e), i = t && t.overrideDOMText;
    if (i != null) {
      this.findPointInside(e, i.length);
      for (let r = i.iter(); !r.next().done; )
        r.lineBreak ? this.lineBreak() : this.append(r.value);
    } else
      e.nodeType == 3 ? this.readTextNode(e) : e.nodeName == "BR" ? e.nextSibling && this.lineBreak() : e.nodeType == 1 && this.readRange(e.firstChild, null);
  }
  findPointBefore(e, t) {
    for (let i of this.points)
      i.node == e && e.childNodes[i.offset] == t && (i.pos = this.text.length);
  }
  findPointInside(e, t) {
    for (let i of this.points)
      (e.nodeType == 3 ? i.node == e : e.contains(i.node)) && (i.pos = this.text.length + Math.min(t, i.offset));
  }
}
function Ao(n) {
  return n.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(n.nodeName);
}
class Wo {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class Xo extends G {
  constructor(e) {
    super(), this.view = e, this.compositionDeco = C.none, this.decorations = [], this.dynamicDecorationMap = [], this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.setDOM(e.contentDOM), this.children = [new ue()], this.children[0].setParent(this), this.updateDeco(), this.updateInner([new et(0, 0, 0, e.state.doc.length)], 0);
  }
  get root() {
    return this.view.root;
  }
  get editorView() {
    return this.view;
  }
  get length() {
    return this.view.state.doc.length;
  }
  update(e) {
    let t = e.changedRanges;
    this.minWidth > 0 && t.length && (t.every(({ fromA: o, toA: l }) => l < this.minWidthFrom || o > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.view.inputState.composing < 0 ? this.compositionDeco = C.none : (e.transactions.length || this.dirty) && (this.compositionDeco = bu(this.view, e.changes)), (w.ie || w.chrome) && !this.compositionDeco.size && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let i = this.decorations, r = this.updateDeco(), s = $u(i, r, e.changes);
    return t = et.extendWithRanges(t, s), this.dirty == 0 && t.length == 0 ? !1 : (this.updateInner(t, e.startState.doc.length), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  updateInner(e, t) {
    this.view.viewState.mustMeasureContent = !0, this.updateChildren(e, t);
    let { observer: i } = this.view;
    i.ignore(() => {
      this.dom.style.height = this.view.viewState.contentHeight + "px", this.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let s = w.chrome || w.ios ? { node: i.selectionRange.focusNode, written: !1 } : void 0;
      this.sync(s), this.dirty = 0, s && (s.written || i.selectionRange.focusNode != s.node) && (this.forceSelection = !0), this.dom.style.height = "";
    });
    let r = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let s of this.children)
        s instanceof Tt && s.widget instanceof Zo && r.push(s.dom);
    i.updateGaps(r);
  }
  updateChildren(e, t) {
    let i = this.childCursor(t);
    for (let r = e.length - 1; ; r--) {
      let s = r >= 0 ? e[r] : null;
      if (!s)
        break;
      let { fromA: o, toA: l, fromB: a, toB: h } = s, { content: c, breakAtStart: f, openStart: u, openEnd: d } = js.build(this.view.state.doc, a, h, this.decorations, this.dynamicDecorationMap), { i: O, off: g } = i.findPos(l, 1), { i: Q, off: b } = i.findPos(o, -1);
      Ba(this, Q, b, O, g, c, f, u, d);
    }
  }
  updateSelection(e = !1, t = !1) {
    if ((e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange(), !(t || this.mayControlSelection()) || w.ios && this.view.inputState.rapidCompositionStart)
      return;
    let i = this.forceSelection;
    this.forceSelection = !1;
    let r = this.view.state.selection.main, s = this.domAtPos(r.anchor), o = r.empty ? s : this.domAtPos(r.head);
    if (w.gecko && r.empty && Qu(s)) {
      let a = document.createTextNode("");
      this.view.observer.ignore(() => s.node.insertBefore(a, s.node.childNodes[s.offset] || null)), s = o = new se(a, 0), i = !0;
    }
    let l = this.view.observer.selectionRange;
    (i || !l.focusNode || !On(s.node, s.offset, l.anchorNode, l.anchorOffset) || !On(o.node, o.offset, l.focusNode, l.focusOffset)) && (this.view.observer.ignore(() => {
      w.android && w.chrome && this.dom.contains(l.focusNode) && ku(l.focusNode, this.dom) && (this.dom.blur(), this.dom.focus({ preventScroll: !0 }));
      let a = dn(this.root);
      if (a)
        if (r.empty) {
          if (w.gecko) {
            let h = Su(s.node, s.offset);
            if (h && h != 3) {
              let c = mh(s.node, s.offset, h == 1 ? 1 : -1);
              c && (s = new se(c, h == 1 ? 0 : c.nodeValue.length));
            }
          }
          a.collapse(s.node, s.offset), r.bidiLevel != null && l.cursorBidiLevel != null && (l.cursorBidiLevel = r.bidiLevel);
        } else if (a.extend)
          a.collapse(s.node, s.offset), a.extend(o.node, o.offset);
        else {
          let h = document.createRange();
          r.anchor > r.head && ([s, o] = [o, s]), h.setEnd(o.node, o.offset), h.setStart(s.node, s.offset), a.removeAllRanges(), a.addRange(h);
        }
    }), this.view.observer.setSelectionRange(s, o)), this.impreciseAnchor = s.precise ? null : new se(l.anchorNode, l.anchorOffset), this.impreciseHead = o.precise ? null : new se(l.focusNode, l.focusOffset);
  }
  enforceCursorAssoc() {
    if (this.compositionDeco.size)
      return;
    let e = this.view.state.selection.main, t = dn(this.root);
    if (!t || !e.empty || !e.assoc || !t.modify)
      return;
    let i = ue.find(this, e.head);
    if (!i)
      return;
    let r = i.posAtStart;
    if (e.head == r || e.head == r + i.length)
      return;
    let s = this.coordsAt(e.head, -1), o = this.coordsAt(e.head, 1);
    if (!s || !o || s.bottom > o.top)
      return;
    let l = this.domAtPos(e.head + e.assoc);
    t.collapse(l.node, l.offset), t.modify("move", e.assoc < 0 ? "forward" : "backward", "lineboundary");
  }
  mayControlSelection() {
    let e = this.root.activeElement;
    return e == this.dom || tn(this.dom, this.view.observer.selectionRange) && !(e && this.dom.contains(e));
  }
  nearest(e) {
    for (let t = e; t; ) {
      let i = G.get(t);
      if (i && i.rootView == this)
        return i;
      t = t.parentNode;
    }
    return null;
  }
  posFromDOM(e, t) {
    let i = this.nearest(e);
    if (!i)
      throw new RangeError("Trying to find position for a DOM position outside of the document");
    return i.localPosFromDOM(e, t) + i.posAtStart;
  }
  domAtPos(e) {
    let { i: t, off: i } = this.childCursor().findPos(e, -1);
    for (; t < this.children.length - 1; ) {
      let r = this.children[t];
      if (i < r.length || r instanceof ue)
        break;
      t++, i = 0;
    }
    return this.children[t].domAtPos(i);
  }
  coordsAt(e, t) {
    for (let i = this.length, r = this.children.length - 1; ; r--) {
      let s = this.children[r], o = i - s.breakAfter - s.length;
      if (e > o || e == o && s.type != E.WidgetBefore && s.type != E.WidgetAfter && (!r || t == 2 || this.children[r - 1].breakAfter || this.children[r - 1].type == E.WidgetBefore && t > -2))
        return s.coordsAt(e - o, t);
      i = o;
    }
  }
  measureVisibleLineHeights(e) {
    let t = [], { from: i, to: r } = e, s = this.view.contentDOM.clientWidth, o = s > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, l = -1, a = this.view.textDirection == U.LTR;
    for (let h = 0, c = 0; c < this.children.length; c++) {
      let f = this.children[c], u = h + f.length;
      if (u > r)
        break;
      if (h >= i) {
        let d = f.dom.getBoundingClientRect();
        if (t.push(d.height), o) {
          let O = f.dom.lastChild, g = O ? Si(O) : [];
          if (g.length) {
            let Q = g[g.length - 1], b = a ? Q.right - d.left : d.right - Q.left;
            b > l && (l = b, this.minWidth = s, this.minWidthFrom = h, this.minWidthTo = u);
          }
        }
      }
      h = u + f.breakAfter;
    }
    return t;
  }
  textDirectionAt(e) {
    let { i: t } = this.childPos(e, 1);
    return getComputedStyle(this.children[t].dom).direction == "rtl" ? U.RTL : U.LTR;
  }
  measureTextSize() {
    for (let r of this.children)
      if (r instanceof ue) {
        let s = r.measureTextSize();
        if (s)
          return s;
      }
    let e = document.createElement("div"), t, i;
    return e.className = "cm-line", e.style.width = "99999px", e.textContent = "abc def ghi jkl mno pqr stu", this.view.observer.ignore(() => {
      this.dom.appendChild(e);
      let r = Si(e.firstChild)[0];
      t = e.getBoundingClientRect().height, i = r ? r.width / 27 : 7, e.remove();
    }), { lineHeight: t, charWidth: i };
  }
  childCursor(e = this.length) {
    let t = this.children.length;
    return t && (e -= this.children[--t].length), new Na(this.children, e, t);
  }
  computeBlockGapDeco() {
    let e = [], t = this.view.viewState;
    for (let i = 0, r = 0; ; r++) {
      let s = r == t.viewports.length ? null : t.viewports[r], o = s ? s.from - 1 : this.length;
      if (o > i) {
        let l = t.lineBlockAt(o).bottom - t.lineBlockAt(i).top;
        e.push(C.replace({
          widget: new Zo(l),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(i, o));
      }
      if (!s)
        break;
      i = s.to + 1;
    }
    return C.set(e);
  }
  updateDeco() {
    let e = this.view.state.facet($i).map((t, i) => (this.dynamicDecorationMap[i] = typeof t == "function") ? t(this.view) : t);
    for (let t = e.length; t < e.length + 3; t++)
      this.dynamicDecorationMap[t] = !1;
    return this.decorations = [
      ...e,
      this.compositionDeco,
      this.computeBlockGapDeco(),
      this.view.viewState.lineGapDeco
    ];
  }
  scrollIntoView(e) {
    let { range: t } = e, i = this.coordsAt(t.head, t.empty ? t.assoc : t.head > t.anchor ? -1 : 1), r;
    if (!i)
      return;
    !t.empty && (r = this.coordsAt(t.anchor, t.anchor > t.head ? -1 : 1)) && (i = {
      left: Math.min(i.left, r.left),
      top: Math.min(i.top, r.top),
      right: Math.max(i.right, r.right),
      bottom: Math.max(i.bottom, r.bottom)
    });
    let s = 0, o = 0, l = 0, a = 0;
    for (let c of this.view.state.facet(fh).map((f) => f(this.view)))
      if (c) {
        let { left: f, right: u, top: d, bottom: O } = c;
        f != null && (s = Math.max(s, f)), u != null && (o = Math.max(o, u)), d != null && (l = Math.max(l, d)), O != null && (a = Math.max(a, O));
      }
    let h = {
      left: i.left - s,
      top: i.top - l,
      right: i.right + o,
      bottom: i.bottom + a
    };
    nu(this.view.scrollDOM, h, t.head < t.anchor ? -1 : 1, e.x, e.y, e.xMargin, e.yMargin, this.view.textDirection == U.LTR);
  }
}
function Qu(n) {
  return n.node.nodeType == 1 && n.node.firstChild && (n.offset == 0 || n.node.childNodes[n.offset - 1].contentEditable == "false") && (n.offset == n.node.childNodes.length || n.node.childNodes[n.offset].contentEditable == "false");
}
class Zo extends St {
  constructor(e) {
    super(), this.height = e;
  }
  toDOM() {
    let e = document.createElement("div");
    return this.updateDOM(e), e;
  }
  eq(e) {
    return e.height == this.height;
  }
  updateDOM(e) {
    return e.style.height = this.height + "px", !0;
  }
  get estimatedHeight() {
    return this.height;
  }
}
function gh(n) {
  let e = n.observer.selectionRange, t = e.focusNode && mh(e.focusNode, e.focusOffset, 0);
  if (!t)
    return null;
  let i = n.docView.nearest(t);
  if (!i)
    return null;
  if (i instanceof ue) {
    let r = t;
    for (; r.parentNode != i.dom; )
      r = r.parentNode;
    let s = r.previousSibling;
    for (; s && !G.get(s); )
      s = s.previousSibling;
    let o = s ? G.get(s).posAtEnd : i.posAtStart;
    return { from: o, to: o, node: r, text: t };
  } else {
    for (; ; ) {
      let { parent: s } = i;
      if (!s)
        return null;
      if (s instanceof ue)
        break;
      i = s;
    }
    let r = i.posAtStart;
    return { from: r, to: r + i.length, node: i.dom, text: t };
  }
}
function bu(n, e) {
  let t = gh(n);
  if (!t)
    return C.none;
  let { from: i, to: r, node: s, text: o } = t, l = e.mapPos(i, 1), a = Math.max(l, e.mapPos(r, -1)), { state: h } = n, c = s.nodeType == 3 ? s.nodeValue : new ph([], h).readRange(s.firstChild, null).text;
  if (a - l < c.length)
    if (h.doc.sliceString(l, Math.min(h.doc.length, l + c.length), ct) == c)
      a = l + c.length;
    else if (h.doc.sliceString(Math.max(0, a - c.length), a, ct) == c)
      l = a - c.length;
    else
      return C.none;
  else if (h.doc.sliceString(l, a, ct) != c)
    return C.none;
  let f = G.get(s);
  return f instanceof Fa ? f = f.widget.topView : f && (f.parent = null), C.set(C.replace({ widget: new yu(s, o, f), inclusive: !0 }).range(l, a));
}
class yu extends St {
  constructor(e, t, i) {
    super(), this.top = e, this.text = t, this.topView = i;
  }
  eq(e) {
    return this.top == e.top && this.text == e.text;
  }
  toDOM() {
    return this.top;
  }
  ignoreEvent() {
    return !1;
  }
  get customView() {
    return Fa;
  }
}
function mh(n, e, t) {
  for (; ; ) {
    if (n.nodeType == 3)
      return n;
    if (n.nodeType == 1 && e > 0 && t <= 0)
      n = n.childNodes[e - 1], e = xi(n);
    else if (n.nodeType == 1 && e < n.childNodes.length && t >= 0)
      n = n.childNodes[e], e = 0;
    else
      return null;
  }
}
function Su(n, e) {
  return n.nodeType != 1 ? 0 : (e && n.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < n.childNodes.length && n.childNodes[e].contentEditable == "false" ? 2 : 0);
}
class xu {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    ss(e, t, this.changes);
  }
  comparePoint(e, t) {
    ss(e, t, this.changes);
  }
}
function $u(n, e, t) {
  let i = new xu();
  return z.compare(n, e, t, i), i.changes;
}
function ku(n, e) {
  for (let t = n; t && t != e; t = t.assignedSlot || t.parentNode)
    if (t.nodeType == 1 && t.contentEditable == "false")
      return !0;
  return !1;
}
function wu(n, e, t = 1) {
  let i = n.charCategorizer(e), r = n.doc.lineAt(e), s = e - r.from;
  if (r.length == 0)
    return m.cursor(e);
  s == 0 ? t = 1 : s == r.length && (t = -1);
  let o = s, l = s;
  t < 0 ? o = ke(r.text, s, !1) : l = ke(r.text, s);
  let a = i(r.text.slice(o, l));
  for (; o > 0; ) {
    let h = ke(r.text, o, !1);
    if (i(r.text.slice(h, o)) != a)
      break;
    o = h;
  }
  for (; l < r.length; ) {
    let h = ke(r.text, l);
    if (i(r.text.slice(l, h)) != a)
      break;
    l = h;
  }
  return m.range(o + r.from, l + r.from);
}
function Tu(n, e) {
  return e.left > n ? e.left - n : Math.max(0, n - e.right);
}
function vu(n, e) {
  return e.top > n ? e.top - n : Math.max(0, n - e.bottom);
}
function ur(n, e) {
  return n.top < e.bottom - 1 && n.bottom > e.top + 1;
}
function Do(n, e) {
  return e < n.top ? { top: e, left: n.left, right: n.right, bottom: n.bottom } : n;
}
function Mo(n, e) {
  return e > n.bottom ? { top: n.top, left: n.left, right: n.right, bottom: e } : n;
}
function hs(n, e, t) {
  let i, r, s, o, l, a, h, c;
  for (let d = n.firstChild; d; d = d.nextSibling) {
    let O = Si(d);
    for (let g = 0; g < O.length; g++) {
      let Q = O[g];
      r && ur(r, Q) && (Q = Do(Mo(Q, r.bottom), r.top));
      let b = Tu(e, Q), k = vu(t, Q);
      if (b == 0 && k == 0)
        return d.nodeType == 3 ? jo(d, e, t) : hs(d, e, t);
      (!i || o > k || o == k && s > b) && (i = d, r = Q, s = b, o = k), b == 0 ? t > Q.bottom && (!h || h.bottom < Q.bottom) ? (l = d, h = Q) : t < Q.top && (!c || c.top > Q.top) && (a = d, c = Q) : h && ur(h, Q) ? h = Mo(h, Q.bottom) : c && ur(c, Q) && (c = Do(c, Q.top));
    }
  }
  if (h && h.bottom >= t ? (i = l, r = h) : c && c.top <= t && (i = a, r = c), !i)
    return { node: n, offset: 0 };
  let f = Math.max(r.left, Math.min(r.right, e));
  if (i.nodeType == 3)
    return jo(i, f, t);
  if (!s && i.contentEditable == "true")
    return hs(i, f, t);
  let u = Array.prototype.indexOf.call(n.childNodes, i) + (e >= (r.left + r.right) / 2 ? 1 : 0);
  return { node: n, offset: u };
}
function jo(n, e, t) {
  let i = n.nodeValue.length, r = -1, s = 1e9, o = 0;
  for (let l = 0; l < i; l++) {
    let a = Nt(n, l, l + 1).getClientRects();
    for (let h = 0; h < a.length; h++) {
      let c = a[h];
      if (c.top == c.bottom)
        continue;
      o || (o = e - c.left);
      let f = (c.top > t ? c.top - t : t - c.bottom) - 1;
      if (c.left - 1 <= e && c.right + 1 >= e && f < s) {
        let u = e >= (c.left + c.right) / 2, d = u;
        if ((w.chrome || w.gecko) && Nt(n, l).getBoundingClientRect().left == c.right && (d = !u), f <= 0)
          return { node: n, offset: l + (d ? 1 : 0) };
        r = l + (d ? 1 : 0), s = f;
      }
    }
  }
  return { node: n, offset: r > -1 ? r : o > 0 ? n.nodeValue.length : 0 };
}
function Qh(n, { x: e, y: t }, i, r = -1) {
  var s;
  let o = n.contentDOM.getBoundingClientRect(), l = o.top + n.viewState.paddingTop, a, { docHeight: h } = n.viewState, c = t - l;
  if (c < 0)
    return 0;
  if (c > h)
    return n.state.doc.length;
  for (let b = n.defaultLineHeight / 2, k = !1; a = n.elementAtHeight(c), a.type != E.Text; )
    for (; c = r > 0 ? a.bottom + b : a.top - b, !(c >= 0 && c <= h); ) {
      if (k)
        return i ? null : 0;
      k = !0, r = -r;
    }
  t = l + c;
  let f = a.from;
  if (f < n.viewport.from)
    return n.viewport.from == 0 ? 0 : i ? null : zo(n, o, a, e, t);
  if (f > n.viewport.to)
    return n.viewport.to == n.state.doc.length ? n.state.doc.length : i ? null : zo(n, o, a, e, t);
  let u = n.dom.ownerDocument, d = n.root.elementFromPoint ? n.root : u, O = d.elementFromPoint(e, t);
  O && !n.contentDOM.contains(O) && (O = null), O || (e = Math.max(o.left + 1, Math.min(o.right - 1, e)), O = d.elementFromPoint(e, t), O && !n.contentDOM.contains(O) && (O = null));
  let g, Q = -1;
  if (O && ((s = n.docView.nearest(O)) === null || s === void 0 ? void 0 : s.isEditable) != !1) {
    if (u.caretPositionFromPoint) {
      let b = u.caretPositionFromPoint(e, t);
      b && ({ offsetNode: g, offset: Q } = b);
    } else if (u.caretRangeFromPoint) {
      let b = u.caretRangeFromPoint(e, t);
      b && ({ startContainer: g, startOffset: Q } = b, (w.safari && Pu(g, Q, e) || w.chrome && Ru(g, Q, e)) && (g = void 0));
    }
  }
  if (!g || !n.docView.dom.contains(g)) {
    let b = ue.find(n.docView, f);
    if (!b)
      return c > a.top + a.height / 2 ? a.to : a.from;
    ({ node: g, offset: Q } = hs(b.dom, e, t));
  }
  return n.docView.posFromDOM(g, Q);
}
function zo(n, e, t, i, r) {
  let s = Math.round((i - e.left) * n.defaultCharacterWidth);
  n.lineWrapping && t.height > n.defaultLineHeight * 1.5 && (s += Math.floor((r - t.top) / n.defaultLineHeight) * n.viewState.heightOracle.lineLength);
  let o = n.state.sliceDoc(t.from, t.to);
  return t.from + Uf(o, s, n.state.tabSize);
}
function Pu(n, e, t) {
  let i;
  if (n.nodeType != 3 || e != (i = n.nodeValue.length))
    return !1;
  for (let r = n.nextSibling; r; r = r.nextSibling)
    if (r.nodeType != 1 || r.nodeName != "BR")
      return !1;
  return Nt(n, i - 1, i).getBoundingClientRect().left > t;
}
function Ru(n, e, t) {
  if (e != 0)
    return !1;
  for (let r = n; ; ) {
    let s = r.parentNode;
    if (!s || s.nodeType != 1 || s.firstChild != r)
      return !1;
    if (s.classList.contains("cm-line"))
      break;
    r = s;
  }
  let i = n.nodeType == 1 ? n.getBoundingClientRect() : Nt(n, 0, Math.max(n.nodeValue.length, 1)).getBoundingClientRect();
  return t - i.left > 5;
}
function Cu(n, e, t, i) {
  let r = n.state.doc.lineAt(e.head), s = !i || !n.lineWrapping ? null : n.coordsAtPos(e.assoc < 0 && e.head > r.from ? e.head - 1 : e.head);
  if (s) {
    let a = n.dom.getBoundingClientRect(), h = n.textDirectionAt(r.from), c = n.posAtCoords({
      x: t == (h == U.LTR) ? a.right - 1 : a.left + 1,
      y: (s.top + s.bottom) / 2
    });
    if (c != null)
      return m.cursor(c, t ? -1 : 1);
  }
  let o = ue.find(n.docView, e.head), l = o ? t ? o.posAtEnd : o.posAtStart : t ? r.to : r.from;
  return m.cursor(l, t ? -1 : 1);
}
function qo(n, e, t, i) {
  let r = n.state.doc.lineAt(e.head), s = n.bidiSpans(r), o = n.textDirectionAt(r.from);
  for (let l = e, a = null; ; ) {
    let h = mu(r, s, o, l, t), c = Oh;
    if (!h) {
      if (r.number == (t ? n.state.doc.lines : 1))
        return l;
      c = `
`, r = n.state.doc.line(r.number + (t ? 1 : -1)), s = n.bidiSpans(r), h = m.cursor(t ? r.from : r.to);
    }
    if (a) {
      if (!a(c))
        return l;
    } else {
      if (!i)
        return h;
      a = i(c);
    }
    l = h;
  }
}
function Au(n, e, t) {
  let i = n.state.charCategorizer(e), r = i(t);
  return (s) => {
    let o = i(s);
    return r == fe.Space && (r = o), r == o;
  };
}
function Wu(n, e, t, i) {
  let r = e.head, s = t ? 1 : -1;
  if (r == (t ? n.state.doc.length : 0))
    return m.cursor(r, e.assoc);
  let o = e.goalColumn, l, a = n.contentDOM.getBoundingClientRect(), h = n.coordsAtPos(r), c = n.documentTop;
  if (h)
    o == null && (o = h.left - a.left), l = s < 0 ? h.top : h.bottom;
  else {
    let d = n.viewState.lineBlockAt(r);
    o == null && (o = Math.min(a.right - a.left, n.defaultCharacterWidth * (r - d.from))), l = (s < 0 ? d.top : d.bottom) + c;
  }
  let f = a.left + o, u = i != null ? i : n.defaultLineHeight >> 1;
  for (let d = 0; ; d += 10) {
    let O = l + (u + d) * s, g = Qh(n, { x: f, y: O }, !1, s);
    if (O < a.top || O > a.bottom || (s < 0 ? g < r : g > r))
      return m.cursor(g, e.assoc, void 0, o);
  }
}
function dr(n, e, t) {
  let i = n.state.facet(ch).map((r) => r(n));
  for (; ; ) {
    let r = !1;
    for (let s of i)
      s.between(t.from - 1, t.from + 1, (o, l, a) => {
        t.from > o && t.from < l && (t = e.from > t.from ? m.cursor(o, 1) : m.cursor(l, -1), r = !0);
      });
    if (!r)
      return t;
  }
}
class Xu {
  constructor(e) {
    this.lastKeyCode = 0, this.lastKeyTime = 0, this.lastTouchTime = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.chromeScrollHack = -1, this.pendingIOSKey = void 0, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastEscPress = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.registeredEvents = [], this.customHandlers = [], this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.rapidCompositionStart = !1, this.mouseSelection = null;
    for (let t in ee) {
      let i = ee[t];
      e.contentDOM.addEventListener(t, (r) => {
        !Eo(e, r) || this.ignoreDuringComposition(r) || t == "keydown" && this.keydown(e, r) || (this.mustFlushObserver(r) && e.observer.forceFlush(), this.runCustomHandlers(t, e, r) ? r.preventDefault() : i(e, r));
      }, cs[t]), this.registeredEvents.push(t);
    }
    w.chrome && w.chrome_version == 102 && e.scrollDOM.addEventListener("wheel", () => {
      this.chromeScrollHack < 0 ? e.contentDOM.style.pointerEvents = "none" : window.clearTimeout(this.chromeScrollHack), this.chromeScrollHack = setTimeout(() => {
        this.chromeScrollHack = -1, e.contentDOM.style.pointerEvents = "";
      }, 100);
    }, { passive: !0 }), this.notifiedFocused = e.hasFocus, w.safari && e.contentDOM.addEventListener("input", () => null);
  }
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  ensureHandlers(e, t) {
    var i;
    let r;
    this.customHandlers = [];
    for (let s of t)
      if (r = (i = s.update(e).spec) === null || i === void 0 ? void 0 : i.domEventHandlers) {
        this.customHandlers.push({ plugin: s.value, handlers: r });
        for (let o in r)
          this.registeredEvents.indexOf(o) < 0 && o != "scroll" && (this.registeredEvents.push(o), e.contentDOM.addEventListener(o, (l) => {
            !Eo(e, l) || this.runCustomHandlers(o, e, l) && l.preventDefault();
          }));
      }
  }
  runCustomHandlers(e, t, i) {
    for (let r of this.customHandlers) {
      let s = r.handlers[e];
      if (s)
        try {
          if (s.call(r.plugin, i, t) || i.defaultPrevented)
            return !0;
        } catch (o) {
          Me(t.state, o);
        }
    }
    return !1;
  }
  runScrollHandlers(e, t) {
    this.lastScrollTop = e.scrollDOM.scrollTop, this.lastScrollLeft = e.scrollDOM.scrollLeft;
    for (let i of this.customHandlers) {
      let r = i.handlers.scroll;
      if (r)
        try {
          r.call(i.plugin, t, e);
        } catch (s) {
          Me(e.state, s);
        }
    }
  }
  keydown(e, t) {
    if (this.lastKeyCode = t.keyCode, this.lastKeyTime = Date.now(), t.keyCode == 9 && Date.now() < this.lastEscPress + 2e3)
      return !0;
    if (w.android && w.chrome && !t.synthetic && (t.keyCode == 13 || t.keyCode == 8))
      return e.observer.delayAndroidKey(t.key, t.keyCode), !0;
    let i;
    return w.ios && (i = bh.find((r) => r.keyCode == t.keyCode)) && !(t.ctrlKey || t.altKey || t.metaKey) && !t.synthetic ? (this.pendingIOSKey = i, setTimeout(() => this.flushIOSKey(e), 250), !0) : !1;
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return t ? (this.pendingIOSKey = void 0, Oi(e.contentDOM, t.key, t.keyCode)) : !1;
  }
  ignoreDuringComposition(e) {
    return /^key/.test(e.type) ? this.composing > 0 ? !0 : w.safari && !w.ios && Date.now() - this.compositionEndedAt < 100 ? (this.compositionEndedAt = 0, !0) : !1 : !1;
  }
  mustFlushObserver(e) {
    return e.type == "keydown" && e.keyCode != 229 || e.type == "compositionend" && !w.ios;
  }
  startMouseSelection(e) {
    this.mouseSelection && this.mouseSelection.destroy(), this.mouseSelection = e;
  }
  update(e) {
    this.mouseSelection && this.mouseSelection.update(e), e.transactions.length && (this.lastKeyCode = this.lastSelectionTime = 0);
  }
  destroy() {
    this.mouseSelection && this.mouseSelection.destroy();
  }
}
const bh = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], yh = [16, 17, 18, 20, 91, 92, 224, 225];
class Zu {
  constructor(e, t, i, r) {
    this.view = e, this.style = i, this.mustSelect = r, this.lastEvent = t;
    let s = e.contentDOM.ownerDocument;
    s.addEventListener("mousemove", this.move = this.move.bind(this)), s.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(M.allowMultipleSelections) && Du(e, t), this.dragMove = Mu(e, t), this.dragging = ju(e, t) && zs(t) == 1 ? null : !1, this.dragging === !1 && (t.preventDefault(), this.select(t));
  }
  move(e) {
    if (e.buttons == 0)
      return this.destroy();
    this.dragging === !1 && this.select(this.lastEvent = e);
  }
  up(e) {
    this.dragging == null && this.select(this.lastEvent), this.dragging || e.preventDefault(), this.destroy();
  }
  destroy() {
    let e = this.view.contentDOM.ownerDocument;
    e.removeEventListener("mousemove", this.move), e.removeEventListener("mouseup", this.up), this.view.inputState.mouseSelection = null;
  }
  select(e) {
    let t = this.style.get(e, this.extend, this.multiple);
    (this.mustSelect || !t.eq(this.view.state.selection) || t.main.assoc != this.view.state.selection.main.assoc) && this.view.dispatch({
      selection: t,
      userEvent: "select.pointer",
      scrollIntoView: !0
    }), this.mustSelect = !1;
  }
  update(e) {
    e.docChanged && this.dragging && (this.dragging = this.dragging.map(e.changes)), this.style.update(e) && setTimeout(() => this.select(this.lastEvent), 20);
  }
}
function Du(n, e) {
  let t = n.state.facet(ih);
  return t.length ? t[0](e) : w.mac ? e.metaKey : e.ctrlKey;
}
function Mu(n, e) {
  let t = n.state.facet(nh);
  return t.length ? t[0](e) : w.mac ? !e.altKey : !e.ctrlKey;
}
function ju(n, e) {
  let { main: t } = n.state.selection;
  if (t.empty)
    return !1;
  let i = dn(n.root);
  if (!i || i.rangeCount == 0)
    return !0;
  let r = i.getRangeAt(0).getClientRects();
  for (let s = 0; s < r.length; s++) {
    let o = r[s];
    if (o.left <= e.clientX && o.right >= e.clientX && o.top <= e.clientY && o.bottom >= e.clientY)
      return !0;
  }
  return !1;
}
function Eo(n, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, i; t != n.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (i = G.get(t)) && i.ignoreEvent(e))
      return !1;
  return !0;
}
const ee = /* @__PURE__ */ Object.create(null), cs = /* @__PURE__ */ Object.create(null), Sh = w.ie && w.ie_version < 15 || w.ios && w.webkit_version < 604;
function zu(n) {
  let e = n.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    n.focus(), t.remove(), xh(n, t.value);
  }, 50);
}
function xh(n, e) {
  let { state: t } = n, i, r = 1, s = t.toText(e), o = s.lines == t.selection.ranges.length;
  if (fs != null && t.selection.ranges.every((a) => a.empty) && fs == s.toString()) {
    let a = -1;
    i = t.changeByRange((h) => {
      let c = t.doc.lineAt(h.from);
      if (c.from == a)
        return { range: h };
      a = c.from;
      let f = t.toText((o ? s.line(r++).text : e) + t.lineBreak);
      return {
        changes: { from: c.from, insert: f },
        range: m.cursor(h.from + f.length)
      };
    });
  } else
    o ? i = t.changeByRange((a) => {
      let h = s.line(r++);
      return {
        changes: { from: a.from, to: a.to, insert: h.text },
        range: m.cursor(a.from + h.length)
      };
    }) : i = t.replaceSelection(s);
  n.dispatch(i, {
    userEvent: "input.paste",
    scrollIntoView: !0
  });
}
ee.keydown = (n, e) => {
  n.inputState.setSelectionOrigin("select"), e.keyCode == 27 ? n.inputState.lastEscPress = Date.now() : yh.indexOf(e.keyCode) < 0 && (n.inputState.lastEscPress = 0);
};
ee.touchstart = (n, e) => {
  n.inputState.lastTouchTime = Date.now(), n.inputState.setSelectionOrigin("select.pointer");
};
ee.touchmove = (n) => {
  n.inputState.setSelectionOrigin("select.pointer");
};
cs.touchstart = cs.touchmove = { passive: !0 };
ee.mousedown = (n, e) => {
  if (n.observer.flush(), n.inputState.lastTouchTime > Date.now() - 2e3 && zs(e) == 1)
    return;
  let t = null;
  for (let i of n.state.facet(rh))
    if (t = i(n, e), t)
      break;
  if (!t && e.button == 0 && (t = _u(n, e)), t) {
    let i = n.root.activeElement != n.contentDOM;
    i && n.observer.ignore(() => Ga(n.contentDOM)), n.inputState.startMouseSelection(new Zu(n, e, t, i));
  }
};
function _o(n, e, t, i) {
  if (i == 1)
    return m.cursor(e, t);
  if (i == 2)
    return wu(n.state, e, t);
  {
    let r = ue.find(n.docView, e), s = n.state.doc.lineAt(r ? r.posAtEnd : e), o = r ? r.posAtStart : s.from, l = r ? r.posAtEnd : s.to;
    return l < n.state.doc.length && l == s.to && l++, m.range(o, l);
  }
}
let $h = (n, e) => n >= e.top && n <= e.bottom, Io = (n, e, t) => $h(e, t) && n >= t.left && n <= t.right;
function qu(n, e, t, i) {
  let r = ue.find(n.docView, e);
  if (!r)
    return 1;
  let s = e - r.posAtStart;
  if (s == 0)
    return 1;
  if (s == r.length)
    return -1;
  let o = r.coordsAt(s, -1);
  if (o && Io(t, i, o))
    return -1;
  let l = r.coordsAt(s, 1);
  return l && Io(t, i, l) ? 1 : o && $h(i, o) ? -1 : 1;
}
function Go(n, e) {
  let t = n.posAtCoords({ x: e.clientX, y: e.clientY }, !1);
  return { pos: t, bias: qu(n, t, e.clientX, e.clientY) };
}
const Eu = w.ie && w.ie_version <= 11;
let Vo = null, No = 0, Bo = 0;
function zs(n) {
  if (!Eu)
    return n.detail;
  let e = Vo, t = Bo;
  return Vo = n, Bo = Date.now(), No = !e || t > Date.now() - 400 && Math.abs(e.clientX - n.clientX) < 2 && Math.abs(e.clientY - n.clientY) < 2 ? (No + 1) % 3 : 1;
}
function _u(n, e) {
  let t = Go(n, e), i = zs(e), r = n.state.selection, s = t, o = e;
  return {
    update(l) {
      l.docChanged && (t && (t.pos = l.changes.mapPos(t.pos)), r = r.map(l.changes), o = null);
    },
    get(l, a, h) {
      let c;
      if (o && l.clientX == o.clientX && l.clientY == o.clientY ? c = s : (c = s = Go(n, l), o = l), !c || !t)
        return r;
      let f = _o(n, c.pos, c.bias, i);
      if (t.pos != c.pos && !a) {
        let u = _o(n, t.pos, t.bias, i), d = Math.min(u.from, f.from), O = Math.max(u.to, f.to);
        f = d < f.from ? m.range(d, O) : m.range(O, d);
      }
      return a ? r.replaceRange(r.main.extend(f.from, f.to)) : h && r.ranges.length > 1 && r.ranges.some((u) => u.eq(f)) ? Iu(r, f) : h ? r.addRange(f) : m.create([f]);
    }
  };
}
function Iu(n, e) {
  for (let t = 0; ; t++)
    if (n.ranges[t].eq(e))
      return m.create(n.ranges.slice(0, t).concat(n.ranges.slice(t + 1)), n.mainIndex == t ? 0 : n.mainIndex - (n.mainIndex > t ? 1 : 0));
}
ee.dragstart = (n, e) => {
  let { selection: { main: t } } = n.state, { mouseSelection: i } = n.inputState;
  i && (i.dragging = t), e.dataTransfer && (e.dataTransfer.setData("Text", n.state.sliceDoc(t.from, t.to)), e.dataTransfer.effectAllowed = "copyMove");
};
function Lo(n, e, t, i) {
  if (!t)
    return;
  let r = n.posAtCoords({ x: e.clientX, y: e.clientY }, !1);
  e.preventDefault();
  let { mouseSelection: s } = n.inputState, o = i && s && s.dragging && s.dragMove ? { from: s.dragging.from, to: s.dragging.to } : null, l = { from: r, insert: t }, a = n.state.changes(o ? [o, l] : l);
  n.focus(), n.dispatch({
    changes: a,
    selection: { anchor: a.mapPos(r, -1), head: a.mapPos(r, 1) },
    userEvent: o ? "move.drop" : "input.drop"
  });
}
ee.drop = (n, e) => {
  if (!e.dataTransfer)
    return;
  if (n.state.readOnly)
    return e.preventDefault();
  let t = e.dataTransfer.files;
  if (t && t.length) {
    e.preventDefault();
    let i = Array(t.length), r = 0, s = () => {
      ++r == t.length && Lo(n, e, i.filter((o) => o != null).join(n.state.lineBreak), !1);
    };
    for (let o = 0; o < t.length; o++) {
      let l = new FileReader();
      l.onerror = s, l.onload = () => {
        /[\x00-\x08\x0e-\x1f]{2}/.test(l.result) || (i[o] = l.result), s();
      }, l.readAsText(t[o]);
    }
  } else
    Lo(n, e, e.dataTransfer.getData("Text"), !0);
};
ee.paste = (n, e) => {
  if (n.state.readOnly)
    return e.preventDefault();
  n.observer.flush();
  let t = Sh ? null : e.clipboardData;
  t ? (xh(n, t.getData("text/plain")), e.preventDefault()) : zu(n);
};
function Gu(n, e) {
  let t = n.dom.parentNode;
  if (!t)
    return;
  let i = t.appendChild(document.createElement("textarea"));
  i.style.cssText = "position: fixed; left: -10000px; top: 10px", i.value = e, i.focus(), i.selectionEnd = e.length, i.selectionStart = 0, setTimeout(() => {
    i.remove(), n.focus();
  }, 50);
}
function Vu(n) {
  let e = [], t = [], i = !1;
  for (let r of n.selection.ranges)
    r.empty || (e.push(n.sliceDoc(r.from, r.to)), t.push(r));
  if (!e.length) {
    let r = -1;
    for (let { from: s } of n.selection.ranges) {
      let o = n.doc.lineAt(s);
      o.number > r && (e.push(o.text), t.push({ from: o.from, to: Math.min(n.doc.length, o.to + 1) })), r = o.number;
    }
    i = !0;
  }
  return { text: e.join(n.lineBreak), ranges: t, linewise: i };
}
let fs = null;
ee.copy = ee.cut = (n, e) => {
  let { text: t, ranges: i, linewise: r } = Vu(n.state);
  if (!t && !r)
    return;
  fs = r ? t : null;
  let s = Sh ? null : e.clipboardData;
  s ? (e.preventDefault(), s.clearData(), s.setData("text/plain", t)) : Gu(n, t), e.type == "cut" && !n.state.readOnly && n.dispatch({
    changes: i,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
};
function kh(n) {
  setTimeout(() => {
    n.hasFocus != n.inputState.notifiedFocused && n.update([]);
  }, 10);
}
ee.focus = (n) => {
  n.inputState.lastFocusTime = Date.now(), !n.scrollDOM.scrollTop && (n.inputState.lastScrollTop || n.inputState.lastScrollLeft) && (n.scrollDOM.scrollTop = n.inputState.lastScrollTop, n.scrollDOM.scrollLeft = n.inputState.lastScrollLeft), kh(n);
};
ee.blur = (n) => {
  n.observer.clearSelectionRange(), kh(n);
};
function wh(n, e) {
  if (n.docView.compositionDeco.size) {
    n.inputState.rapidCompositionStart = e;
    try {
      n.update([]);
    } finally {
      n.inputState.rapidCompositionStart = !1;
    }
  }
}
ee.compositionstart = ee.compositionupdate = (n) => {
  n.inputState.compositionFirstChange == null && (n.inputState.compositionFirstChange = !0), n.inputState.composing < 0 && (n.inputState.composing = 0, n.docView.compositionDeco.size && (n.observer.flush(), wh(n, !0)));
};
ee.compositionend = (n) => {
  n.inputState.composing = -1, n.inputState.compositionEndedAt = Date.now(), n.inputState.compositionFirstChange = null, setTimeout(() => {
    n.inputState.composing < 0 && wh(n, !1);
  }, 50);
};
ee.contextmenu = (n) => {
  n.inputState.lastContextMenu = Date.now();
};
ee.beforeinput = (n, e) => {
  var t;
  let i;
  if (w.chrome && w.android && (i = bh.find((r) => r.inputType == e.inputType)) && (n.observer.delayAndroidKey(i.key, i.keyCode), i.key == "Backspace" || i.key == "Delete")) {
    let r = ((t = window.visualViewport) === null || t === void 0 ? void 0 : t.height) || 0;
    setTimeout(() => {
      var s;
      (((s = window.visualViewport) === null || s === void 0 ? void 0 : s.height) || 0) > r + 10 && n.hasFocus && (n.contentDOM.blur(), n.focus());
    }, 100);
  }
};
const Uo = ["pre-wrap", "normal", "pre-line", "break-spaces"];
class Nu {
  constructor() {
    this.doc = j.empty, this.lineWrapping = !1, this.heightSamples = {}, this.lineHeight = 14, this.charWidth = 7, this.lineLength = 30, this.heightChanged = !1;
  }
  heightForGap(e, t) {
    let i = this.doc.lineAt(t).number - this.doc.lineAt(e).number + 1;
    return this.lineWrapping && (i += Math.ceil((t - e - i * this.lineLength * 0.5) / this.lineLength)), this.lineHeight * i;
  }
  heightForLine(e) {
    return this.lineWrapping ? (1 + Math.max(0, Math.ceil((e - this.lineLength) / (this.lineLength - 5)))) * this.lineHeight : this.lineHeight;
  }
  setDoc(e) {
    return this.doc = e, this;
  }
  mustRefreshForWrapping(e) {
    return Uo.indexOf(e) > -1 != this.lineWrapping;
  }
  mustRefreshForHeights(e) {
    let t = !1;
    for (let i = 0; i < e.length; i++) {
      let r = e[i];
      r < 0 ? i++ : this.heightSamples[Math.floor(r * 10)] || (t = !0, this.heightSamples[Math.floor(r * 10)] = !0);
    }
    return t;
  }
  refresh(e, t, i, r, s) {
    let o = Uo.indexOf(e) > -1, l = Math.round(t) != Math.round(this.lineHeight) || this.lineWrapping != o;
    if (this.lineWrapping = o, this.lineHeight = t, this.charWidth = i, this.lineLength = r, l) {
      this.heightSamples = {};
      for (let a = 0; a < s.length; a++) {
        let h = s[a];
        h < 0 ? a++ : this.heightSamples[Math.floor(h * 10)] = !0;
      }
    }
    return l;
  }
}
class Bu {
  constructor(e, t) {
    this.from = e, this.heights = t, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class ft {
  constructor(e, t, i, r, s) {
    this.from = e, this.length = t, this.top = i, this.height = r, this.type = s;
  }
  get to() {
    return this.from + this.length;
  }
  get bottom() {
    return this.top + this.height;
  }
  join(e) {
    let t = (Array.isArray(this.type) ? this.type : [this]).concat(Array.isArray(e.type) ? e.type : [e]);
    return new ft(this.from, this.length + e.length, this.top, this.height + e.height, t);
  }
}
var _ = /* @__PURE__ */ function(n) {
  return n[n.ByPos = 0] = "ByPos", n[n.ByHeight = 1] = "ByHeight", n[n.ByPosNoHeight = 2] = "ByPosNoHeight", n;
}(_ || (_ = {}));
const nn = 1e-3;
class Qe {
  constructor(e, t, i = 2) {
    this.length = e, this.height = t, this.flags = i;
  }
  get outdated() {
    return (this.flags & 2) > 0;
  }
  set outdated(e) {
    this.flags = (e ? 2 : 0) | this.flags & -3;
  }
  setHeight(e, t) {
    this.height != t && (Math.abs(this.height - t) > nn && (e.heightChanged = !0), this.height = t);
  }
  replace(e, t, i) {
    return Qe.of(i);
  }
  decomposeLeft(e, t) {
    t.push(this);
  }
  decomposeRight(e, t) {
    t.push(this);
  }
  applyChanges(e, t, i, r) {
    let s = this;
    for (let o = r.length - 1; o >= 0; o--) {
      let { fromA: l, toA: a, fromB: h, toB: c } = r[o], f = s.lineAt(l, _.ByPosNoHeight, t, 0, 0), u = f.to >= a ? f : s.lineAt(a, _.ByPosNoHeight, t, 0, 0);
      for (c += u.to - a, a = u.to; o > 0 && f.from <= r[o - 1].toA; )
        l = r[o - 1].fromA, h = r[o - 1].fromB, o--, l < f.from && (f = s.lineAt(l, _.ByPosNoHeight, t, 0, 0));
      h += f.from - l, l = f.from;
      let d = qs.build(i, e, h, c);
      s = s.replace(l, a, d);
    }
    return s.updateHeight(i, 0);
  }
  static empty() {
    return new Se(0, 0);
  }
  static of(e) {
    if (e.length == 1)
      return e[0];
    let t = 0, i = e.length, r = 0, s = 0;
    for (; ; )
      if (t == i)
        if (r > s * 2) {
          let l = e[t - 1];
          l.break ? e.splice(--t, 1, l.left, null, l.right) : e.splice(--t, 1, l.left, l.right), i += 1 + l.break, r -= l.size;
        } else if (s > r * 2) {
          let l = e[i];
          l.break ? e.splice(i, 1, l.left, null, l.right) : e.splice(i, 1, l.left, l.right), i += 2 + l.break, s -= l.size;
        } else
          break;
      else if (r < s) {
        let l = e[t++];
        l && (r += l.size);
      } else {
        let l = e[--i];
        l && (s += l.size);
      }
    let o = 0;
    return e[t - 1] == null ? (o = 1, t--) : e[t] == null && (o = 1, i++), new Lu(Qe.of(e.slice(0, t)), o, Qe.of(e.slice(i)));
  }
}
Qe.prototype.size = 1;
class Th extends Qe {
  constructor(e, t, i) {
    super(e, t), this.type = i;
  }
  blockAt(e, t, i, r) {
    return new ft(r, this.length, i, this.height, this.type);
  }
  lineAt(e, t, i, r, s) {
    return this.blockAt(0, i, r, s);
  }
  forEachLine(e, t, i, r, s, o) {
    e <= s + this.length && t >= s && o(this.blockAt(0, i, r, s));
  }
  updateHeight(e, t = 0, i = !1, r) {
    return r && r.from <= t && r.more && this.setHeight(e, r.heights[r.index++]), this.outdated = !1, this;
  }
  toString() {
    return `block(${this.length})`;
  }
}
class Se extends Th {
  constructor(e, t) {
    super(e, t, E.Text), this.collapsed = 0, this.widgetHeight = 0;
  }
  replace(e, t, i) {
    let r = i[0];
    return i.length == 1 && (r instanceof Se || r instanceof ie && r.flags & 4) && Math.abs(this.length - r.length) < 10 ? (r instanceof ie ? r = new Se(r.length, this.height) : r.height = this.height, this.outdated || (r.outdated = !1), r) : Qe.of(i);
  }
  updateHeight(e, t = 0, i = !1, r) {
    return r && r.from <= t && r.more ? this.setHeight(e, r.heights[r.index++]) : (i || this.outdated) && this.setHeight(e, Math.max(this.widgetHeight, e.heightForLine(this.length - this.collapsed))), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class ie extends Qe {
  constructor(e) {
    super(e, 0);
  }
  lines(e, t) {
    let i = e.lineAt(t).number, r = e.lineAt(t + this.length).number;
    return { firstLine: i, lastLine: r, lineHeight: this.height / (r - i + 1) };
  }
  blockAt(e, t, i, r) {
    let { firstLine: s, lastLine: o, lineHeight: l } = this.lines(t, r), a = Math.max(0, Math.min(o - s, Math.floor((e - i) / l))), { from: h, length: c } = t.line(s + a);
    return new ft(h, c, i + l * a, l, E.Text);
  }
  lineAt(e, t, i, r, s) {
    if (t == _.ByHeight)
      return this.blockAt(e, i, r, s);
    if (t == _.ByPosNoHeight) {
      let { from: f, to: u } = i.lineAt(e);
      return new ft(f, u - f, 0, 0, E.Text);
    }
    let { firstLine: o, lineHeight: l } = this.lines(i, s), { from: a, length: h, number: c } = i.lineAt(e);
    return new ft(a, h, r + l * (c - o), l, E.Text);
  }
  forEachLine(e, t, i, r, s, o) {
    let { firstLine: l, lineHeight: a } = this.lines(i, s);
    for (let h = Math.max(e, s), c = Math.min(s + this.length, t); h <= c; ) {
      let f = i.lineAt(h);
      h == e && (r += a * (f.number - l)), o(new ft(f.from, f.length, r, a, E.Text)), r += a, h = f.to + 1;
    }
  }
  replace(e, t, i) {
    let r = this.length - t;
    if (r > 0) {
      let s = i[i.length - 1];
      s instanceof ie ? i[i.length - 1] = new ie(s.length + r) : i.push(null, new ie(r - 1));
    }
    if (e > 0) {
      let s = i[0];
      s instanceof ie ? i[0] = new ie(e + s.length) : i.unshift(new ie(e - 1), null);
    }
    return Qe.of(i);
  }
  decomposeLeft(e, t) {
    t.push(new ie(e - 1), null);
  }
  decomposeRight(e, t) {
    t.push(null, new ie(this.length - e - 1));
  }
  updateHeight(e, t = 0, i = !1, r) {
    let s = t + this.length;
    if (r && r.from <= t + this.length && r.more) {
      let o = [], l = Math.max(t, r.from), a = -1, h = e.heightChanged;
      for (r.from > t && o.push(new ie(r.from - t - 1).updateHeight(e, t)); l <= s && r.more; ) {
        let f = e.doc.lineAt(l).length;
        o.length && o.push(null);
        let u = r.heights[r.index++];
        a == -1 ? a = u : Math.abs(u - a) >= nn && (a = -2);
        let d = new Se(f, u);
        d.outdated = !1, o.push(d), l += f + 1;
      }
      l <= s && o.push(null, new ie(s - l).updateHeight(e, l));
      let c = Qe.of(o);
      return e.heightChanged = h || a < 0 || Math.abs(c.height - this.height) >= nn || Math.abs(a - this.lines(e.doc, t).lineHeight) >= nn, c;
    } else
      (i || this.outdated) && (this.setHeight(e, e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class Lu extends Qe {
  constructor(e, t, i) {
    super(e.length + t + i.length, e.height + i.height, t | (e.outdated || i.outdated ? 2 : 0)), this.left = e, this.right = i, this.size = e.size + i.size;
  }
  get break() {
    return this.flags & 1;
  }
  blockAt(e, t, i, r) {
    let s = i + this.left.height;
    return e < s ? this.left.blockAt(e, t, i, r) : this.right.blockAt(e, t, s, r + this.left.length + this.break);
  }
  lineAt(e, t, i, r, s) {
    let o = r + this.left.height, l = s + this.left.length + this.break, a = t == _.ByHeight ? e < o : e < l, h = a ? this.left.lineAt(e, t, i, r, s) : this.right.lineAt(e, t, i, o, l);
    if (this.break || (a ? h.to < l : h.from > l))
      return h;
    let c = t == _.ByPosNoHeight ? _.ByPosNoHeight : _.ByPos;
    return a ? h.join(this.right.lineAt(l, c, i, o, l)) : this.left.lineAt(l, c, i, r, s).join(h);
  }
  forEachLine(e, t, i, r, s, o) {
    let l = r + this.left.height, a = s + this.left.length + this.break;
    if (this.break)
      e < a && this.left.forEachLine(e, t, i, r, s, o), t >= a && this.right.forEachLine(e, t, i, l, a, o);
    else {
      let h = this.lineAt(a, _.ByPos, i, r, s);
      e < h.from && this.left.forEachLine(e, h.from - 1, i, r, s, o), h.to >= e && h.from <= t && o(h), t > h.to && this.right.forEachLine(h.to + 1, t, i, l, a, o);
    }
  }
  replace(e, t, i) {
    let r = this.left.length + this.break;
    if (t < r)
      return this.balanced(this.left.replace(e, t, i), this.right);
    if (e > this.left.length)
      return this.balanced(this.left, this.right.replace(e - r, t - r, i));
    let s = [];
    e > 0 && this.decomposeLeft(e, s);
    let o = s.length;
    for (let l of i)
      s.push(l);
    if (e > 0 && Yo(s, o - 1), t < this.length) {
      let l = s.length;
      this.decomposeRight(t, s), Yo(s, l);
    }
    return Qe.of(s);
  }
  decomposeLeft(e, t) {
    let i = this.left.length;
    if (e <= i)
      return this.left.decomposeLeft(e, t);
    t.push(this.left), this.break && (i++, e >= i && t.push(null)), e > i && this.right.decomposeLeft(e - i, t);
  }
  decomposeRight(e, t) {
    let i = this.left.length, r = i + this.break;
    if (e >= r)
      return this.right.decomposeRight(e - r, t);
    e < i && this.left.decomposeRight(e, t), this.break && e < r && t.push(null), t.push(this.right);
  }
  balanced(e, t) {
    return e.size > 2 * t.size || t.size > 2 * e.size ? Qe.of(this.break ? [e, null, t] : [e, t]) : (this.left = e, this.right = t, this.height = e.height + t.height, this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, i = !1, r) {
    let { left: s, right: o } = this, l = t + s.length + this.break, a = null;
    return r && r.from <= t + s.length && r.more ? a = s = s.updateHeight(e, t, i, r) : s.updateHeight(e, t, i), r && r.from <= l + o.length && r.more ? a = o = o.updateHeight(e, l, i, r) : o.updateHeight(e, l, i), a ? this.balanced(s, o) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function Yo(n, e) {
  let t, i;
  n[e] == null && (t = n[e - 1]) instanceof ie && (i = n[e + 1]) instanceof ie && n.splice(e - 1, 3, new ie(t.length + 1 + i.length));
}
const Uu = 5;
class qs {
  constructor(e, t) {
    this.pos = e, this.oracle = t, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = e;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(e, t) {
    if (this.lineStart > -1) {
      let i = Math.min(t, this.lineEnd), r = this.nodes[this.nodes.length - 1];
      r instanceof Se ? r.length += i - this.pos : (i > this.pos || !this.isCovered) && this.nodes.push(new Se(i - this.pos, -1)), this.writtenTo = i, t > i && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = t;
  }
  point(e, t, i) {
    if (e < t || i.heightRelevant) {
      let r = i.widget ? i.widget.estimatedHeight : 0;
      r < 0 && (r = this.oracle.lineHeight);
      let s = t - e;
      i.block ? this.addBlock(new Th(s, r, i.type)) : (s || r >= Uu) && this.addLineDeco(r, s);
    } else
      t > e && this.span(e, t);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: e, to: t } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = e, this.lineEnd = t, this.writtenTo < e && ((this.writtenTo < e - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, e - 1)), this.nodes.push(null)), this.pos > e && this.nodes.push(new Se(this.pos - e, -1)), this.writtenTo = this.pos;
  }
  blankContent(e, t) {
    let i = new ie(t - e);
    return this.oracle.doc.lineAt(e).to == t && (i.flags |= 4), i;
  }
  ensureLine() {
    this.enterLine();
    let e = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (e instanceof Se)
      return e;
    let t = new Se(0, -1);
    return this.nodes.push(t), t;
  }
  addBlock(e) {
    this.enterLine(), e.type == E.WidgetAfter && !this.isCovered && this.ensureLine(), this.nodes.push(e), this.writtenTo = this.pos = this.pos + e.length, e.type != E.WidgetBefore && (this.covering = e);
  }
  addLineDeco(e, t) {
    let i = this.ensureLine();
    i.length += t, i.collapsed += t, i.widgetHeight = Math.max(i.widgetHeight, e), this.writtenTo = this.pos = this.pos + t;
  }
  finish(e) {
    let t = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    this.lineStart > -1 && !(t instanceof Se) && !this.isCovered ? this.nodes.push(new Se(0, -1)) : (this.writtenTo < this.pos || t == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let i = e;
    for (let r of this.nodes)
      r instanceof Se && r.updateHeight(this.oracle, i), i += r ? r.length : 1;
    return this.nodes;
  }
  static build(e, t, i, r) {
    let s = new qs(i, e);
    return z.spans(t, i, r, s, 0), s.finish(i);
  }
}
function Yu(n, e, t) {
  let i = new Fu();
  return z.compare(n, e, t, i, 0), i.changes;
}
class Fu {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, i, r) {
    (e < t || i && i.heightRelevant || r && r.heightRelevant) && ss(e, t, this.changes, 5);
  }
}
function Hu(n, e) {
  let t = n.getBoundingClientRect(), i = Math.max(0, t.left), r = Math.min(innerWidth, t.right), s = Math.max(0, t.top), o = Math.min(innerHeight, t.bottom), l = n.ownerDocument.body;
  for (let a = n.parentNode; a && a != l; )
    if (a.nodeType == 1) {
      let h = a, c = window.getComputedStyle(h);
      if ((h.scrollHeight > h.clientHeight || h.scrollWidth > h.clientWidth) && c.overflow != "visible") {
        let f = h.getBoundingClientRect();
        i = Math.max(i, f.left), r = Math.min(r, f.right), s = Math.max(s, f.top), o = Math.min(o, f.bottom);
      }
      a = c.position == "absolute" || c.position == "fixed" ? h.offsetParent : h.parentNode;
    } else if (a.nodeType == 11)
      a = a.host;
    else
      break;
  return {
    left: i - t.left,
    right: Math.max(i, r) - t.left,
    top: s - (t.top + e),
    bottom: Math.max(s, o) - (t.top + e)
  };
}
function Ju(n, e) {
  let t = n.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class Or {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.size = i;
  }
  static same(e, t) {
    if (e.length != t.length)
      return !1;
    for (let i = 0; i < e.length; i++) {
      let r = e[i], s = t[i];
      if (r.from != s.from || r.to != s.to || r.size != s.size)
        return !1;
    }
    return !0;
  }
  draw(e) {
    return C.replace({ widget: new Ku(this.size, e) }).range(this.from, this.to);
  }
}
class Ku extends St {
  constructor(e, t) {
    super(), this.size = e, this.vertical = t;
  }
  eq(e) {
    return e.size == this.size && e.vertical == this.vertical;
  }
  toDOM() {
    let e = document.createElement("div");
    return this.vertical ? e.style.height = this.size + "px" : (e.style.width = this.size + "px", e.style.height = "2px", e.style.display = "inline-block"), e;
  }
  get estimatedHeight() {
    return this.vertical ? this.size : -1;
  }
}
class Fo {
  constructor(e) {
    this.state = e, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.heightOracle = new Nu(), this.scaler = Ko, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = U.RTL, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1, this.stateDeco = e.facet($i).filter((t) => typeof t != "function"), this.heightMap = Qe.empty().applyChanges(this.stateDeco, j.empty, this.heightOracle.setDoc(e.doc), [new et(0, 0, 0, e.doc.length)]), this.viewport = this.getViewport(0, null), this.updateViewportLines(), this.updateForViewport(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = C.set(this.lineGaps.map((t) => t.draw(!1))), this.computeVisibleRanges();
  }
  updateForViewport() {
    let e = [this.viewport], { main: t } = this.state.selection;
    for (let i = 0; i <= 1; i++) {
      let r = i ? t.head : t.anchor;
      if (!e.some(({ from: s, to: o }) => r >= s && r <= o)) {
        let { from: s, to: o } = this.lineBlockAt(r);
        e.push(new qi(s, o));
      }
    }
    this.viewports = e.sort((i, r) => i.from - r.from), this.scaler = this.heightMap.height <= 7e6 ? Ko : new id(this.heightOracle.doc, this.heightMap, this.viewports);
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.state.doc, 0, 0, (e) => {
      this.viewportLines.push(this.scaler.scale == 1 ? e : ci(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let i = this.stateDeco;
    this.stateDeco = this.state.facet($i).filter((h) => typeof h != "function");
    let r = e.changedRanges, s = et.extendWithRanges(r, Yu(i, this.stateDeco, e ? e.changes : J.empty(this.state.doc.length))), o = this.heightMap.height;
    this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), s), this.heightMap.height != o && (e.flags |= 2);
    let l = s.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < l.from || t.range.head > l.to) || !this.viewportIsAppropriate(l)) && (l = this.getViewport(0, t));
    let a = !e.changes.empty || e.flags & 2 || l.from != this.viewport.from || l.to != this.viewport.to;
    this.viewport = l, this.updateForViewport(), a && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && e.selectionSet && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && (this.mustEnforceCursorAssoc = !0);
  }
  measure(e) {
    let t = e.contentDOM, i = window.getComputedStyle(t), r = this.heightOracle, s = i.whiteSpace;
    this.defaultTextDirection = i.direction == "rtl" ? U.RTL : U.LTR;
    let o = this.heightOracle.mustRefreshForWrapping(s), l = o || this.mustMeasureContent || this.contentDOMHeight != t.clientHeight;
    this.contentDOMHeight = t.clientHeight, this.mustMeasureContent = !1;
    let a = 0, h = 0, c = parseInt(i.paddingTop) || 0, f = parseInt(i.paddingBottom) || 0;
    (this.paddingTop != c || this.paddingBottom != f) && (this.paddingTop = c, this.paddingBottom = f, a |= 10), this.editorWidth != e.scrollDOM.clientWidth && (r.lineWrapping && (l = !0), this.editorWidth = e.scrollDOM.clientWidth, a |= 8);
    let u = (this.printing ? Ju : Hu)(t, this.paddingTop), d = u.top - this.pixelViewport.top, O = u.bottom - this.pixelViewport.bottom;
    this.pixelViewport = u;
    let g = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (g != this.inView && (this.inView = g, g && (l = !0)), !this.inView)
      return 0;
    let Q = t.clientWidth;
    if ((this.contentDOMWidth != Q || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = Q, this.editorHeight = e.scrollDOM.clientHeight, a |= 8), l) {
      let k = e.docView.measureVisibleLineHeights(this.viewport);
      if (r.mustRefreshForHeights(k) && (o = !0), o || r.lineWrapping && Math.abs(Q - this.contentDOMWidth) > r.charWidth) {
        let { lineHeight: T, charWidth: x } = e.docView.measureTextSize();
        o = r.refresh(s, T, x, Q / x, k), o && (e.docView.minWidth = 0, a |= 8);
      }
      d > 0 && O > 0 ? h = Math.max(d, O) : d < 0 && O < 0 && (h = Math.min(d, O)), r.heightChanged = !1;
      for (let T of this.viewports) {
        let x = T.from == this.viewport.from ? k : e.docView.measureVisibleLineHeights(T);
        this.heightMap = this.heightMap.updateHeight(r, 0, o, new Bu(T.from, x));
      }
      r.heightChanged && (a |= 2);
    }
    let b = !this.viewportIsAppropriate(this.viewport, h) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    return b && (this.viewport = this.getViewport(h, this.scrollTarget)), this.updateForViewport(), (a & 2 || b) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(o ? [] : this.lineGaps)), a |= this.computeVisibleRanges(), this.mustEnforceCursorAssoc && (this.mustEnforceCursorAssoc = !1, e.docView.enforceCursorAssoc()), a;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(e, t) {
    let i = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), r = this.heightMap, s = this.state.doc, { visibleTop: o, visibleBottom: l } = this, a = new qi(r.lineAt(o - i * 1e3, _.ByHeight, s, 0, 0).from, r.lineAt(l + (1 - i) * 1e3, _.ByHeight, s, 0, 0).to);
    if (t) {
      let { head: h } = t.range;
      if (h < a.from || h > a.to) {
        let c = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), f = r.lineAt(h, _.ByPos, s, 0, 0), u;
        t.y == "center" ? u = (f.top + f.bottom) / 2 - c / 2 : t.y == "start" || t.y == "nearest" && h < a.from ? u = f.top : u = f.bottom - c, a = new qi(r.lineAt(u - 1e3 / 2, _.ByHeight, s, 0, 0).from, r.lineAt(u + c + 1e3 / 2, _.ByHeight, s, 0, 0).to);
      }
    }
    return a;
  }
  mapViewport(e, t) {
    let i = t.mapPos(e.from, -1), r = t.mapPos(e.to, 1);
    return new qi(this.heightMap.lineAt(i, _.ByPos, this.state.doc, 0, 0).from, this.heightMap.lineAt(r, _.ByPos, this.state.doc, 0, 0).to);
  }
  viewportIsAppropriate({ from: e, to: t }, i = 0) {
    if (!this.inView)
      return !0;
    let { top: r } = this.heightMap.lineAt(e, _.ByPos, this.state.doc, 0, 0), { bottom: s } = this.heightMap.lineAt(t, _.ByPos, this.state.doc, 0, 0), { visibleTop: o, visibleBottom: l } = this;
    return (e == 0 || r <= o - Math.max(10, Math.min(-i, 250))) && (t == this.state.doc.length || s >= l + Math.max(10, Math.min(i, 250))) && r > o - 2 * 1e3 && s < l + 2 * 1e3;
  }
  mapLineGaps(e, t) {
    if (!e.length || t.empty)
      return e;
    let i = [];
    for (let r of e)
      t.touchesRange(r.from, r.to) || i.push(new Or(t.mapPos(r.from), t.mapPos(r.to), r.size));
    return i;
  }
  ensureLineGaps(e) {
    let t = [];
    if (this.defaultTextDirection != U.LTR)
      return t;
    for (let i of this.viewportLines) {
      if (i.length < 4e3)
        continue;
      let r = ed(i.from, i.to, this.stateDeco);
      if (r.total < 4e3)
        continue;
      let s, o;
      if (this.heightOracle.lineWrapping) {
        let h = 2e3 / this.heightOracle.lineLength * this.heightOracle.lineHeight;
        s = Ei(r, (this.visibleTop - i.top - h) / i.height), o = Ei(r, (this.visibleBottom - i.top + h) / i.height);
      } else {
        let h = r.total * this.heightOracle.charWidth, c = 2e3 * this.heightOracle.charWidth;
        s = Ei(r, (this.pixelViewport.left - c) / h), o = Ei(r, (this.pixelViewport.right + c) / h);
      }
      let l = [];
      s > i.from && l.push({ from: i.from, to: s }), o < i.to && l.push({ from: o, to: i.to });
      let a = this.state.selection.main;
      a.from >= i.from && a.from <= i.to && Jo(l, a.from - 10, a.from + 10), !a.empty && a.to >= i.from && a.to <= i.to && Jo(l, a.to - 10, a.to + 10);
      for (let { from: h, to: c } of l)
        c - h > 1e3 && t.push(td(e, (f) => f.from >= i.from && f.to <= i.to && Math.abs(f.from - h) < 1e3 && Math.abs(f.to - c) < 1e3) || new Or(h, c, this.gapSize(i, h, c, r)));
    }
    return t;
  }
  gapSize(e, t, i, r) {
    let s = Ho(r, i) - Ho(r, t);
    return this.heightOracle.lineWrapping ? e.height * s : r.total * this.heightOracle.charWidth * s;
  }
  updateLineGaps(e) {
    Or.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = C.set(e.map((t) => t.draw(this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges() {
    let e = this.stateDeco;
    this.lineGaps.length && (e = e.concat(this.lineGapDeco));
    let t = [];
    z.spans(e, this.viewport.from, this.viewport.to, {
      span(r, s) {
        t.push({ from: r, to: s });
      },
      point() {
      }
    }, 20);
    let i = t.length != this.visibleRanges.length || this.visibleRanges.some((r, s) => r.from != t[s].from || r.to != t[s].to);
    return this.visibleRanges = t, i ? 4 : 0;
  }
  lineBlockAt(e) {
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || ci(this.heightMap.lineAt(e, _.ByPos, this.state.doc, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return ci(this.heightMap.lineAt(this.scaler.fromDOM(e), _.ByHeight, this.state.doc, 0, 0), this.scaler);
  }
  elementAtHeight(e) {
    return ci(this.heightMap.blockAt(this.scaler.fromDOM(e), this.state.doc, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class qi {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function ed(n, e, t) {
  let i = [], r = n, s = 0;
  return z.spans(t, n, e, {
    span() {
    },
    point(o, l) {
      o > r && (i.push({ from: r, to: o }), s += o - r), r = l;
    }
  }, 20), r < e && (i.push({ from: r, to: e }), s += e - r), { total: s, ranges: i };
}
function Ei({ total: n, ranges: e }, t) {
  if (t <= 0)
    return e[0].from;
  if (t >= 1)
    return e[e.length - 1].to;
  let i = Math.floor(n * t);
  for (let r = 0; ; r++) {
    let { from: s, to: o } = e[r], l = o - s;
    if (i <= l)
      return s + i;
    i -= l;
  }
}
function Ho(n, e) {
  let t = 0;
  for (let { from: i, to: r } of n.ranges) {
    if (e <= r) {
      t += e - i;
      break;
    }
    t += r - i;
  }
  return t / n.total;
}
function Jo(n, e, t) {
  for (let i = 0; i < n.length; i++) {
    let r = n[i];
    if (r.from < t && r.to > e) {
      let s = [];
      r.from < e && s.push({ from: r.from, to: e }), r.to > t && s.push({ from: t, to: r.to }), n.splice(i, 1, ...s), i += s.length - 1;
    }
  }
}
function td(n, e) {
  for (let t of n)
    if (e(t))
      return t;
}
const Ko = {
  toDOM(n) {
    return n;
  },
  fromDOM(n) {
    return n;
  },
  scale: 1
};
class id {
  constructor(e, t, i) {
    let r = 0, s = 0, o = 0;
    this.viewports = i.map(({ from: l, to: a }) => {
      let h = t.lineAt(l, _.ByPos, e, 0, 0).top, c = t.lineAt(a, _.ByPos, e, 0, 0).bottom;
      return r += c - h, { from: l, to: a, top: h, bottom: c, domTop: 0, domBottom: 0 };
    }), this.scale = (7e6 - r) / (t.height - r);
    for (let l of this.viewports)
      l.domTop = o + (l.top - s) * this.scale, o = l.domBottom = l.domTop + (l.bottom - l.top), s = l.bottom;
  }
  toDOM(e) {
    for (let t = 0, i = 0, r = 0; ; t++) {
      let s = t < this.viewports.length ? this.viewports[t] : null;
      if (!s || e < s.top)
        return r + (e - i) * this.scale;
      if (e <= s.bottom)
        return s.domTop + (e - s.top);
      i = s.bottom, r = s.domBottom;
    }
  }
  fromDOM(e) {
    for (let t = 0, i = 0, r = 0; ; t++) {
      let s = t < this.viewports.length ? this.viewports[t] : null;
      if (!s || e < s.domTop)
        return i + (e - r) / this.scale;
      if (e <= s.domBottom)
        return s.top + (e - s.domTop);
      i = s.bottom, r = s.domBottom;
    }
  }
}
function ci(n, e) {
  if (e.scale == 1)
    return n;
  let t = e.toDOM(n.top), i = e.toDOM(n.bottom);
  return new ft(n.from, n.length, t, i - t, Array.isArray(n.type) ? n.type.map((r) => ci(r, e)) : n.type);
}
const _i = /* @__PURE__ */ v.define({ combine: (n) => n.join(" ") }), us = /* @__PURE__ */ v.define({ combine: (n) => n.indexOf(!0) > -1 }), ds = /* @__PURE__ */ gt.newName(), vh = /* @__PURE__ */ gt.newName(), Ph = /* @__PURE__ */ gt.newName(), Rh = { "&light": "." + vh, "&dark": "." + Ph };
function Os(n, e, t) {
  return new gt(e, {
    finish(i) {
      return /&/.test(i) ? i.replace(/&\w*/, (r) => {
        if (r == "&")
          return n;
        if (!t || !t[r])
          throw new RangeError(`Unsupported selector: ${r}`);
        return t[r];
      }) : n + " " + i;
    }
  });
}
const nd = /* @__PURE__ */ Os("." + ds, {
  "&.cm-editor": {
    position: "relative !important",
    boxSizing: "border-box",
    "&.cm-focused": {
      outline: "1px dotted #212121"
    },
    display: "flex !important",
    flexDirection: "column"
  },
  ".cm-scroller": {
    display: "flex !important",
    alignItems: "flex-start !important",
    fontFamily: "monospace",
    lineHeight: 1.4,
    height: "100%",
    overflowX: "auto",
    position: "relative",
    zIndex: 0
  },
  ".cm-content": {
    margin: 0,
    flexGrow: 2,
    flexShrink: 0,
    minHeight: "100%",
    display: "block",
    whiteSpace: "pre",
    wordWrap: "normal",
    boxSizing: "border-box",
    padding: "4px 0",
    outline: "none",
    "&[contenteditable=true]": {
      WebkitUserModify: "read-write-plaintext-only"
    }
  },
  ".cm-lineWrapping": {
    whiteSpace_fallback: "pre-wrap",
    whiteSpace: "break-spaces",
    wordBreak: "break-word",
    overflowWrap: "anywhere",
    flexShrink: 1
  },
  "&light .cm-content": { caretColor: "black" },
  "&dark .cm-content": { caretColor: "white" },
  ".cm-line": {
    display: "block",
    padding: "0 2px 0 4px"
  },
  ".cm-selectionLayer": {
    zIndex: -1,
    contain: "size style"
  },
  ".cm-selectionBackground": {
    position: "absolute"
  },
  "&light .cm-selectionBackground": {
    background: "#d9d9d9"
  },
  "&dark .cm-selectionBackground": {
    background: "#222"
  },
  "&light.cm-focused .cm-selectionBackground": {
    background: "#d7d4f0"
  },
  "&dark.cm-focused .cm-selectionBackground": {
    background: "#233"
  },
  ".cm-cursorLayer": {
    zIndex: 100,
    contain: "size style",
    pointerEvents: "none"
  },
  "&.cm-focused .cm-cursorLayer": {
    animation: "steps(1) cm-blink 1.2s infinite"
  },
  "@keyframes cm-blink": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  "@keyframes cm-blink2": { "0%": {}, "50%": { opacity: 0 }, "100%": {} },
  ".cm-cursor, .cm-dropCursor": {
    position: "absolute",
    borderLeft: "1.2px solid black",
    marginLeft: "-0.6px",
    pointerEvents: "none"
  },
  ".cm-cursor": {
    display: "none"
  },
  "&dark .cm-cursor": {
    borderLeftColor: "#444"
  },
  "&.cm-focused .cm-cursor": {
    display: "block"
  },
  "&light .cm-activeLine": { backgroundColor: "#f3f9ff" },
  "&dark .cm-activeLine": { backgroundColor: "#223039" },
  "&light .cm-specialChar": { color: "red" },
  "&dark .cm-specialChar": { color: "#f78" },
  ".cm-gutters": {
    flexShrink: 0,
    display: "flex",
    height: "100%",
    boxSizing: "border-box",
    left: 0,
    zIndex: 200
  },
  "&light .cm-gutters": {
    backgroundColor: "#f5f5f5",
    color: "#6c6c6c",
    borderRight: "1px solid #ddd"
  },
  "&dark .cm-gutters": {
    backgroundColor: "#333338",
    color: "#ccc"
  },
  ".cm-gutter": {
    display: "flex !important",
    flexDirection: "column",
    flexShrink: 0,
    boxSizing: "border-box",
    minHeight: "100%",
    overflow: "hidden"
  },
  ".cm-gutterElement": {
    boxSizing: "border-box"
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 3px 0 5px",
    minWidth: "20px",
    textAlign: "right",
    whiteSpace: "nowrap"
  },
  "&light .cm-activeLineGutter": {
    backgroundColor: "#e2f2ff"
  },
  "&dark .cm-activeLineGutter": {
    backgroundColor: "#222227"
  },
  ".cm-panels": {
    boxSizing: "border-box",
    position: "sticky",
    left: 0,
    right: 0
  },
  "&light .cm-panels": {
    backgroundColor: "#f5f5f5",
    color: "black"
  },
  "&light .cm-panels-top": {
    borderBottom: "1px solid #ddd"
  },
  "&light .cm-panels-bottom": {
    borderTop: "1px solid #ddd"
  },
  "&dark .cm-panels": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tab": {
    display: "inline-block",
    overflow: "hidden",
    verticalAlign: "bottom"
  },
  ".cm-widgetBuffer": {
    verticalAlign: "text-top",
    height: "1em",
    display: "inline"
  },
  ".cm-placeholder": {
    color: "#888",
    display: "inline-block",
    verticalAlign: "top"
  },
  ".cm-button": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    padding: ".2em 1em",
    borderRadius: "1px"
  },
  "&light .cm-button": {
    backgroundImage: "linear-gradient(#eff1f5, #d9d9df)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#b4b4b4, #d0d3d6)"
    }
  },
  "&dark .cm-button": {
    backgroundImage: "linear-gradient(#393939, #111)",
    border: "1px solid #888",
    "&:active": {
      backgroundImage: "linear-gradient(#111, #333)"
    }
  },
  ".cm-textfield": {
    verticalAlign: "middle",
    color: "inherit",
    fontSize: "70%",
    border: "1px solid silver",
    padding: ".2em .5em"
  },
  "&light .cm-textfield": {
    backgroundColor: "white"
  },
  "&dark .cm-textfield": {
    border: "1px solid #555",
    backgroundColor: "inherit"
  }
}, Rh), rd = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, pr = w.ie && w.ie_version <= 11;
class sd {
  constructor(e, t, i) {
    this.view = e, this.onChange = t, this.onScrollChanged = i, this.active = !1, this.selectionRange = new ru(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.scrollTargets = [], this.intersection = null, this.resize = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((r) => {
      for (let s of r)
        this.queue.push(s);
      (w.ie && w.ie_version <= 11 || w.ios && e.composing) && r.some((s) => s.type == "childList" && s.removedNodes.length || s.type == "characterData" && s.oldValue.length > s.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), pr && (this.onCharData = (r) => {
      this.queue.push({
        target: r.target,
        type: "characterData",
        oldValue: r.prevValue
      }), this.flushSoon();
    }), this.onSelectionChange = this.onSelectionChange.bind(this), window.addEventListener("resize", this.onResize = this.onResize.bind(this)), typeof ResizeObserver == "function" && (this.resize = new ResizeObserver(() => {
      this.view.docView.lastUpdate < Date.now() - 75 && this.onResize();
    }), this.resize.observe(e.scrollDOM)), window.addEventListener("beforeprint", this.onPrint = this.onPrint.bind(this)), this.start(), window.addEventListener("scroll", this.onScroll = this.onScroll.bind(this)), typeof IntersectionObserver == "function" && (this.intersection = new IntersectionObserver((r) => {
      this.parentCheck < 0 && (this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3)), r.length > 0 && r[r.length - 1].intersectionRatio > 0 != this.intersecting && (this.intersecting = !this.intersecting, this.intersecting != this.view.inView && this.onScrollChanged(document.createEvent("Event")));
    }, {}), this.intersection.observe(this.dom), this.gapIntersection = new IntersectionObserver((r) => {
      r.length > 0 && r[r.length - 1].intersectionRatio > 0 && this.onScrollChanged(document.createEvent("Event"));
    }, {})), this.listenForScroll(), this.readSelectionRange(), this.dom.ownerDocument.addEventListener("selectionchange", this.onSelectionChange);
  }
  onScroll(e) {
    this.intersecting && this.flush(!1), this.onScrollChanged(e);
  }
  onResize() {
    this.resizeTimeout < 0 && (this.resizeTimeout = setTimeout(() => {
      this.resizeTimeout = -1, this.view.requestMeasure();
    }, 50));
  }
  onPrint() {
    this.view.viewState.printing = !0, this.view.measure(), setTimeout(() => {
      this.view.viewState.printing = !1, this.view.requestMeasure();
    }, 500);
  }
  updateGaps(e) {
    if (this.gapIntersection && (e.length != this.gaps.length || this.gaps.some((t, i) => t != e[i]))) {
      this.gapIntersection.disconnect();
      for (let t of e)
        this.gapIntersection.observe(t);
      this.gaps = e;
    }
  }
  onSelectionChange(e) {
    if (!this.readSelectionRange() || this.delayedAndroidKey)
      return;
    let { view: t } = this, i = this.selectionRange;
    if (t.state.facet(Nn) ? t.root.activeElement != this.dom : !tn(t.dom, i))
      return;
    let r = i.anchorNode && t.docView.nearest(i.anchorNode);
    r && r.ignoreEvent(e) || ((w.ie && w.ie_version <= 11 || w.android && w.chrome) && !t.state.selection.main.empty && i.focusNode && On(i.focusNode, i.focusOffset, i.anchorNode, i.anchorOffset) ? this.flushSoon() : this.flush(!1));
  }
  readSelectionRange() {
    let { view: e } = this, t = w.safari && e.root.nodeType == 11 && tu() == this.dom && od(this.view) || dn(e.root);
    if (!t || this.selectionRange.eq(t))
      return !1;
    let i = tn(this.dom, t);
    return i && !this.selectionChanged && this.selectionRange.focusNode && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && ou(this.dom, t) ? (e.docView.updateSelection(), !1) : (this.selectionRange.setRange(t), i && (this.selectionChanged = !0), !0);
  }
  setSelectionRange(e, t) {
    this.selectionRange.set(e.node, e.offset, t.node, t.offset), this.selectionChanged = !1;
  }
  clearSelectionRange() {
    this.selectionRange.set(null, 0, null, 0);
  }
  listenForScroll() {
    this.parentCheck = -1;
    let e = 0, t = null;
    for (let i = this.dom; i; )
      if (i.nodeType == 1)
        !t && e < this.scrollTargets.length && this.scrollTargets[e] == i ? e++ : t || (t = this.scrollTargets.slice(0, e)), t && t.push(i), i = i.assignedSlot || i.parentNode;
      else if (i.nodeType == 11)
        i = i.host;
      else
        break;
    if (e < this.scrollTargets.length && !t && (t = this.scrollTargets.slice(0, e)), t) {
      for (let i of this.scrollTargets)
        i.removeEventListener("scroll", this.onScroll);
      for (let i of this.scrollTargets = t)
        i.addEventListener("scroll", this.onScroll);
    }
  }
  ignore(e) {
    if (!this.active)
      return e();
    try {
      return this.stop(), e();
    } finally {
      this.start(), this.clear();
    }
  }
  start() {
    this.active || (this.observer.observe(this.dom, rd), pr && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    !this.active || (this.active = !1, this.observer.disconnect(), pr && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
  }
  clear() {
    this.processRecords(), this.queue.length = 0, this.selectionChanged = !1;
  }
  delayAndroidKey(e, t) {
    this.delayedAndroidKey || requestAnimationFrame(() => {
      let i = this.delayedAndroidKey;
      this.delayedAndroidKey = null, this.delayedFlush = -1, this.flush() || Oi(this.dom, i.key, i.keyCode);
    }), (!this.delayedAndroidKey || e == "Enter") && (this.delayedAndroidKey = { key: e, keyCode: t });
  }
  flushSoon() {
    this.delayedFlush < 0 && (this.delayedFlush = window.setTimeout(() => {
      this.delayedFlush = -1, this.flush();
    }, 20));
  }
  forceFlush() {
    this.delayedFlush >= 0 && (window.clearTimeout(this.delayedFlush), this.delayedFlush = -1), this.flush();
  }
  processRecords() {
    let e = this.queue;
    for (let s of this.observer.takeRecords())
      e.push(s);
    e.length && (this.queue = []);
    let t = -1, i = -1, r = !1;
    for (let s of e) {
      let o = this.readMutation(s);
      !o || (o.typeOver && (r = !0), t == -1 ? { from: t, to: i } = o : (t = Math.min(o.from, t), i = Math.max(o.to, i)));
    }
    return { from: t, to: i, typeOver: r };
  }
  flush(e = !0) {
    if (this.delayedFlush >= 0 || this.delayedAndroidKey)
      return;
    e && this.readSelectionRange();
    let { from: t, to: i, typeOver: r } = this.processRecords(), s = this.selectionChanged && tn(this.dom, this.selectionRange);
    if (t < 0 && !s)
      return;
    this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let o = this.view.state, l = this.onChange(t, i, r);
    return this.view.state == o && this.view.update([]), l;
  }
  readMutation(e) {
    let t = this.view.docView.nearest(e.target);
    if (!t || t.ignoreMutation(e))
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "attributes" && (t.dirty |= 4), e.type == "childList") {
      let i = el(t, e.previousSibling || e.target.previousSibling, -1), r = el(t, e.nextSibling || e.target.nextSibling, 1);
      return {
        from: i ? t.posAfter(i) : t.posAtStart,
        to: r ? t.posBefore(r) : t.posAtEnd,
        typeOver: !1
      };
    } else
      return e.type == "characterData" ? { from: t.posAtStart, to: t.posAtEnd, typeOver: e.target.nodeValue == e.oldValue } : null;
  }
  destroy() {
    var e, t, i;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (i = this.resize) === null || i === void 0 || i.disconnect();
    for (let r of this.scrollTargets)
      r.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("scroll", this.onScroll), window.removeEventListener("resize", this.onResize), window.removeEventListener("beforeprint", this.onPrint), this.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout);
  }
}
function el(n, e, t) {
  for (; e; ) {
    let i = G.get(e);
    if (i && i.parent == n)
      return i;
    let r = e.parentNode;
    e = r != n.dom ? r : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function od(n) {
  let e = null;
  function t(a) {
    a.preventDefault(), a.stopImmediatePropagation(), e = a.getTargetRanges()[0];
  }
  if (n.contentDOM.addEventListener("beforeinput", t, !0), document.execCommand("indent"), n.contentDOM.removeEventListener("beforeinput", t, !0), !e)
    return null;
  let i = e.startContainer, r = e.startOffset, s = e.endContainer, o = e.endOffset, l = n.docView.domAtPos(n.state.selection.main.anchor);
  return On(l.node, l.offset, s, o) && ([i, r, s, o] = [s, o, i, r]), { anchorNode: i, anchorOffset: r, focusNode: s, focusOffset: o };
}
function ld(n, e, t, i) {
  let r, s, o = n.state.selection.main;
  if (e > -1) {
    let l = n.docView.domBoundsAround(e, t, 0);
    if (!l || n.state.readOnly)
      return !1;
    let { from: a, to: h } = l, c = n.docView.impreciseHead || n.docView.impreciseAnchor ? [] : hd(n), f = new ph(c, n.state);
    f.readRange(l.startDOM, l.endDOM);
    let u = o.from, d = null;
    (n.inputState.lastKeyCode === 8 && n.inputState.lastKeyTime > Date.now() - 100 || w.android && f.text.length < h - a) && (u = o.to, d = "end");
    let O = ad(n.state.doc.sliceString(a, h, ct), f.text, u - a, d);
    O && (w.chrome && n.inputState.lastKeyCode == 13 && O.toB == O.from + 2 && f.text.slice(O.from, O.toB) == ct + ct && O.toB--, r = {
      from: a + O.from,
      to: a + O.toA,
      insert: j.of(f.text.slice(O.from, O.toB).split(ct))
    }), s = cd(c, a);
  } else if (n.hasFocus || !n.state.facet(Nn)) {
    let l = n.observer.selectionRange, { impreciseHead: a, impreciseAnchor: h } = n.docView, c = a && a.node == l.focusNode && a.offset == l.focusOffset || !Vt(n.contentDOM, l.focusNode) ? n.state.selection.main.head : n.docView.posFromDOM(l.focusNode, l.focusOffset), f = h && h.node == l.anchorNode && h.offset == l.anchorOffset || !Vt(n.contentDOM, l.anchorNode) ? n.state.selection.main.anchor : n.docView.posFromDOM(l.anchorNode, l.anchorOffset);
    (c != o.head || f != o.anchor) && (s = m.single(f, c));
  }
  if (!r && !s)
    return !1;
  if (!r && i && !o.empty && s && s.main.empty ? r = { from: o.from, to: o.to, insert: n.state.doc.slice(o.from, o.to) } : r && r.from >= o.from && r.to <= o.to && (r.from != o.from || r.to != o.to) && o.to - o.from - (r.to - r.from) <= 4 ? r = {
    from: o.from,
    to: o.to,
    insert: n.state.doc.slice(o.from, r.from).append(r.insert).append(n.state.doc.slice(r.to, o.to))
  } : (w.mac || w.android) && r && r.from == r.to && r.from == o.head - 1 && r.insert.toString() == "." && (r = { from: o.from, to: o.to, insert: j.of([" "]) }), r) {
    let l = n.state;
    if (w.ios && n.inputState.flushIOSKey(n) || w.android && (r.from == o.from && r.to == o.to && r.insert.length == 1 && r.insert.lines == 2 && Oi(n.contentDOM, "Enter", 13) || r.from == o.from - 1 && r.to == o.to && r.insert.length == 0 && Oi(n.contentDOM, "Backspace", 8) || r.from == o.from && r.to == o.to + 1 && r.insert.length == 0 && Oi(n.contentDOM, "Delete", 46)))
      return !0;
    let a = r.insert.toString();
    if (n.state.facet(oh).some((f) => f(n, r.from, r.to, a)))
      return !0;
    n.inputState.composing >= 0 && n.inputState.composing++;
    let h;
    if (r.from >= o.from && r.to <= o.to && r.to - r.from >= (o.to - o.from) / 3 && (!s || s.main.empty && s.main.from == r.from + r.insert.length) && n.inputState.composing < 0) {
      let f = o.from < r.from ? l.sliceDoc(o.from, r.from) : "", u = o.to > r.to ? l.sliceDoc(r.to, o.to) : "";
      h = l.replaceSelection(n.state.toText(f + r.insert.sliceString(0, void 0, n.state.lineBreak) + u));
    } else {
      let f = l.changes(r), u = s && !l.selection.main.eq(s.main) && s.main.to <= f.newLength ? s.main : void 0;
      if (l.selection.ranges.length > 1 && n.inputState.composing >= 0 && r.to <= o.to && r.to >= o.to - 10) {
        let d = n.state.sliceDoc(r.from, r.to), O = gh(n) || n.state.doc.lineAt(o.head), g = o.to - r.to, Q = o.to - o.from;
        h = l.changeByRange((b) => {
          if (b.from == o.from && b.to == o.to)
            return { changes: f, range: u || b.map(f) };
          let k = b.to - g, T = k - d.length;
          if (b.to - b.from != Q || n.state.sliceDoc(T, k) != d || O && b.to >= O.from && b.from <= O.to)
            return { range: b };
          let x = l.changes({ from: T, to: k, insert: r.insert }), $ = b.to - o.to;
          return {
            changes: x,
            range: u ? m.range(Math.max(0, u.anchor + $), Math.max(0, u.head + $)) : b.map(x)
          };
        });
      } else
        h = {
          changes: f,
          selection: u && l.selection.replaceRange(u)
        };
    }
    let c = "input.type";
    return n.composing && (c += ".compose", n.inputState.compositionFirstChange && (c += ".start", n.inputState.compositionFirstChange = !1)), n.dispatch(h, { scrollIntoView: !0, userEvent: c }), !0;
  } else if (s && !s.main.eq(o)) {
    let l = !1, a = "select";
    return n.inputState.lastSelectionTime > Date.now() - 50 && (n.inputState.lastSelectionOrigin == "select" && (l = !0), a = n.inputState.lastSelectionOrigin), n.dispatch({ selection: s, scrollIntoView: l, userEvent: a }), !0;
  } else
    return !1;
}
function ad(n, e, t, i) {
  let r = Math.min(n.length, e.length), s = 0;
  for (; s < r && n.charCodeAt(s) == e.charCodeAt(s); )
    s++;
  if (s == r && n.length == e.length)
    return null;
  let o = n.length, l = e.length;
  for (; o > 0 && l > 0 && n.charCodeAt(o - 1) == e.charCodeAt(l - 1); )
    o--, l--;
  if (i == "end") {
    let a = Math.max(0, s - Math.min(o, l));
    t -= o + a - s;
  }
  return o < s && n.length < e.length ? (s -= t <= s && t >= o ? s - t : 0, l = s + (l - o), o = s) : l < s && (s -= t <= s && t >= l ? s - t : 0, o = s + (o - l), l = s), { from: s, toA: o, toB: l };
}
function hd(n) {
  let e = [];
  if (n.root.activeElement != n.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: i, focusNode: r, focusOffset: s } = n.observer.selectionRange;
  return t && (e.push(new Wo(t, i)), (r != t || s != i) && e.push(new Wo(r, s))), e;
}
function cd(n, e) {
  if (n.length == 0)
    return null;
  let t = n[0].pos, i = n.length == 2 ? n[1].pos : t;
  return t > -1 && i > -1 ? m.single(t + e, i + e) : null;
}
class P {
  constructor(e = {}) {
    this.plugins = [], this.pluginMap = /* @__PURE__ */ new Map(), this.editorAttrs = {}, this.contentAttrs = {}, this.bidiCache = [], this.destroyed = !1, this.updateState = 2, this.measureScheduled = -1, this.measureRequests = [], this.contentDOM = document.createElement("div"), this.scrollDOM = document.createElement("div"), this.scrollDOM.tabIndex = -1, this.scrollDOM.className = "cm-scroller", this.scrollDOM.appendChild(this.contentDOM), this.announceDOM = document.createElement("div"), this.announceDOM.style.cssText = "position: absolute; top: -10000px", this.announceDOM.setAttribute("aria-live", "polite"), this.dom = document.createElement("div"), this.dom.appendChild(this.announceDOM), this.dom.appendChild(this.scrollDOM), this._dispatch = e.dispatch || ((t) => this.update([t])), this.dispatch = this.dispatch.bind(this), this.root = e.root || su(e.parent) || document, this.viewState = new Fo(e.state || M.create(e)), this.plugins = this.state.facet(ai).map((t) => new fr(t));
    for (let t of this.plugins)
      t.update(this);
    this.observer = new sd(this, (t, i, r) => ld(this, t, i, r), (t) => {
      this.inputState.runScrollHandlers(this, t), this.observer.intersecting && this.measure();
    }), this.inputState = new Xu(this), this.inputState.ensureHandlers(this, this.plugins), this.docView = new Xo(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), e.parent && e.parent.appendChild(this.dom);
  }
  get state() {
    return this.viewState.state;
  }
  get viewport() {
    return this.viewState.viewport;
  }
  get visibleRanges() {
    return this.viewState.visibleRanges;
  }
  get inView() {
    return this.viewState.inView;
  }
  get composing() {
    return this.inputState.composing > 0;
  }
  get compositionStarted() {
    return this.inputState.composing >= 0;
  }
  dispatch(...e) {
    this._dispatch(e.length == 1 && e[0] instanceof K ? e[0] : this.state.update(...e));
  }
  update(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
    let t = !1, i = !1, r, s = this.state;
    for (let l of e) {
      if (l.startState != s)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      s = l.state;
    }
    if (this.destroyed) {
      this.viewState.state = s;
      return;
    }
    if (this.observer.clear(), s.facet(M.phrases) != this.state.facet(M.phrases))
      return this.setState(s);
    r = mn.create(this, s, e);
    let o = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let l of e) {
        if (o && (o = o.map(l.changes)), l.scrollIntoView) {
          let { main: a } = l.state.selection;
          o = new gn(a.empty ? a : m.cursor(a.head, a.head > a.anchor ? -1 : 1));
        }
        for (let a of l.effects)
          a.is(Co) && (o = a.value);
      }
      this.viewState.update(r, o), this.bidiCache = Qn.update(this.bidiCache, r.changes), r.empty || (this.updatePlugins(r), this.inputState.update(r)), t = this.docView.update(r), this.state.facet(hi) != this.styleModules && this.mountStyles(), i = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((l) => l.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (r.startState.facet(_i) != r.state.facet(_i) && (this.viewState.mustMeasureContent = !0), (t || i || o || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), !r.empty)
      for (let l of this.state.facet(os))
        l(r);
  }
  setState(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.setState are not allowed while an update is in progress");
    if (this.destroyed) {
      this.viewState.state = e;
      return;
    }
    this.updateState = 2;
    let t = this.hasFocus;
    try {
      for (let i of this.plugins)
        i.destroy(this);
      this.viewState = new Fo(e), this.plugins = e.facet(ai).map((i) => new fr(i)), this.pluginMap.clear();
      for (let i of this.plugins)
        i.update(this);
      this.docView = new Xo(this), this.inputState.ensureHandlers(this, this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(ai), i = e.state.facet(ai);
    if (t != i) {
      let r = [];
      for (let s of i) {
        let o = t.indexOf(s);
        if (o < 0)
          r.push(new fr(s));
        else {
          let l = this.plugins[o];
          l.mustUpdate = e, r.push(l);
        }
      }
      for (let s of this.plugins)
        s.mustUpdate != e && s.destroy(this);
      this.plugins = r, this.pluginMap.clear(), this.inputState.ensureHandlers(this, this.plugins);
    } else
      for (let r of this.plugins)
        r.mustUpdate = e;
    for (let r = 0; r < this.plugins.length; r++)
      this.plugins[r].update(this);
  }
  measure(e = !0) {
    if (this.destroyed)
      return;
    this.measureScheduled > -1 && cancelAnimationFrame(this.measureScheduled), this.measureScheduled = 0, e && this.observer.forceFlush();
    let t = null;
    try {
      for (let i = 0; ; i++) {
        this.updateState = 1;
        let r = this.viewport, s = this.viewState.measure(this);
        if (!s && !this.measureRequests.length && this.viewState.scrollTarget == null)
          break;
        if (i > 5) {
          console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
          break;
        }
        let o = [];
        s & 4 || ([this.measureRequests, o] = [o, this.measureRequests]);
        let l = o.map((f) => {
          try {
            return f.read(this);
          } catch (u) {
            return Me(this.state, u), tl;
          }
        }), a = mn.create(this, this.state, []), h = !1, c = !1;
        a.flags |= s, t ? t.flags |= s : t = a, this.updateState = 2, a.empty || (this.updatePlugins(a), this.inputState.update(a), this.updateAttrs(), h = this.docView.update(a));
        for (let f = 0; f < o.length; f++)
          if (l[f] != tl)
            try {
              let u = o[f];
              u.write && u.write(l[f], this);
            } catch (u) {
              Me(this.state, u);
            }
        if (this.viewState.scrollTarget && (this.docView.scrollIntoView(this.viewState.scrollTarget), this.viewState.scrollTarget = null, c = !0), h && this.docView.updateSelection(!0), this.viewport.from == r.from && this.viewport.to == r.to && !c && this.measureRequests.length == 0)
          break;
      }
    } finally {
      this.updateState = 0, this.measureScheduled = -1;
    }
    if (t && !t.empty)
      for (let i of this.state.facet(os))
        i(t);
  }
  get themeClasses() {
    return ds + " " + (this.state.facet(us) ? Ph : vh) + " " + this.state.facet(_i);
  }
  updateAttrs() {
    let e = il(this, ah, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      translate: "no",
      contenteditable: this.state.facet(Nn) ? "true" : "false",
      class: "cm-content",
      style: `${w.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), il(this, hh, t);
    let i = this.observer.ignore(() => {
      let r = rs(this.contentDOM, this.contentAttrs, t), s = rs(this.dom, this.editorAttrs, e);
      return r || s;
    });
    return this.editorAttrs = e, this.contentAttrs = t, i;
  }
  showAnnouncements(e) {
    let t = !0;
    for (let i of e)
      for (let r of i.effects)
        if (r.is(P.announce)) {
          t && (this.announceDOM.textContent = ""), t = !1;
          let s = this.announceDOM.appendChild(document.createElement("div"));
          s.textContent = r.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(hi), gt.mount(this.root, this.styleModules.concat(nd).reverse());
  }
  readMeasured() {
    if (this.updateState == 2)
      throw new Error("Reading the editor layout isn't allowed during an update");
    this.updateState == 0 && this.measureScheduled > -1 && this.measure(!1);
  }
  requestMeasure(e) {
    if (this.measureScheduled < 0 && (this.measureScheduled = requestAnimationFrame(() => this.measure())), e) {
      if (e.key != null) {
        for (let t = 0; t < this.measureRequests.length; t++)
          if (this.measureRequests[t].key === e.key) {
            this.measureRequests[t] = e;
            return;
          }
      }
      this.measureRequests.push(e);
    }
  }
  plugin(e) {
    let t = this.pluginMap.get(e);
    return (t === void 0 || t && t.spec != e) && this.pluginMap.set(e, t = this.plugins.find((i) => i.spec == e) || null), t && t.update(this).value;
  }
  get documentTop() {
    return this.contentDOM.getBoundingClientRect().top + this.viewState.paddingTop;
  }
  get documentPadding() {
    return { top: this.viewState.paddingTop, bottom: this.viewState.paddingBottom };
  }
  elementAtHeight(e) {
    return this.readMeasured(), this.viewState.elementAtHeight(e);
  }
  lineBlockAtHeight(e) {
    return this.readMeasured(), this.viewState.lineBlockAtHeight(e);
  }
  get viewportLineBlocks() {
    return this.viewState.viewportLines;
  }
  lineBlockAt(e) {
    return this.viewState.lineBlockAt(e);
  }
  get contentHeight() {
    return this.viewState.contentHeight;
  }
  moveByChar(e, t, i) {
    return dr(this, e, qo(this, e, t, i));
  }
  moveByGroup(e, t) {
    return dr(this, e, qo(this, e, t, (i) => Au(this, e.head, i)));
  }
  moveToLineBoundary(e, t, i = !0) {
    return Cu(this, e, t, i);
  }
  moveVertically(e, t, i) {
    return dr(this, e, Wu(this, e, t, i));
  }
  domAtPos(e) {
    return this.docView.domAtPos(e);
  }
  posAtDOM(e, t = 0) {
    return this.docView.posFromDOM(e, t);
  }
  posAtCoords(e, t = !0) {
    return this.readMeasured(), Qh(this, e, t);
  }
  coordsAtPos(e, t = 1) {
    this.readMeasured();
    let i = this.docView.coordsAt(e, t);
    if (!i || i.left == i.right)
      return i;
    let r = this.state.doc.lineAt(e), s = this.bidiSpans(r), o = s[_t.find(s, e - r.from, -1, t)];
    return In(i, o.dir == U.LTR == t > 0);
  }
  get defaultCharacterWidth() {
    return this.viewState.heightOracle.charWidth;
  }
  get defaultLineHeight() {
    return this.viewState.heightOracle.lineHeight;
  }
  get textDirection() {
    return this.viewState.defaultTextDirection;
  }
  textDirectionAt(e) {
    return !this.state.facet(lh) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
  }
  get lineWrapping() {
    return this.viewState.heightOracle.lineWrapping;
  }
  bidiSpans(e) {
    if (e.length > fd)
      return dh(e.length);
    let t = this.textDirectionAt(e.from);
    for (let r of this.bidiCache)
      if (r.from == e.from && r.dir == t)
        return r.order;
    let i = gu(e.text, t);
    return this.bidiCache.push(new Qn(e.from, e.to, t, i)), i;
  }
  get hasFocus() {
    var e;
    return (document.hasFocus() || w.safari && ((e = this.inputState) === null || e === void 0 ? void 0 : e.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  focus() {
    this.observer.ignore(() => {
      Ga(this.contentDOM), this.docView.updateSelection();
    });
  }
  destroy() {
    for (let e of this.plugins)
      e.destroy(this);
    this.plugins = [], this.inputState.destroy(), this.dom.remove(), this.observer.destroy(), this.measureScheduled > -1 && cancelAnimationFrame(this.measureScheduled), this.destroyed = !0;
  }
  static scrollIntoView(e, t = {}) {
    return Co.of(new gn(typeof e == "number" ? m.cursor(e) : e, t.y, t.x, t.yMargin, t.xMargin));
  }
  static domEventHandlers(e) {
    return he.define(() => ({}), { eventHandlers: e });
  }
  static theme(e, t) {
    let i = gt.newName(), r = [_i.of(i), hi.of(Os(`.${i}`, e))];
    return t && t.dark && r.push(us.of(!0)), r;
  }
  static baseTheme(e) {
    return Ct.lowest(hi.of(Os("." + ds, e, Rh)));
  }
  static findFromDOM(e) {
    var t;
    let i = e.querySelector(".cm-content"), r = i && G.get(i) || G.get(e);
    return ((t = r == null ? void 0 : r.rootView) === null || t === void 0 ? void 0 : t.view) || null;
  }
}
P.styleModule = hi;
P.inputHandler = oh;
P.perLineTextDirection = lh;
P.exceptionSink = sh;
P.updateListener = os;
P.editable = Nn;
P.mouseSelectionStyle = rh;
P.dragMovesSelection = nh;
P.clickAddsSelectionRange = ih;
P.decorations = $i;
P.atomicRanges = ch;
P.scrollMargins = fh;
P.darkTheme = us;
P.contentAttributes = hh;
P.editorAttributes = ah;
P.lineWrapping = /* @__PURE__ */ P.contentAttributes.of({ class: "cm-lineWrapping" });
P.announce = /* @__PURE__ */ Z.define();
const fd = 4096, tl = {};
class Qn {
  constructor(e, t, i, r) {
    this.from = e, this.to = t, this.dir = i, this.order = r;
  }
  static update(e, t) {
    if (t.empty)
      return e;
    let i = [], r = e.length ? e[e.length - 1].dir : U.LTR;
    for (let s = Math.max(0, e.length - 10); s < e.length; s++) {
      let o = e[s];
      o.dir == r && !t.touchesRange(o.from, o.to) && i.push(new Qn(t.mapPos(o.from, 1), t.mapPos(o.to, -1), o.dir, o.order));
    }
    return i;
  }
}
function il(n, e, t) {
  for (let i = n.state.facet(e), r = i.length - 1; r >= 0; r--) {
    let s = i[r], o = typeof s == "function" ? s(n) : s;
    o && ns(o, t);
  }
  return t;
}
const ud = w.mac ? "mac" : w.windows ? "win" : w.linux ? "linux" : "key";
function dd(n, e) {
  const t = n.split(/-(?!$)/);
  let i = t[t.length - 1];
  i == "Space" && (i = " ");
  let r, s, o, l;
  for (let a = 0; a < t.length - 1; ++a) {
    const h = t[a];
    if (/^(cmd|meta|m)$/i.test(h))
      l = !0;
    else if (/^a(lt)?$/i.test(h))
      r = !0;
    else if (/^(c|ctrl|control)$/i.test(h))
      s = !0;
    else if (/^s(hift)?$/i.test(h))
      o = !0;
    else if (/^mod$/i.test(h))
      e == "mac" ? l = !0 : s = !0;
    else
      throw new Error("Unrecognized modifier name: " + h);
  }
  return r && (i = "Alt-" + i), s && (i = "Ctrl-" + i), l && (i = "Meta-" + i), o && (i = "Shift-" + i), i;
}
function Ii(n, e, t) {
  return e.altKey && (n = "Alt-" + n), e.ctrlKey && (n = "Ctrl-" + n), e.metaKey && (n = "Meta-" + n), t !== !1 && e.shiftKey && (n = "Shift-" + n), n;
}
const Od = /* @__PURE__ */ Ct.default(/* @__PURE__ */ P.domEventHandlers({
  keydown(n, e) {
    return Ah(Ch(e.state), n, e, "editor");
  }
})), Bn = /* @__PURE__ */ v.define({ enables: Od }), nl = /* @__PURE__ */ new WeakMap();
function Ch(n) {
  let e = n.facet(Bn), t = nl.get(e);
  return t || nl.set(e, t = md(e.reduce((i, r) => i.concat(r), []))), t;
}
function pd(n, e, t) {
  return Ah(Ch(n.state), e, n, t);
}
let lt = null;
const gd = 4e3;
function md(n, e = ud) {
  let t = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null), r = (o, l) => {
    let a = i[o];
    if (a == null)
      i[o] = l;
    else if (a != l)
      throw new Error("Key binding " + o + " is used both as a regular binding and as a multi-stroke prefix");
  }, s = (o, l, a, h) => {
    let c = t[o] || (t[o] = /* @__PURE__ */ Object.create(null)), f = l.split(/ (?!$)/).map((O) => dd(O, e));
    for (let O = 1; O < f.length; O++) {
      let g = f.slice(0, O).join(" ");
      r(g, !0), c[g] || (c[g] = {
        preventDefault: !0,
        commands: [(Q) => {
          let b = lt = { view: Q, prefix: g, scope: o };
          return setTimeout(() => {
            lt == b && (lt = null);
          }, gd), !0;
        }]
      });
    }
    let u = f.join(" ");
    r(u, !1);
    let d = c[u] || (c[u] = { preventDefault: !1, commands: [] });
    d.commands.push(a), h && (d.preventDefault = !0);
  };
  for (let o of n) {
    let l = o[e] || o.key;
    if (!!l)
      for (let a of o.scope ? o.scope.split(" ") : ["editor"])
        s(a, l, o.run, o.preventDefault), o.shift && s(a, "Shift-" + l, o.shift, o.preventDefault);
  }
  return t;
}
function Ah(n, e, t, i) {
  let r = eu(e), s = ne(r, 0), o = xe(s) == r.length && r != " ", l = "", a = !1;
  lt && lt.view == t && lt.scope == i && (l = lt.prefix + " ", (a = yh.indexOf(e.keyCode) < 0) && (lt = null));
  let h = (u) => {
    if (u) {
      for (let d of u.commands)
        if (d(t))
          return !0;
      u.preventDefault && (a = !0);
    }
    return !1;
  }, c = n[i], f;
  if (c) {
    if (h(c[l + Ii(r, e, !o)]))
      return !0;
    if (o && (e.shiftKey || e.altKey || e.metaKey || s > 127) && (f = mt[e.keyCode]) && f != r) {
      if (h(c[l + Ii(f, e, !0)]))
        return !0;
      if (e.shiftKey && Gt[e.keyCode] != f && h(c[l + Ii(Gt[e.keyCode], e, !1)]))
        return !0;
    } else if (o && e.shiftKey && h(c[l + Ii(r, e, !0)]))
      return !0;
  }
  return a;
}
const Wh = !w.ios, fi = /* @__PURE__ */ v.define({
  combine(n) {
    return yt(n, {
      cursorBlinkRate: 1200,
      drawRangeCursor: !0
    }, {
      cursorBlinkRate: (e, t) => Math.min(e, t),
      drawRangeCursor: (e, t) => e || t
    });
  }
});
function Qd(n = {}) {
  return [
    fi.of(n),
    bd,
    yd
  ];
}
class Xh {
  constructor(e, t, i, r, s) {
    this.left = e, this.top = t, this.width = i, this.height = r, this.className = s;
  }
  draw() {
    let e = document.createElement("div");
    return e.className = this.className, this.adjust(e), e;
  }
  adjust(e) {
    e.style.left = this.left + "px", e.style.top = this.top + "px", this.width >= 0 && (e.style.width = this.width + "px"), e.style.height = this.height + "px";
  }
  eq(e) {
    return this.left == e.left && this.top == e.top && this.width == e.width && this.height == e.height && this.className == e.className;
  }
}
const bd = /* @__PURE__ */ he.fromClass(class {
  constructor(n) {
    this.view = n, this.rangePieces = [], this.cursors = [], this.measureReq = { read: this.readPos.bind(this), write: this.drawSel.bind(this) }, this.selectionLayer = n.scrollDOM.appendChild(document.createElement("div")), this.selectionLayer.className = "cm-selectionLayer", this.selectionLayer.setAttribute("aria-hidden", "true"), this.cursorLayer = n.scrollDOM.appendChild(document.createElement("div")), this.cursorLayer.className = "cm-cursorLayer", this.cursorLayer.setAttribute("aria-hidden", "true"), n.requestMeasure(this.measureReq), this.setBlinkRate();
  }
  setBlinkRate() {
    this.cursorLayer.style.animationDuration = this.view.state.facet(fi).cursorBlinkRate + "ms";
  }
  update(n) {
    let e = n.startState.facet(fi) != n.state.facet(fi);
    (e || n.selectionSet || n.geometryChanged || n.viewportChanged) && this.view.requestMeasure(this.measureReq), n.transactions.some((t) => t.scrollIntoView) && (this.cursorLayer.style.animationName = this.cursorLayer.style.animationName == "cm-blink" ? "cm-blink2" : "cm-blink"), e && this.setBlinkRate();
  }
  readPos() {
    let { state: n } = this.view, e = n.facet(fi), t = n.selection.ranges.map((r) => r.empty ? [] : Sd(this.view, r)).reduce((r, s) => r.concat(s)), i = [];
    for (let r of n.selection.ranges) {
      let s = r == n.selection.main;
      if (r.empty ? !s || Wh : e.drawRangeCursor) {
        let o = xd(this.view, r, s);
        o && i.push(o);
      }
    }
    return { rangePieces: t, cursors: i };
  }
  drawSel({ rangePieces: n, cursors: e }) {
    if (n.length != this.rangePieces.length || n.some((t, i) => !t.eq(this.rangePieces[i]))) {
      this.selectionLayer.textContent = "";
      for (let t of n)
        this.selectionLayer.appendChild(t.draw());
      this.rangePieces = n;
    }
    if (e.length != this.cursors.length || e.some((t, i) => !t.eq(this.cursors[i]))) {
      let t = this.cursorLayer.children;
      if (t.length !== e.length) {
        this.cursorLayer.textContent = "";
        for (const i of e)
          this.cursorLayer.appendChild(i.draw());
      } else
        e.forEach((i, r) => i.adjust(t[r]));
      this.cursors = e;
    }
  }
  destroy() {
    this.selectionLayer.remove(), this.cursorLayer.remove();
  }
}), Zh = {
  ".cm-line": {
    "& ::selection": { backgroundColor: "transparent !important" },
    "&::selection": { backgroundColor: "transparent !important" }
  }
};
Wh && (Zh[".cm-line"].caretColor = "transparent !important");
const yd = /* @__PURE__ */ Ct.highest(/* @__PURE__ */ P.theme(Zh));
function Dh(n) {
  let e = n.scrollDOM.getBoundingClientRect();
  return { left: (n.textDirection == U.LTR ? e.left : e.right - n.scrollDOM.clientWidth) - n.scrollDOM.scrollLeft, top: e.top - n.scrollDOM.scrollTop };
}
function rl(n, e, t) {
  let i = m.cursor(e);
  return {
    from: Math.max(t.from, n.moveToLineBoundary(i, !1, !0).from),
    to: Math.min(t.to, n.moveToLineBoundary(i, !0, !0).from),
    type: E.Text
  };
}
function sl(n, e) {
  let t = n.lineBlockAt(e);
  if (Array.isArray(t.type)) {
    for (let i of t.type)
      if (i.to > e || i.to == e && (i.to == t.to || i.type == E.Text))
        return i;
  }
  return t;
}
function Sd(n, e) {
  if (e.to <= n.viewport.from || e.from >= n.viewport.to)
    return [];
  let t = Math.max(e.from, n.viewport.from), i = Math.min(e.to, n.viewport.to), r = n.textDirection == U.LTR, s = n.contentDOM, o = s.getBoundingClientRect(), l = Dh(n), a = window.getComputedStyle(s.firstChild), h = o.left + parseInt(a.paddingLeft) + Math.min(0, parseInt(a.textIndent)), c = o.right - parseInt(a.paddingRight), f = sl(n, t), u = sl(n, i), d = f.type == E.Text ? f : null, O = u.type == E.Text ? u : null;
  if (n.lineWrapping && (d && (d = rl(n, t, d)), O && (O = rl(n, i, O))), d && O && d.from == O.from)
    return Q(b(e.from, e.to, d));
  {
    let T = d ? b(e.from, null, d) : k(f, !1), x = O ? b(null, e.to, O) : k(u, !0), $ = [];
    return (d || f).to < (O || u).from - 1 ? $.push(g(h, T.bottom, c, x.top)) : T.bottom < x.top && n.elementAtHeight((T.bottom + x.top) / 2).type == E.Text && (T.bottom = x.top = (T.bottom + x.top) / 2), Q(T).concat($).concat(Q(x));
  }
  function g(T, x, $, R) {
    return new Xh(T - l.left, x - l.top - 0.01, $ - T, R - x + 0.01, "cm-selectionBackground");
  }
  function Q({ top: T, bottom: x, horizontal: $ }) {
    let R = [];
    for (let A = 0; A < $.length; A += 2)
      R.push(g($[A], T, $[A + 1], x));
    return R;
  }
  function b(T, x, $) {
    let R = 1e9, A = -1e9, B = [];
    function D(L, H, be, oe, ce) {
      let Ae = n.coordsAtPos(L, L == $.to ? -2 : 2), te = n.coordsAtPos(be, be == $.from ? 2 : -2);
      R = Math.min(Ae.top, te.top, R), A = Math.max(Ae.bottom, te.bottom, A), ce == U.LTR ? B.push(r && H ? h : Ae.left, r && oe ? c : te.right) : B.push(!r && oe ? h : te.left, !r && H ? c : Ae.right);
    }
    let X = T != null ? T : $.from, q = x != null ? x : $.to;
    for (let L of n.visibleRanges)
      if (L.to > X && L.from < q)
        for (let H = Math.max(L.from, X), be = Math.min(L.to, q); ; ) {
          let oe = n.state.doc.lineAt(H);
          for (let ce of n.bidiSpans(oe)) {
            let Ae = ce.from + oe.from, te = ce.to + oe.from;
            if (Ae >= be)
              break;
            te > H && D(Math.max(Ae, H), T == null && Ae <= X, Math.min(te, be), x == null && te >= q, ce.dir);
          }
          if (H = oe.to + 1, H >= be)
            break;
        }
    return B.length == 0 && D(X, T == null, q, x == null, n.textDirection), { top: R, bottom: A, horizontal: B };
  }
  function k(T, x) {
    let $ = o.top + (x ? T.top : T.bottom);
    return { top: $, bottom: $, horizontal: [] };
  }
}
function xd(n, e, t) {
  let i = n.coordsAtPos(e.head, e.assoc || 1);
  if (!i)
    return null;
  let r = Dh(n);
  return new Xh(i.left - r.left, i.top - r.top, -1, i.bottom - i.top, t ? "cm-cursor cm-cursor-primary" : "cm-cursor cm-cursor-secondary");
}
function ol(n, e, t, i, r) {
  e.lastIndex = 0;
  for (let s = n.iterRange(t, i), o = t, l; !s.next().done; o += s.value.length)
    if (!s.lineBreak)
      for (; l = e.exec(s.value); )
        r(o + l.index, l);
}
function $d(n, e) {
  let t = n.visibleRanges;
  if (t.length == 1 && t[0].from == n.viewport.from && t[0].to == n.viewport.to)
    return t;
  let i = [];
  for (let { from: r, to: s } of t)
    r = Math.max(n.state.doc.lineAt(r).from, r - e), s = Math.min(n.state.doc.lineAt(s).to, s + e), i.length && i[i.length - 1].to >= r ? i[i.length - 1].to = s : i.push({ from: r, to: s });
  return i;
}
class kd {
  constructor(e) {
    const { regexp: t, decoration: i, decorate: r, boundary: s, maxLength: o = 1e3 } = e;
    if (!t.global)
      throw new RangeError("The regular expression given to MatchDecorator should have its 'g' flag set");
    if (this.regexp = t, r)
      this.addMatch = (l, a, h, c) => r(c, h, h + l[0].length, l, a);
    else if (i) {
      let l = typeof i == "function" ? i : () => i;
      this.addMatch = (a, h, c, f) => f(c, c + a[0].length, l(a, h, c));
    } else
      throw new RangeError("Either 'decorate' or 'decoration' should be provided to MatchDecorator");
    this.boundary = s, this.maxLength = o;
  }
  createDeco(e) {
    let t = new pt(), i = t.add.bind(t);
    for (let { from: r, to: s } of $d(e, this.maxLength))
      ol(e.state.doc, this.regexp, r, s, (o, l) => this.addMatch(l, e, o, i));
    return t.finish();
  }
  updateDeco(e, t) {
    let i = 1e9, r = -1;
    return e.docChanged && e.changes.iterChanges((s, o, l, a) => {
      a > e.view.viewport.from && l < e.view.viewport.to && (i = Math.min(l, i), r = Math.max(a, r));
    }), e.viewportChanged || r - i > 1e3 ? this.createDeco(e.view) : r > -1 ? this.updateRange(e.view, t.map(e.changes), i, r) : t;
  }
  updateRange(e, t, i, r) {
    for (let s of e.visibleRanges) {
      let o = Math.max(s.from, i), l = Math.min(s.to, r);
      if (l > o) {
        let a = e.state.doc.lineAt(o), h = a.to < l ? e.state.doc.lineAt(l) : a, c = Math.max(s.from, a.from), f = Math.min(s.to, h.to);
        if (this.boundary) {
          for (; o > a.from; o--)
            if (this.boundary.test(a.text[o - 1 - a.from])) {
              c = o;
              break;
            }
          for (; l < h.to; l++)
            if (this.boundary.test(h.text[l - h.from])) {
              f = l;
              break;
            }
        }
        let u = [], d, O = (g, Q, b) => u.push(b.range(g, Q));
        if (a == h)
          for (this.regexp.lastIndex = c - a.from; (d = this.regexp.exec(a.text)) && d.index < f - a.from; )
            this.addMatch(d, e, d.index + a.from, O);
        else
          ol(e.state.doc, this.regexp, c, f, (g, Q) => this.addMatch(Q, e, g, O));
        t = t.update({ filterFrom: c, filterTo: f, filter: (g, Q) => g < c || Q > f, add: u });
      }
    }
    return t;
  }
}
const ps = /x/.unicode != null ? "gu" : "g", wd = /* @__PURE__ */ new RegExp(`[\0-\b
-\x7F-\x9F\xAD\u061C\u200B\u200E\u200F\u2028\u2029\u202D\u202E\u2066\u2067\u2069\uFEFF\uFFF9-\uFFFC]`, ps), Td = {
  0: "null",
  7: "bell",
  8: "backspace",
  10: "newline",
  11: "vertical tab",
  13: "carriage return",
  27: "escape",
  8203: "zero width space",
  8204: "zero width non-joiner",
  8205: "zero width joiner",
  8206: "left-to-right mark",
  8207: "right-to-left mark",
  8232: "line separator",
  8237: "left-to-right override",
  8238: "right-to-left override",
  8294: "left-to-right isolate",
  8295: "right-to-left isolate",
  8297: "pop directional isolate",
  8233: "paragraph separator",
  65279: "zero width no-break space",
  65532: "object replacement"
};
let gr = null;
function vd() {
  var n;
  if (gr == null && typeof document < "u" && document.body) {
    let e = document.body.style;
    gr = ((n = e.tabSize) !== null && n !== void 0 ? n : e.MozTabSize) != null;
  }
  return gr || !1;
}
const rn = /* @__PURE__ */ v.define({
  combine(n) {
    let e = yt(n, {
      render: null,
      specialChars: wd,
      addSpecialChars: null
    });
    return (e.replaceTabs = !vd()) && (e.specialChars = new RegExp("	|" + e.specialChars.source, ps)), e.addSpecialChars && (e.specialChars = new RegExp(e.specialChars.source + "|" + e.addSpecialChars.source, ps)), e;
  }
});
function Pd(n = {}) {
  return [rn.of(n), Rd()];
}
let ll = null;
function Rd() {
  return ll || (ll = he.fromClass(class {
    constructor(n) {
      this.view = n, this.decorations = C.none, this.decorationCache = /* @__PURE__ */ Object.create(null), this.decorator = this.makeDecorator(n.state.facet(rn)), this.decorations = this.decorator.createDeco(n);
    }
    makeDecorator(n) {
      return new kd({
        regexp: n.specialChars,
        decoration: (e, t, i) => {
          let { doc: r } = t.state, s = ne(e[0], 0);
          if (s == 9) {
            let o = r.lineAt(i), l = t.state.tabSize, a = _n(o.text, l, i - o.from);
            return C.replace({ widget: new Xd((l - a % l) * this.view.defaultCharacterWidth) });
          }
          return this.decorationCache[s] || (this.decorationCache[s] = C.replace({ widget: new Wd(n, s) }));
        },
        boundary: n.replaceTabs ? void 0 : /[^]/
      });
    }
    update(n) {
      let e = n.state.facet(rn);
      n.startState.facet(rn) != e ? (this.decorator = this.makeDecorator(e), this.decorations = this.decorator.createDeco(n.view)) : this.decorations = this.decorator.updateDeco(n, this.decorations);
    }
  }, {
    decorations: (n) => n.decorations
  }));
}
const Cd = "\u2022";
function Ad(n) {
  return n >= 32 ? Cd : n == 10 ? "\u2424" : String.fromCharCode(9216 + n);
}
class Wd extends St {
  constructor(e, t) {
    super(), this.options = e, this.code = t;
  }
  eq(e) {
    return e.code == this.code;
  }
  toDOM(e) {
    let t = Ad(this.code), i = e.state.phrase("Control character") + " " + (Td[this.code] || "0x" + this.code.toString(16)), r = this.options.render && this.options.render(this.code, i, t);
    if (r)
      return r;
    let s = document.createElement("span");
    return s.textContent = t, s.title = i, s.setAttribute("aria-label", i), s.className = "cm-specialChar", s;
  }
  ignoreEvent() {
    return !1;
  }
}
class Xd extends St {
  constructor(e) {
    super(), this.width = e;
  }
  eq(e) {
    return e.width == this.width;
  }
  toDOM() {
    let e = document.createElement("span");
    return e.textContent = "	", e.className = "cm-tab", e.style.width = this.width + "px", e;
  }
  ignoreEvent() {
    return !1;
  }
}
function Zd() {
  return Md;
}
const Dd = /* @__PURE__ */ C.line({ class: "cm-activeLine" }), Md = /* @__PURE__ */ he.fromClass(class {
  constructor(n) {
    this.decorations = this.getDeco(n);
  }
  update(n) {
    (n.docChanged || n.selectionSet) && (this.decorations = this.getDeco(n.view));
  }
  getDeco(n) {
    let e = -1, t = [];
    for (let i of n.state.selection.ranges) {
      if (!i.empty)
        return C.none;
      let r = n.lineBlockAt(i.head);
      r.from > e && (t.push(Dd.range(r.from)), e = r.from);
    }
    return C.set(t);
  }
}, {
  decorations: (n) => n.decorations
}), mr = "-10000px";
class jd {
  constructor(e, t, i) {
    this.facet = t, this.createTooltipView = i, this.input = e.state.facet(t), this.tooltips = this.input.filter((r) => r), this.tooltipViews = this.tooltips.map(i);
  }
  update(e) {
    let t = e.state.facet(this.facet), i = t.filter((s) => s);
    if (t === this.input) {
      for (let s of this.tooltipViews)
        s.update && s.update(e);
      return !1;
    }
    let r = [];
    for (let s = 0; s < i.length; s++) {
      let o = i[s], l = -1;
      if (!!o) {
        for (let a = 0; a < this.tooltips.length; a++) {
          let h = this.tooltips[a];
          h && h.create == o.create && (l = a);
        }
        if (l < 0)
          r[s] = this.createTooltipView(o);
        else {
          let a = r[s] = this.tooltipViews[l];
          a.update && a.update(e);
        }
      }
    }
    for (let s of this.tooltipViews)
      r.indexOf(s) < 0 && s.dom.remove();
    return this.input = t, this.tooltips = i, this.tooltipViews = r, !0;
  }
}
function zd() {
  return { top: 0, left: 0, bottom: innerHeight, right: innerWidth };
}
const Qr = /* @__PURE__ */ v.define({
  combine: (n) => {
    var e, t, i;
    return {
      position: w.ios ? "absolute" : ((e = n.find((r) => r.position)) === null || e === void 0 ? void 0 : e.position) || "fixed",
      parent: ((t = n.find((r) => r.parent)) === null || t === void 0 ? void 0 : t.parent) || null,
      tooltipSpace: ((i = n.find((r) => r.tooltipSpace)) === null || i === void 0 ? void 0 : i.tooltipSpace) || zd
    };
  }
}), Mh = /* @__PURE__ */ he.fromClass(class {
  constructor(n) {
    var e;
    this.view = n, this.inView = !0, this.lastTransaction = 0, this.measureTimeout = -1;
    let t = n.state.facet(Qr);
    this.position = t.position, this.parent = t.parent, this.classes = n.themeClasses, this.createContainer(), this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this }, this.manager = new jd(n, jh, (i) => this.createTooltip(i)), this.intersectionObserver = typeof IntersectionObserver == "function" ? new IntersectionObserver((i) => {
      Date.now() > this.lastTransaction - 50 && i.length > 0 && i[i.length - 1].intersectionRatio < 1 && this.measureSoon();
    }, { threshold: [1] }) : null, this.observeIntersection(), (e = n.dom.ownerDocument.defaultView) === null || e === void 0 || e.addEventListener("resize", this.measureSoon = this.measureSoon.bind(this)), this.maybeMeasure();
  }
  createContainer() {
    this.parent ? (this.container = document.createElement("div"), this.container.style.position = "relative", this.container.className = this.view.themeClasses, this.parent.appendChild(this.container)) : this.container = this.view.dom;
  }
  observeIntersection() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      for (let n of this.manager.tooltipViews)
        this.intersectionObserver.observe(n.dom);
    }
  }
  measureSoon() {
    this.measureTimeout < 0 && (this.measureTimeout = setTimeout(() => {
      this.measureTimeout = -1, this.maybeMeasure();
    }, 50));
  }
  update(n) {
    n.transactions.length && (this.lastTransaction = Date.now());
    let e = this.manager.update(n);
    e && this.observeIntersection();
    let t = e || n.geometryChanged, i = n.state.facet(Qr);
    if (i.position != this.position) {
      this.position = i.position;
      for (let r of this.manager.tooltipViews)
        r.dom.style.position = this.position;
      t = !0;
    }
    if (i.parent != this.parent) {
      this.parent && this.container.remove(), this.parent = i.parent, this.createContainer();
      for (let r of this.manager.tooltipViews)
        this.container.appendChild(r.dom);
      t = !0;
    } else
      this.parent && this.view.themeClasses != this.classes && (this.classes = this.container.className = this.view.themeClasses);
    t && this.maybeMeasure();
  }
  createTooltip(n) {
    let e = n.create(this.view);
    if (e.dom.classList.add("cm-tooltip"), n.arrow && !e.dom.querySelector(".cm-tooltip > .cm-tooltip-arrow")) {
      let t = document.createElement("div");
      t.className = "cm-tooltip-arrow", e.dom.appendChild(t);
    }
    return e.dom.style.position = this.position, e.dom.style.top = mr, this.container.appendChild(e.dom), e.mount && e.mount(this.view), e;
  }
  destroy() {
    var n, e;
    (n = this.view.dom.ownerDocument.defaultView) === null || n === void 0 || n.removeEventListener("resize", this.measureSoon);
    for (let { dom: t } of this.manager.tooltipViews)
      t.remove();
    (e = this.intersectionObserver) === null || e === void 0 || e.disconnect(), clearTimeout(this.measureTimeout);
  }
  readMeasure() {
    let n = this.view.dom.getBoundingClientRect();
    return {
      editor: n,
      parent: this.parent ? this.container.getBoundingClientRect() : n,
      pos: this.manager.tooltips.map((e, t) => {
        let i = this.manager.tooltipViews[t];
        return i.getCoords ? i.getCoords(e.pos) : this.view.coordsAtPos(e.pos);
      }),
      size: this.manager.tooltipViews.map(({ dom: e }) => e.getBoundingClientRect()),
      space: this.view.state.facet(Qr).tooltipSpace(this.view)
    };
  }
  writeMeasure(n) {
    let { editor: e, space: t } = n, i = [];
    for (let r = 0; r < this.manager.tooltips.length; r++) {
      let s = this.manager.tooltips[r], o = this.manager.tooltipViews[r], { dom: l } = o, a = n.pos[r], h = n.size[r];
      if (!a || a.bottom <= Math.max(e.top, t.top) || a.top >= Math.min(e.bottom, t.bottom) || a.right < Math.max(e.left, t.left) - 0.1 || a.left > Math.min(e.right, t.right) + 0.1) {
        l.style.top = mr;
        continue;
      }
      let c = s.arrow ? o.dom.querySelector(".cm-tooltip-arrow") : null, f = c ? 7 : 0, u = h.right - h.left, d = h.bottom - h.top, O = o.offset || Ed, g = this.view.textDirection == U.LTR, Q = h.width > t.right - t.left ? g ? t.left : t.right - h.width : g ? Math.min(a.left - (c ? 14 : 0) + O.x, t.right - u) : Math.max(t.left, a.left - u + (c ? 14 : 0) - O.x), b = !!s.above;
      !s.strictSide && (b ? a.top - (h.bottom - h.top) - O.y < t.top : a.bottom + (h.bottom - h.top) + O.y > t.bottom) && b == t.bottom - a.bottom > a.top - t.top && (b = !b);
      let k = b ? a.top - d - f - O.y : a.bottom + f + O.y, T = Q + u;
      if (o.overlap !== !0)
        for (let x of i)
          x.left < T && x.right > Q && x.top < k + d && x.bottom > k && (k = b ? x.top - d - 2 - f : x.bottom + f + 2);
      this.position == "absolute" ? (l.style.top = k - n.parent.top + "px", l.style.left = Q - n.parent.left + "px") : (l.style.top = k + "px", l.style.left = Q + "px"), c && (c.style.left = `${a.left + (g ? O.x : -O.x) - (Q + 14 - 7)}px`), o.overlap !== !0 && i.push({ left: Q, top: k, right: T, bottom: k + d }), l.classList.toggle("cm-tooltip-above", b), l.classList.toggle("cm-tooltip-below", !b), o.positioned && o.positioned();
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length && (this.view.inView && this.view.requestMeasure(this.measureReq), this.inView != this.view.inView && (this.inView = this.view.inView, !this.inView)))
      for (let n of this.manager.tooltipViews)
        n.dom.style.top = mr;
  }
}, {
  eventHandlers: {
    scroll() {
      this.maybeMeasure();
    }
  }
}), qd = /* @__PURE__ */ P.baseTheme({
  ".cm-tooltip": {
    zIndex: 100
  },
  "&light .cm-tooltip": {
    border: "1px solid #bbb",
    backgroundColor: "#f5f5f5"
  },
  "&light .cm-tooltip-section:not(:first-child)": {
    borderTop: "1px solid #bbb"
  },
  "&dark .cm-tooltip": {
    backgroundColor: "#333338",
    color: "white"
  },
  ".cm-tooltip-arrow": {
    height: `${7}px`,
    width: `${7 * 2}px`,
    position: "absolute",
    zIndex: -1,
    overflow: "hidden",
    "&:before, &:after": {
      content: "''",
      position: "absolute",
      width: 0,
      height: 0,
      borderLeft: `${7}px solid transparent`,
      borderRight: `${7}px solid transparent`
    },
    ".cm-tooltip-above &": {
      bottom: `-${7}px`,
      "&:before": {
        borderTop: `${7}px solid #bbb`
      },
      "&:after": {
        borderTop: `${7}px solid #f5f5f5`,
        bottom: "1px"
      }
    },
    ".cm-tooltip-below &": {
      top: `-${7}px`,
      "&:before": {
        borderBottom: `${7}px solid #bbb`
      },
      "&:after": {
        borderBottom: `${7}px solid #f5f5f5`,
        top: "1px"
      }
    }
  },
  "&dark .cm-tooltip .cm-tooltip-arrow": {
    "&:before": {
      borderTopColor: "#333338",
      borderBottomColor: "#333338"
    },
    "&:after": {
      borderTopColor: "transparent",
      borderBottomColor: "transparent"
    }
  }
}), Ed = { x: 0, y: 0 }, jh = /* @__PURE__ */ v.define({
  enables: [Mh, qd]
});
function _d(n, e) {
  let t = n.plugin(Mh);
  if (!t)
    return null;
  let i = t.manager.tooltips.indexOf(e);
  return i < 0 ? null : t.manager.tooltipViews[i];
}
const al = /* @__PURE__ */ v.define({
  combine(n) {
    let e, t;
    for (let i of n)
      e = e || i.topContainer, t = t || i.bottomContainer;
    return { topContainer: e, bottomContainer: t };
  }
});
function bn(n, e) {
  let t = n.plugin(zh), i = t ? t.specs.indexOf(e) : -1;
  return i > -1 ? t.panels[i] : null;
}
const zh = /* @__PURE__ */ he.fromClass(class {
  constructor(n) {
    this.input = n.state.facet(yn), this.specs = this.input.filter((t) => t), this.panels = this.specs.map((t) => t(n));
    let e = n.state.facet(al);
    this.top = new Gi(n, !0, e.topContainer), this.bottom = new Gi(n, !1, e.bottomContainer), this.top.sync(this.panels.filter((t) => t.top)), this.bottom.sync(this.panels.filter((t) => !t.top));
    for (let t of this.panels)
      t.dom.classList.add("cm-panel"), t.mount && t.mount();
  }
  update(n) {
    let e = n.state.facet(al);
    this.top.container != e.topContainer && (this.top.sync([]), this.top = new Gi(n.view, !0, e.topContainer)), this.bottom.container != e.bottomContainer && (this.bottom.sync([]), this.bottom = new Gi(n.view, !1, e.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let t = n.state.facet(yn);
    if (t != this.input) {
      let i = t.filter((a) => a), r = [], s = [], o = [], l = [];
      for (let a of i) {
        let h = this.specs.indexOf(a), c;
        h < 0 ? (c = a(n.view), l.push(c)) : (c = this.panels[h], c.update && c.update(n)), r.push(c), (c.top ? s : o).push(c);
      }
      this.specs = i, this.panels = r, this.top.sync(s), this.bottom.sync(o);
      for (let a of l)
        a.dom.classList.add("cm-panel"), a.mount && a.mount();
    } else
      for (let i of this.panels)
        i.update && i.update(n);
  }
  destroy() {
    this.top.sync([]), this.bottom.sync([]);
  }
}, {
  provide: (n) => P.scrollMargins.of((e) => {
    let t = e.plugin(n);
    return t && { top: t.top.scrollMargin(), bottom: t.bottom.scrollMargin() };
  })
});
class Gi {
  constructor(e, t, i) {
    this.view = e, this.top = t, this.container = i, this.dom = void 0, this.classes = "", this.panels = [], this.syncClasses();
  }
  sync(e) {
    for (let t of this.panels)
      t.destroy && e.indexOf(t) < 0 && t.destroy();
    this.panels = e, this.syncDOM();
  }
  syncDOM() {
    if (this.panels.length == 0) {
      this.dom && (this.dom.remove(), this.dom = void 0);
      return;
    }
    if (!this.dom) {
      this.dom = document.createElement("div"), this.dom.className = this.top ? "cm-panels cm-panels-top" : "cm-panels cm-panels-bottom", this.dom.style[this.top ? "top" : "bottom"] = "0";
      let t = this.container || this.view.dom;
      t.insertBefore(this.dom, this.top ? t.firstChild : null);
    }
    let e = this.dom.firstChild;
    for (let t of this.panels)
      if (t.dom.parentNode == this.dom) {
        for (; e != t.dom; )
          e = hl(e);
        e = e.nextSibling;
      } else
        this.dom.insertBefore(t.dom, e);
    for (; e; )
      e = hl(e);
  }
  scrollMargin() {
    return !this.dom || this.container ? 0 : Math.max(0, this.top ? this.dom.getBoundingClientRect().bottom - Math.max(0, this.view.scrollDOM.getBoundingClientRect().top) : Math.min(innerHeight, this.view.scrollDOM.getBoundingClientRect().bottom) - this.dom.getBoundingClientRect().top);
  }
  syncClasses() {
    if (!(!this.container || this.classes == this.view.themeClasses)) {
      for (let e of this.classes.split(" "))
        e && this.container.classList.remove(e);
      for (let e of (this.classes = this.view.themeClasses).split(" "))
        e && this.container.classList.add(e);
    }
  }
}
function hl(n) {
  let e = n.nextSibling;
  return n.remove(), e;
}
const yn = /* @__PURE__ */ v.define({
  enables: zh
});
class it extends vt {
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  eq(e) {
    return !1;
  }
  destroy(e) {
  }
}
it.prototype.elementClass = "";
it.prototype.toDOM = void 0;
it.prototype.mapMode = ae.TrackBefore;
it.prototype.startSide = it.prototype.endSide = -1;
it.prototype.point = !0;
const sn = /* @__PURE__ */ v.define(), Id = {
  class: "",
  renderEmptyElements: !1,
  elementStyle: "",
  markers: () => z.empty,
  lineMarker: () => null,
  lineMarkerChange: null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {}
}, pi = /* @__PURE__ */ v.define();
function Gd(n) {
  return [qh(), pi.of(Object.assign(Object.assign({}, Id), n))];
}
const gs = /* @__PURE__ */ v.define({
  combine: (n) => n.some((e) => e)
});
function qh(n) {
  let e = [
    Vd
  ];
  return n && n.fixed === !1 && e.push(gs.of(!0)), e;
}
const Vd = /* @__PURE__ */ he.fromClass(class {
  constructor(n) {
    this.view = n, this.prevViewport = n.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight + "px", this.gutters = n.state.facet(pi).map((e) => new fl(n, e));
    for (let e of this.gutters)
      this.dom.appendChild(e.dom);
    this.fixed = !n.state.facet(gs), this.fixed && (this.dom.style.position = "sticky"), this.syncGutters(!1), n.scrollDOM.insertBefore(this.dom, n.contentDOM);
  }
  update(n) {
    if (this.updateGutters(n)) {
      let e = this.prevViewport, t = n.view.viewport, i = Math.min(e.to, t.to) - Math.max(e.from, t.from);
      this.syncGutters(i < (t.to - t.from) * 0.8);
    }
    n.geometryChanged && (this.dom.style.minHeight = this.view.contentHeight + "px"), this.view.state.facet(gs) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : ""), this.prevViewport = n.view.viewport;
  }
  syncGutters(n) {
    let e = this.dom.nextSibling;
    n && this.dom.remove();
    let t = z.iter(this.view.state.facet(sn), this.view.viewport.from), i = [], r = this.gutters.map((s) => new Nd(s, this.view.viewport, -this.view.documentPadding.top));
    for (let s of this.view.viewportLineBlocks) {
      let o;
      if (Array.isArray(s.type)) {
        for (let l of s.type)
          if (l.type == E.Text) {
            o = l;
            break;
          }
      } else
        o = s.type == E.Text ? s : void 0;
      if (!!o) {
        i.length && (i = []), Eh(t, i, s.from);
        for (let l of r)
          l.line(this.view, o, i);
      }
    }
    for (let s of r)
      s.finish();
    n && this.view.scrollDOM.insertBefore(this.dom, e);
  }
  updateGutters(n) {
    let e = n.startState.facet(pi), t = n.state.facet(pi), i = n.docChanged || n.heightChanged || n.viewportChanged || !z.eq(n.startState.facet(sn), n.state.facet(sn), n.view.viewport.from, n.view.viewport.to);
    if (e == t)
      for (let r of this.gutters)
        r.update(n) && (i = !0);
    else {
      i = !0;
      let r = [];
      for (let s of t) {
        let o = e.indexOf(s);
        o < 0 ? r.push(new fl(this.view, s)) : (this.gutters[o].update(n), r.push(this.gutters[o]));
      }
      for (let s of this.gutters)
        s.dom.remove(), r.indexOf(s) < 0 && s.destroy();
      for (let s of r)
        this.dom.appendChild(s.dom);
      this.gutters = r;
    }
    return i;
  }
  destroy() {
    for (let n of this.gutters)
      n.destroy();
    this.dom.remove();
  }
}, {
  provide: (n) => P.scrollMargins.of((e) => {
    let t = e.plugin(n);
    return !t || t.gutters.length == 0 || !t.fixed ? null : e.textDirection == U.LTR ? { left: t.dom.offsetWidth } : { right: t.dom.offsetWidth };
  })
});
function cl(n) {
  return Array.isArray(n) ? n : [n];
}
function Eh(n, e, t) {
  for (; n.value && n.from <= t; )
    n.from == t && e.push(n.value), n.next();
}
class Nd {
  constructor(e, t, i) {
    this.gutter = e, this.height = i, this.localMarkers = [], this.i = 0, this.cursor = z.iter(e.markers, t.from);
  }
  line(e, t, i) {
    this.localMarkers.length && (this.localMarkers = []), Eh(this.cursor, this.localMarkers, t.from);
    let r = i.length ? this.localMarkers.concat(i) : this.localMarkers, s = this.gutter.config.lineMarker(e, t, r);
    s && r.unshift(s);
    let o = this.gutter;
    if (r.length == 0 && !o.config.renderEmptyElements)
      return;
    let l = t.top - this.height;
    if (this.i == o.elements.length) {
      let a = new _h(e, t.height, l, r);
      o.elements.push(a), o.dom.appendChild(a.dom);
    } else
      o.elements[this.i].update(e, t.height, l, r);
    this.height = t.bottom, this.i++;
  }
  finish() {
    let e = this.gutter;
    for (; e.elements.length > this.i; ) {
      let t = e.elements.pop();
      e.dom.removeChild(t.dom), t.destroy();
    }
  }
}
class fl {
  constructor(e, t) {
    this.view = e, this.config = t, this.elements = [], this.spacer = null, this.dom = document.createElement("div"), this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
    for (let i in t.domEventHandlers)
      this.dom.addEventListener(i, (r) => {
        let s = e.lineBlockAtHeight(r.clientY - e.documentTop);
        t.domEventHandlers[i](e, s, r) && r.preventDefault();
      });
    this.markers = cl(t.markers(e)), t.initialSpacer && (this.spacer = new _h(e, 0, 0, [t.initialSpacer(e)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(e) {
    let t = this.markers;
    if (this.markers = cl(this.config.markers(e.view)), this.spacer && this.config.updateSpacer) {
      let r = this.config.updateSpacer(this.spacer.markers[0], e);
      r != this.spacer.markers[0] && this.spacer.update(e.view, 0, 0, [r]);
    }
    let i = e.view.viewport;
    return !z.eq(this.markers, t, i.from, i.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(e) : !1);
  }
  destroy() {
    for (let e of this.elements)
      e.destroy();
  }
}
class _h {
  constructor(e, t, i, r) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(e, t, i, r);
  }
  update(e, t, i, r) {
    this.height != t && (this.dom.style.height = (this.height = t) + "px"), this.above != i && (this.dom.style.marginTop = (this.above = i) ? i + "px" : ""), Bd(this.markers, r) || this.setMarkers(e, r);
  }
  setMarkers(e, t) {
    let i = "cm-gutterElement", r = this.dom.firstChild;
    for (let s = 0, o = 0; ; ) {
      let l = o, a = s < t.length ? t[s++] : null, h = !1;
      if (a) {
        let c = a.elementClass;
        c && (i += " " + c);
        for (let f = o; f < this.markers.length; f++)
          if (this.markers[f].compare(a)) {
            l = f, h = !0;
            break;
          }
      } else
        l = this.markers.length;
      for (; o < l; ) {
        let c = this.markers[o++];
        if (c.toDOM) {
          c.destroy(r);
          let f = r.nextSibling;
          r.remove(), r = f;
        }
      }
      if (!a)
        break;
      a.toDOM && (h ? r = r.nextSibling : this.dom.insertBefore(a.toDOM(e), r)), h && o++;
    }
    this.dom.className = i, this.markers = t;
  }
  destroy() {
    this.setMarkers(null, []);
  }
}
function Bd(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++)
    if (!n[t].compare(e[t]))
      return !1;
  return !0;
}
const Ld = /* @__PURE__ */ v.define(), zt = /* @__PURE__ */ v.define({
  combine(n) {
    return yt(n, { formatNumber: String, domEventHandlers: {} }, {
      domEventHandlers(e, t) {
        let i = Object.assign({}, e);
        for (let r in t) {
          let s = i[r], o = t[r];
          i[r] = s ? (l, a, h) => s(l, a, h) || o(l, a, h) : o;
        }
        return i;
      }
    });
  }
});
class br extends it {
  constructor(e) {
    super(), this.number = e;
  }
  eq(e) {
    return this.number == e.number;
  }
  toDOM() {
    return document.createTextNode(this.number);
  }
}
function yr(n, e) {
  return n.state.facet(zt).formatNumber(e, n.state);
}
const Ud = /* @__PURE__ */ pi.compute([zt], (n) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(e) {
    return e.state.facet(Ld);
  },
  lineMarker(e, t, i) {
    return i.some((r) => r.toDOM) ? null : new br(yr(e, e.state.doc.lineAt(t.from).number));
  },
  lineMarkerChange: (e) => e.startState.facet(zt) != e.state.facet(zt),
  initialSpacer(e) {
    return new br(yr(e, ul(e.state.doc.lines)));
  },
  updateSpacer(e, t) {
    let i = yr(t.view, ul(t.view.state.doc.lines));
    return i == e.number ? e : new br(i);
  },
  domEventHandlers: n.facet(zt).domEventHandlers
}));
function Yd(n = {}) {
  return [
    zt.of(n),
    qh(),
    Ud
  ];
}
function ul(n) {
  let e = 9;
  for (; e < n; )
    e = e * 10 + 9;
  return e;
}
const Fd = /* @__PURE__ */ new class extends it {
  constructor() {
    super(...arguments), this.elementClass = "cm-activeLineGutter";
  }
}(), Hd = /* @__PURE__ */ sn.compute(["selection"], (n) => {
  let e = [], t = -1;
  for (let i of n.selection.ranges)
    if (i.empty) {
      let r = n.doc.lineAt(i.head).from;
      r > t && (t = r, e.push(Fd.range(r)));
    }
  return z.of(e);
});
function Jd() {
  return Hd;
}
const Ih = 1024;
let Kd = 0;
class ve {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
class W {
  constructor(e = {}) {
    this.id = Kd++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
      throw new Error("This node type doesn't define a deserialize function");
    });
  }
  add(e) {
    if (this.perNode)
      throw new RangeError("Can't add per-node props to node types");
    return typeof e != "function" && (e = de.match(e)), (t) => {
      let i = e(t);
      return i === void 0 ? null : [this, i];
    };
  }
}
W.closedBy = new W({ deserialize: (n) => n.split(" ") });
W.openedBy = new W({ deserialize: (n) => n.split(" ") });
W.group = new W({ deserialize: (n) => n.split(" ") });
W.contextHash = new W({ perNode: !0 });
W.lookAhead = new W({ perNode: !0 });
W.mounted = new W({ perNode: !0 });
class eO {
  constructor(e, t, i) {
    this.tree = e, this.overlay = t, this.parser = i;
  }
}
const tO = /* @__PURE__ */ Object.create(null);
class de {
  constructor(e, t, i, r = 0) {
    this.name = e, this.props = t, this.id = i, this.flags = r;
  }
  static define(e) {
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : tO, i = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), r = new de(e.name || "", t, e.id, i);
    if (e.props) {
      for (let s of e.props)
        if (Array.isArray(s) || (s = s(r)), s) {
          if (s[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          t[s[0].id] = s[1];
        }
    }
    return r;
  }
  prop(e) {
    return this.props[e.id];
  }
  get isTop() {
    return (this.flags & 1) > 0;
  }
  get isSkipped() {
    return (this.flags & 2) > 0;
  }
  get isError() {
    return (this.flags & 4) > 0;
  }
  get isAnonymous() {
    return (this.flags & 8) > 0;
  }
  is(e) {
    if (typeof e == "string") {
      if (this.name == e)
        return !0;
      let t = this.prop(W.group);
      return t ? t.indexOf(e) > -1 : !1;
    }
    return this.id == e;
  }
  static match(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let i in e)
      for (let r of i.split(" "))
        t[r] = e[i];
    return (i) => {
      for (let r = i.prop(W.group), s = -1; s < (r ? r.length : 0); s++) {
        let o = t[s < 0 ? i.name : r[s]];
        if (o)
          return o;
      }
    };
  }
}
de.none = new de("", /* @__PURE__ */ Object.create(null), 0, 8);
class Es {
  constructor(e) {
    this.types = e;
    for (let t = 0; t < e.length; t++)
      if (e[t].id != t)
        throw new RangeError("Node type ids should correspond to array positions when creating a node set");
  }
  extend(...e) {
    let t = [];
    for (let i of this.types) {
      let r = null;
      for (let s of e) {
        let o = s(i);
        o && (r || (r = Object.assign({}, i.props)), r[o[0].id] = o[1]);
      }
      t.push(r ? new de(i.name, r, i.id, i.flags) : i);
    }
    return new Es(t);
  }
}
const Vi = /* @__PURE__ */ new WeakMap(), dl = /* @__PURE__ */ new WeakMap();
var I;
(function(n) {
  n[n.ExcludeBuffers = 1] = "ExcludeBuffers", n[n.IncludeAnonymous = 2] = "IncludeAnonymous", n[n.IgnoreMounts = 4] = "IgnoreMounts", n[n.IgnoreOverlays = 8] = "IgnoreOverlays";
})(I || (I = {}));
class N {
  constructor(e, t, i, r, s) {
    if (this.type = e, this.children = t, this.positions = i, this.length = r, this.props = null, s && s.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [o, l] of s)
        this.props[typeof o == "number" ? o : o.id] = l;
    }
  }
  toString() {
    let e = this.prop(W.mounted);
    if (e && !e.overlay)
      return e.tree.toString();
    let t = "";
    for (let i of this.children) {
      let r = i.toString();
      r && (t && (t += ","), t += r);
    }
    return this.type.name ? (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (t.length ? "(" + t + ")" : "") : t;
  }
  cursor(e = 0) {
    return new ki(this.topNode, e);
  }
  cursorAt(e, t = 0, i = 0) {
    let r = Vi.get(this) || this.topNode, s = new ki(r);
    return s.moveTo(e, t), Vi.set(this, s._tree), s;
  }
  get topNode() {
    return new Re(this, 0, 0, null);
  }
  resolve(e, t = 0) {
    let i = Lt(Vi.get(this) || this.topNode, e, t, !1);
    return Vi.set(this, i), i;
  }
  resolveInner(e, t = 0) {
    let i = Lt(dl.get(this) || this.topNode, e, t, !0);
    return dl.set(this, i), i;
  }
  iterate(e) {
    let { enter: t, leave: i, from: r = 0, to: s = this.length } = e;
    for (let o = this.cursor((e.mode || 0) | I.IncludeAnonymous); ; ) {
      let l = !1;
      if (o.from <= s && o.to >= r && (o.type.isAnonymous || t(o) !== !1)) {
        if (o.firstChild())
          continue;
        l = !0;
      }
      for (; l && i && !o.type.isAnonymous && i(o), !o.nextSibling(); ) {
        if (!o.parent())
          return;
        l = !0;
      }
    }
  }
  prop(e) {
    return e.perNode ? this.props ? this.props[e.id] : void 0 : this.type.prop(e);
  }
  get propValues() {
    let e = [];
    if (this.props)
      for (let t in this.props)
        e.push([+t, this.props[t]]);
    return e;
  }
  balance(e = {}) {
    return this.children.length <= 8 ? this : Gs(de.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, i, r) => new N(this.type, t, i, r, this.propValues), e.makeTree || ((t, i, r) => new N(de.none, t, i, r)));
  }
  static build(e) {
    return nO(e);
  }
}
N.empty = new N(de.none, [], [], 0);
class _s {
  constructor(e, t) {
    this.buffer = e, this.index = t;
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  get pos() {
    return this.index;
  }
  next() {
    this.index -= 4;
  }
  fork() {
    return new _s(this.buffer, this.index);
  }
}
class Wt {
  constructor(e, t, i) {
    this.buffer = e, this.length = t, this.set = i;
  }
  get type() {
    return de.none;
  }
  toString() {
    let e = [];
    for (let t = 0; t < this.buffer.length; )
      e.push(this.childString(t)), t = this.buffer[t + 3];
    return e.join(",");
  }
  childString(e) {
    let t = this.buffer[e], i = this.buffer[e + 3], r = this.set.types[t], s = r.name;
    if (/\W/.test(s) && !r.isError && (s = JSON.stringify(s)), e += 4, i == e)
      return s;
    let o = [];
    for (; e < i; )
      o.push(this.childString(e)), e = this.buffer[e + 3];
    return s + "(" + o.join(",") + ")";
  }
  findChild(e, t, i, r, s) {
    let { buffer: o } = this, l = -1;
    for (let a = e; a != t && !(Gh(s, r, o[a + 1], o[a + 2]) && (l = a, i > 0)); a = o[a + 3])
      ;
    return l;
  }
  slice(e, t, i, r) {
    let s = this.buffer, o = new Uint16Array(t - e);
    for (let l = e, a = 0; l < t; )
      o[a++] = s[l++], o[a++] = s[l++] - i, o[a++] = s[l++] - i, o[a++] = s[l++] - e;
    return new Wt(o, r - i, this.set);
  }
}
function Gh(n, e, t, i) {
  switch (n) {
    case -2:
      return t < e;
    case -1:
      return i >= e && t < e;
    case 0:
      return t < e && i > e;
    case 1:
      return t <= e && i > e;
    case 2:
      return i > e;
    case 4:
      return !0;
  }
}
function Vh(n, e) {
  let t = n.childBefore(e);
  for (; t; ) {
    let i = t.lastChild;
    if (!i || i.to != t.to)
      break;
    i.type.isError && i.from == i.to ? (n = t, t = i.prevSibling) : t = i;
  }
  return n;
}
function Lt(n, e, t, i) {
  for (var r; n.from == n.to || (t < 1 ? n.from >= e : n.from > e) || (t > -1 ? n.to <= e : n.to < e); ) {
    let o = !i && n instanceof Re && n.index < 0 ? null : n.parent;
    if (!o)
      return n;
    n = o;
  }
  let s = i ? 0 : I.IgnoreOverlays;
  if (i)
    for (let o = n, l = o.parent; l; o = l, l = o.parent)
      o instanceof Re && o.index < 0 && ((r = l.enter(e, t, s)) === null || r === void 0 ? void 0 : r.from) != o.from && (n = l);
  for (; ; ) {
    let o = n.enter(e, t, s);
    if (!o)
      return n;
    n = o;
  }
}
class Re {
  constructor(e, t, i, r) {
    this._tree = e, this.from = t, this.index = i, this._parent = r;
  }
  get type() {
    return this._tree.type;
  }
  get name() {
    return this._tree.type.name;
  }
  get to() {
    return this.from + this._tree.length;
  }
  nextChild(e, t, i, r, s = 0) {
    for (let o = this; ; ) {
      for (let { children: l, positions: a } = o._tree, h = t > 0 ? l.length : -1; e != h; e += t) {
        let c = l[e], f = a[e] + o.from;
        if (!!Gh(r, i, f, f + c.length)) {
          if (c instanceof Wt) {
            if (s & I.ExcludeBuffers)
              continue;
            let u = c.findChild(0, c.buffer.length, t, i - f, r);
            if (u > -1)
              return new Ve(new iO(o, c, e, f), null, u);
          } else if (s & I.IncludeAnonymous || !c.type.isAnonymous || Is(c)) {
            let u;
            if (!(s & I.IgnoreMounts) && c.props && (u = c.prop(W.mounted)) && !u.overlay)
              return new Re(u.tree, f, e, o);
            let d = new Re(c, f, e, o);
            return s & I.IncludeAnonymous || !d.type.isAnonymous ? d : d.nextChild(t < 0 ? c.children.length - 1 : 0, t, i, r);
          }
        }
      }
      if (s & I.IncludeAnonymous || !o.type.isAnonymous || (o.index >= 0 ? e = o.index + t : e = t < 0 ? -1 : o._parent._tree.children.length, o = o._parent, !o))
        return null;
    }
  }
  get firstChild() {
    return this.nextChild(0, 1, 0, 4);
  }
  get lastChild() {
    return this.nextChild(this._tree.children.length - 1, -1, 0, 4);
  }
  childAfter(e) {
    return this.nextChild(0, 1, e, 2);
  }
  childBefore(e) {
    return this.nextChild(this._tree.children.length - 1, -1, e, -2);
  }
  enter(e, t, i = 0) {
    let r;
    if (!(i & I.IgnoreOverlays) && (r = this._tree.prop(W.mounted)) && r.overlay) {
      let s = e - this.from;
      for (let { from: o, to: l } of r.overlay)
        if ((t > 0 ? o <= s : o < s) && (t < 0 ? l >= s : l > s))
          return new Re(r.tree, r.overlay[0].from + this.from, -1, this);
    }
    return this.nextChild(0, 1, e, t, i);
  }
  nextSignificantParent() {
    let e = this;
    for (; e.type.isAnonymous && e._parent; )
      e = e._parent;
    return e;
  }
  get parent() {
    return this._parent ? this._parent.nextSignificantParent() : null;
  }
  get nextSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(this.index + 1, 1, 0, 4) : null;
  }
  get prevSibling() {
    return this._parent && this.index >= 0 ? this._parent.nextChild(this.index - 1, -1, 0, 4) : null;
  }
  cursor(e = 0) {
    return new ki(this, e);
  }
  get tree() {
    return this._tree;
  }
  toTree() {
    return this._tree;
  }
  resolve(e, t = 0) {
    return Lt(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return Lt(this, e, t, !0);
  }
  enterUnfinishedNodesBefore(e) {
    return Vh(this, e);
  }
  getChild(e, t = null, i = null) {
    let r = Sn(this, e, t, i);
    return r.length ? r[0] : null;
  }
  getChildren(e, t = null, i = null) {
    return Sn(this, e, t, i);
  }
  toString() {
    return this._tree.toString();
  }
  get node() {
    return this;
  }
  matchContext(e) {
    return xn(this, e);
  }
}
function Sn(n, e, t, i) {
  let r = n.cursor(), s = [];
  if (!r.firstChild())
    return s;
  if (t != null) {
    for (; !r.type.is(t); )
      if (!r.nextSibling())
        return s;
  }
  for (; ; ) {
    if (i != null && r.type.is(i))
      return s;
    if (r.type.is(e) && s.push(r.node), !r.nextSibling())
      return i == null ? s : [];
  }
}
function xn(n, e, t = e.length - 1) {
  for (let i = n.parent; t >= 0; i = i.parent) {
    if (!i)
      return !1;
    if (!i.type.isAnonymous) {
      if (e[t] && e[t] != i.name)
        return !1;
      t--;
    }
  }
  return !0;
}
class iO {
  constructor(e, t, i, r) {
    this.parent = e, this.buffer = t, this.index = i, this.start = r;
  }
}
class Ve {
  constructor(e, t, i) {
    this.context = e, this._parent = t, this.index = i, this.type = e.buffer.set.types[e.buffer.buffer[i]];
  }
  get name() {
    return this.type.name;
  }
  get from() {
    return this.context.start + this.context.buffer.buffer[this.index + 1];
  }
  get to() {
    return this.context.start + this.context.buffer.buffer[this.index + 2];
  }
  child(e, t, i) {
    let { buffer: r } = this.context, s = r.findChild(this.index + 4, r.buffer[this.index + 3], e, t - this.context.start, i);
    return s < 0 ? null : new Ve(this.context, this, s);
  }
  get firstChild() {
    return this.child(1, 0, 4);
  }
  get lastChild() {
    return this.child(-1, 0, 4);
  }
  childAfter(e) {
    return this.child(1, e, 2);
  }
  childBefore(e) {
    return this.child(-1, e, -2);
  }
  enter(e, t, i = 0) {
    if (i & I.ExcludeBuffers)
      return null;
    let { buffer: r } = this.context, s = r.findChild(this.index + 4, r.buffer[this.index + 3], t > 0 ? 1 : -1, e - this.context.start, t);
    return s < 0 ? null : new Ve(this.context, this, s);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(e) {
    return this._parent ? null : this.context.parent.nextChild(this.context.index + e, e, 0, 4);
  }
  get nextSibling() {
    let { buffer: e } = this.context, t = e.buffer[this.index + 3];
    return t < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length) ? new Ve(this.context, this._parent, t) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: e } = this.context, t = this._parent ? this._parent.index + 4 : 0;
    return this.index == t ? this.externalSibling(-1) : new Ve(this.context, this._parent, e.findChild(t, this.index, -1, 0, 4));
  }
  cursor(e = 0) {
    return new ki(this, e);
  }
  get tree() {
    return null;
  }
  toTree() {
    let e = [], t = [], { buffer: i } = this.context, r = this.index + 4, s = i.buffer[this.index + 3];
    if (s > r) {
      let o = i.buffer[this.index + 1], l = i.buffer[this.index + 2];
      e.push(i.slice(r, s, o, l)), t.push(0);
    }
    return new N(this.type, e, t, this.to - this.from);
  }
  resolve(e, t = 0) {
    return Lt(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return Lt(this, e, t, !0);
  }
  enterUnfinishedNodesBefore(e) {
    return Vh(this, e);
  }
  toString() {
    return this.context.buffer.childString(this.index);
  }
  getChild(e, t = null, i = null) {
    let r = Sn(this, e, t, i);
    return r.length ? r[0] : null;
  }
  getChildren(e, t = null, i = null) {
    return Sn(this, e, t, i);
  }
  get node() {
    return this;
  }
  matchContext(e) {
    return xn(this, e);
  }
}
class ki {
  constructor(e, t = 0) {
    if (this.mode = t, this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, e instanceof Re)
      this.yieldNode(e);
    else {
      this._tree = e.context.parent, this.buffer = e.context;
      for (let i = e._parent; i; i = i._parent)
        this.stack.unshift(i.index);
      this.bufferNode = e, this.yieldBuf(e.index);
    }
  }
  get name() {
    return this.type.name;
  }
  yieldNode(e) {
    return e ? (this._tree = e, this.type = e.type, this.from = e.from, this.to = e.to, !0) : !1;
  }
  yieldBuf(e, t) {
    this.index = e;
    let { start: i, buffer: r } = this.buffer;
    return this.type = t || r.set.types[r.buffer[e]], this.from = i + r.buffer[e + 1], this.to = i + r.buffer[e + 2], !0;
  }
  yield(e) {
    return e ? e instanceof Re ? (this.buffer = null, this.yieldNode(e)) : (this.buffer = e.context, this.yieldBuf(e.index, e.type)) : !1;
  }
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  enterChild(e, t, i) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(e < 0 ? this._tree._tree.children.length - 1 : 0, e, t, i, this.mode));
    let { buffer: r } = this.buffer, s = r.findChild(this.index + 4, r.buffer[this.index + 3], e, t - this.buffer.start, i);
    return s < 0 ? !1 : (this.stack.push(this.index), this.yieldBuf(s));
  }
  firstChild() {
    return this.enterChild(1, 0, 4);
  }
  lastChild() {
    return this.enterChild(-1, 0, 4);
  }
  childAfter(e) {
    return this.enterChild(1, e, 2);
  }
  childBefore(e) {
    return this.enterChild(-1, e, -2);
  }
  enter(e, t, i = this.mode) {
    return this.buffer ? i & I.ExcludeBuffers ? !1 : this.enterChild(1, e, t) : this.yield(this._tree.enter(e, t, i));
  }
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & I.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let e = this.mode & I.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    return this.buffer = null, this.yieldNode(e);
  }
  sibling(e) {
    if (!this.buffer)
      return this._tree._parent ? this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + e, e, 0, 4, this.mode)) : !1;
    let { buffer: t } = this.buffer, i = this.stack.length - 1;
    if (e < 0) {
      let r = i < 0 ? 0 : this.stack[i] + 4;
      if (this.index != r)
        return this.yieldBuf(t.findChild(r, this.index, -1, 0, 4));
    } else {
      let r = t.buffer[this.index + 3];
      if (r < (i < 0 ? t.buffer.length : t.buffer[this.stack[i] + 3]))
        return this.yieldBuf(r);
    }
    return i < 0 ? this.yield(this.buffer.parent.nextChild(this.buffer.index + e, e, 0, 4, this.mode)) : !1;
  }
  nextSibling() {
    return this.sibling(1);
  }
  prevSibling() {
    return this.sibling(-1);
  }
  atLastNode(e) {
    let t, i, { buffer: r } = this;
    if (r) {
      if (e > 0) {
        if (this.index < r.buffer.buffer.length)
          return !1;
      } else
        for (let s = 0; s < this.index; s++)
          if (r.buffer.buffer[s + 3] < this.index)
            return !1;
      ({ index: t, parent: i } = r);
    } else
      ({ index: t, _parent: i } = this._tree);
    for (; i; { index: t, _parent: i } = i)
      if (t > -1)
        for (let s = t + e, o = e < 0 ? -1 : i._tree.children.length; s != o; s += e) {
          let l = i._tree.children[s];
          if (this.mode & I.IncludeAnonymous || l instanceof Wt || !l.type.isAnonymous || Is(l))
            return !1;
        }
    return !0;
  }
  move(e, t) {
    if (t && this.enterChild(e, 0, 4))
      return !0;
    for (; ; ) {
      if (this.sibling(e))
        return !0;
      if (this.atLastNode(e) || !this.parent())
        return !1;
    }
  }
  next(e = !0) {
    return this.move(1, e);
  }
  prev(e = !0) {
    return this.move(-1, e);
  }
  moveTo(e, t = 0) {
    for (; (this.from == this.to || (t < 1 ? this.from >= e : this.from > e) || (t > -1 ? this.to <= e : this.to < e)) && this.parent(); )
      ;
    for (; this.enterChild(1, e, t); )
      ;
    return this;
  }
  get node() {
    if (!this.buffer)
      return this._tree;
    let e = this.bufferNode, t = null, i = 0;
    if (e && e.context == this.buffer) {
      e:
        for (let r = this.index, s = this.stack.length; s >= 0; ) {
          for (let o = e; o; o = o._parent)
            if (o.index == r) {
              if (r == this.index)
                return o;
              t = o, i = s + 1;
              break e;
            }
          r = this.stack[--s];
        }
    }
    for (let r = i; r < this.stack.length; r++)
      t = new Ve(this.buffer, t, this.stack[r]);
    return this.bufferNode = new Ve(this.buffer, t, this.index);
  }
  get tree() {
    return this.buffer ? null : this._tree._tree;
  }
  iterate(e, t) {
    for (let i = 0; ; ) {
      let r = !1;
      if (this.type.isAnonymous || e(this) !== !1) {
        if (this.firstChild()) {
          i++;
          continue;
        }
        this.type.isAnonymous || (r = !0);
      }
      for (; r && t && t(this), r = this.type.isAnonymous, !this.nextSibling(); ) {
        if (!i)
          return;
        this.parent(), i--, r = !0;
      }
    }
  }
  matchContext(e) {
    if (!this.buffer)
      return xn(this.node, e);
    let { buffer: t } = this.buffer, { types: i } = t.set;
    for (let r = e.length - 1, s = this.stack.length - 1; r >= 0; s--) {
      if (s < 0)
        return xn(this.node, e, r);
      let o = i[t.buffer[this.stack[s]]];
      if (!o.isAnonymous) {
        if (e[r] && e[r] != o.name)
          return !1;
        r--;
      }
    }
    return !0;
  }
}
function Is(n) {
  return n.children.some((e) => e instanceof Wt || !e.type.isAnonymous || Is(e));
}
function nO(n) {
  var e;
  let { buffer: t, nodeSet: i, maxBufferLength: r = Ih, reused: s = [], minRepeatType: o = i.types.length } = n, l = Array.isArray(t) ? new _s(t, t.length) : t, a = i.types, h = 0, c = 0;
  function f(x, $, R, A, B) {
    let { id: D, start: X, end: q, size: L } = l, H = c;
    for (; L < 0; )
      if (l.next(), L == -1) {
        let te = s[D];
        R.push(te), A.push(X - x);
        return;
      } else if (L == -3) {
        h = D;
        return;
      } else if (L == -4) {
        c = D;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${L}`);
    let be = a[D], oe, ce, Ae = X - x;
    if (q - X <= r && (ce = g(l.pos - $, B))) {
      let te = new Uint16Array(ce.size - ce.skip), We = l.pos - ce.size, Je = te.length;
      for (; l.pos > We; )
        Je = Q(ce.start, te, Je);
      oe = new Wt(te, q - ce.start, i), Ae = ce.start - x;
    } else {
      let te = l.pos - L;
      l.next();
      let We = [], Je = [], xt = D >= o ? D : -1, Xt = 0, Zi = q;
      for (; l.pos > te; )
        xt >= 0 && l.id == xt && l.size >= 0 ? (l.end <= Zi - r && (d(We, Je, X, Xt, l.end, Zi, xt, H), Xt = We.length, Zi = l.end), l.next()) : f(X, te, We, Je, xt);
      if (xt >= 0 && Xt > 0 && Xt < We.length && d(We, Je, X, Xt, X, Zi, xt, H), We.reverse(), Je.reverse(), xt > -1 && Xt > 0) {
        let ho = u(be);
        oe = Gs(be, We, Je, 0, We.length, 0, q - X, ho, ho);
      } else
        oe = O(be, We, Je, q - X, H - q);
    }
    R.push(oe), A.push(Ae);
  }
  function u(x) {
    return ($, R, A) => {
      let B = 0, D = $.length - 1, X, q;
      if (D >= 0 && (X = $[D]) instanceof N) {
        if (!D && X.type == x && X.length == A)
          return X;
        (q = X.prop(W.lookAhead)) && (B = R[D] + X.length + q);
      }
      return O(x, $, R, A, B);
    };
  }
  function d(x, $, R, A, B, D, X, q) {
    let L = [], H = [];
    for (; x.length > A; )
      L.push(x.pop()), H.push($.pop() + R - B);
    x.push(O(i.types[X], L, H, D - B, q - D)), $.push(B - R);
  }
  function O(x, $, R, A, B = 0, D) {
    if (h) {
      let X = [W.contextHash, h];
      D = D ? [X].concat(D) : [X];
    }
    if (B > 25) {
      let X = [W.lookAhead, B];
      D = D ? [X].concat(D) : [X];
    }
    return new N(x, $, R, A, D);
  }
  function g(x, $) {
    let R = l.fork(), A = 0, B = 0, D = 0, X = R.end - r, q = { size: 0, start: 0, skip: 0 };
    e:
      for (let L = R.pos - x; R.pos > L; ) {
        let H = R.size;
        if (R.id == $ && H >= 0) {
          q.size = A, q.start = B, q.skip = D, D += 4, A += 4, R.next();
          continue;
        }
        let be = R.pos - H;
        if (H < 0 || be < L || R.start < X)
          break;
        let oe = R.id >= o ? 4 : 0, ce = R.start;
        for (R.next(); R.pos > be; ) {
          if (R.size < 0)
            if (R.size == -3)
              oe += 4;
            else
              break e;
          else
            R.id >= o && (oe += 4);
          R.next();
        }
        B = ce, A += H, D += oe;
      }
    return ($ < 0 || A == x) && (q.size = A, q.start = B, q.skip = D), q.size > 4 ? q : void 0;
  }
  function Q(x, $, R) {
    let { id: A, start: B, end: D, size: X } = l;
    if (l.next(), X >= 0 && A < o) {
      let q = R;
      if (X > 4) {
        let L = l.pos - (X - 4);
        for (; l.pos > L; )
          R = Q(x, $, R);
      }
      $[--R] = q, $[--R] = D - x, $[--R] = B - x, $[--R] = A;
    } else
      X == -3 ? h = A : X == -4 && (c = A);
    return R;
  }
  let b = [], k = [];
  for (; l.pos > 0; )
    f(n.start || 0, n.bufferStart || 0, b, k, -1);
  let T = (e = n.length) !== null && e !== void 0 ? e : b.length ? k[0] + b[0].length : 0;
  return new N(a[n.topID], b.reverse(), k.reverse(), T);
}
const Ol = /* @__PURE__ */ new WeakMap();
function on(n, e) {
  if (!n.isAnonymous || e instanceof Wt || e.type != n)
    return 1;
  let t = Ol.get(e);
  if (t == null) {
    t = 1;
    for (let i of e.children) {
      if (i.type != n || !(i instanceof N)) {
        t = 1;
        break;
      }
      t += on(n, i);
    }
    Ol.set(e, t);
  }
  return t;
}
function Gs(n, e, t, i, r, s, o, l, a) {
  let h = 0;
  for (let O = i; O < r; O++)
    h += on(n, e[O]);
  let c = Math.ceil(h * 1.5 / 8), f = [], u = [];
  function d(O, g, Q, b, k) {
    for (let T = Q; T < b; ) {
      let x = T, $ = g[T], R = on(n, O[T]);
      for (T++; T < b; T++) {
        let A = on(n, O[T]);
        if (R + A >= c)
          break;
        R += A;
      }
      if (T == x + 1) {
        if (R > c) {
          let A = O[x];
          d(A.children, A.positions, 0, A.children.length, g[x] + k);
          continue;
        }
        f.push(O[x]);
      } else {
        let A = g[T - 1] + O[T - 1].length - $;
        f.push(Gs(n, O, g, x, T, $, A, null, a));
      }
      u.push($ + k - s);
    }
  }
  return d(e, t, i, r, 0), (l || a)(f, u, o);
}
class rO {
  constructor() {
    this.map = /* @__PURE__ */ new WeakMap();
  }
  setBuffer(e, t, i) {
    let r = this.map.get(e);
    r || this.map.set(e, r = /* @__PURE__ */ new Map()), r.set(t, i);
  }
  getBuffer(e, t) {
    let i = this.map.get(e);
    return i && i.get(t);
  }
  set(e, t) {
    e instanceof Ve ? this.setBuffer(e.context.buffer, e.index, t) : e instanceof Re && this.map.set(e.tree, t);
  }
  get(e) {
    return e instanceof Ve ? this.getBuffer(e.context.buffer, e.index) : e instanceof Re ? this.map.get(e.tree) : void 0;
  }
  cursorSet(e, t) {
    e.buffer ? this.setBuffer(e.buffer.buffer, e.index, t) : this.map.set(e.tree, t);
  }
  cursorGet(e) {
    return e.buffer ? this.getBuffer(e.buffer.buffer, e.index) : this.map.get(e.tree);
  }
}
class tt {
  constructor(e, t, i, r, s = !1, o = !1) {
    this.from = e, this.to = t, this.tree = i, this.offset = r, this.open = (s ? 1 : 0) | (o ? 2 : 0);
  }
  get openStart() {
    return (this.open & 1) > 0;
  }
  get openEnd() {
    return (this.open & 2) > 0;
  }
  static addTree(e, t = [], i = !1) {
    let r = [new tt(0, e.length, e, 0, !1, i)];
    for (let s of t)
      s.to > e.length && r.push(s);
    return r;
  }
  static applyChanges(e, t, i = 128) {
    if (!t.length)
      return e;
    let r = [], s = 1, o = e.length ? e[0] : null;
    for (let l = 0, a = 0, h = 0; ; l++) {
      let c = l < t.length ? t[l] : null, f = c ? c.fromA : 1e9;
      if (f - a >= i)
        for (; o && o.from < f; ) {
          let u = o;
          if (a >= u.from || f <= u.to || h) {
            let d = Math.max(u.from, a) - h, O = Math.min(u.to, f) - h;
            u = d >= O ? null : new tt(d, O, u.tree, u.offset + h, l > 0, !!c);
          }
          if (u && r.push(u), o.to > f)
            break;
          o = s < e.length ? e[s++] : null;
        }
      if (!c)
        break;
      a = c.toA, h = c.toA - c.toB;
    }
    return r;
  }
}
class Nh {
  startParse(e, t, i) {
    return typeof e == "string" && (e = new sO(e)), i = i ? i.length ? i.map((r) => new ve(r.from, r.to)) : [new ve(0, 0)] : [new ve(0, e.length)], this.createParse(e, t || [], i);
  }
  parse(e, t, i) {
    let r = this.startParse(e, t, i);
    for (; ; ) {
      let s = r.advance();
      if (s)
        return s;
    }
  }
}
class sO {
  constructor(e) {
    this.string = e;
  }
  get length() {
    return this.string.length;
  }
  chunk(e) {
    return this.string.slice(e);
  }
  get lineChunks() {
    return !1;
  }
  read(e, t) {
    return this.string.slice(e, t);
  }
}
function oO(n) {
  return (e, t, i, r) => new aO(e, n, t, i, r);
}
class pl {
  constructor(e, t, i, r, s) {
    this.parser = e, this.parse = t, this.overlay = i, this.target = r, this.ranges = s;
  }
}
class lO {
  constructor(e, t, i, r, s, o, l) {
    this.parser = e, this.predicate = t, this.mounts = i, this.index = r, this.start = s, this.target = o, this.prev = l, this.depth = 0, this.ranges = [];
  }
}
const ms = new W({ perNode: !0 });
class aO {
  constructor(e, t, i, r, s) {
    this.nest = t, this.input = i, this.fragments = r, this.ranges = s, this.inner = [], this.innerDone = 0, this.baseTree = null, this.stoppedAt = null, this.baseParse = e;
  }
  advance() {
    if (this.baseParse) {
      let i = this.baseParse.advance();
      if (!i)
        return null;
      if (this.baseParse = null, this.baseTree = i, this.startInner(), this.stoppedAt != null)
        for (let r of this.inner)
          r.parse.stopAt(this.stoppedAt);
    }
    if (this.innerDone == this.inner.length) {
      let i = this.baseTree;
      return this.stoppedAt != null && (i = new N(i.type, i.children, i.positions, i.length, i.propValues.concat([[ms, this.stoppedAt]]))), i;
    }
    let e = this.inner[this.innerDone], t = e.parse.advance();
    if (t) {
      this.innerDone++;
      let i = Object.assign(/* @__PURE__ */ Object.create(null), e.target.props);
      i[W.mounted.id] = new eO(t, e.overlay, e.parser), e.target.props = i;
    }
    return null;
  }
  get parsedPos() {
    if (this.baseParse)
      return 0;
    let e = this.input.length;
    for (let t = this.innerDone; t < this.inner.length; t++)
      this.inner[t].ranges[0].from < e && (e = Math.min(e, this.inner[t].parse.parsedPos));
    return e;
  }
  stopAt(e) {
    if (this.stoppedAt = e, this.baseParse)
      this.baseParse.stopAt(e);
    else
      for (let t = this.innerDone; t < this.inner.length; t++)
        this.inner[t].parse.stopAt(e);
  }
  startInner() {
    let e = new fO(this.fragments), t = null, i = null, r = new ki(new Re(this.baseTree, this.ranges[0].from, 0, null), I.IncludeAnonymous | I.IgnoreMounts);
    e:
      for (let s, o; this.stoppedAt == null || r.from < this.stoppedAt; ) {
        let l = !0, a;
        if (e.hasNode(r)) {
          if (t) {
            let h = t.mounts.find((c) => c.frag.from <= r.from && c.frag.to >= r.to && c.mount.overlay);
            if (h)
              for (let c of h.mount.overlay) {
                let f = c.from + h.pos, u = c.to + h.pos;
                f >= r.from && u <= r.to && !t.ranges.some((d) => d.from < u && d.to > f) && t.ranges.push({ from: f, to: u });
              }
          }
          l = !1;
        } else if (i && (o = hO(i.ranges, r.from, r.to)))
          l = o != 2;
        else if (!r.type.isAnonymous && r.from < r.to && (s = this.nest(r, this.input))) {
          r.tree || cO(r);
          let h = e.findMounts(r.from, s.parser);
          if (typeof s.overlay == "function")
            t = new lO(s.parser, s.overlay, h, this.inner.length, r.from, r.tree, t);
          else {
            let c = Ql(this.ranges, s.overlay || [new ve(r.from, r.to)]);
            c.length && this.inner.push(new pl(s.parser, s.parser.startParse(this.input, bl(h, c), c), s.overlay ? s.overlay.map((f) => new ve(f.from - r.from, f.to - r.from)) : null, r.tree, c)), s.overlay ? c.length && (i = { ranges: c, depth: 0, prev: i }) : l = !1;
          }
        } else
          t && (a = t.predicate(r)) && (a === !0 && (a = new ve(r.from, r.to)), a.from < a.to && t.ranges.push(a));
        if (l && r.firstChild())
          t && t.depth++, i && i.depth++;
        else
          for (; !r.nextSibling(); ) {
            if (!r.parent())
              break e;
            if (t && !--t.depth) {
              let h = Ql(this.ranges, t.ranges);
              h.length && this.inner.splice(t.index, 0, new pl(t.parser, t.parser.startParse(this.input, bl(t.mounts, h), h), t.ranges.map((c) => new ve(c.from - t.start, c.to - t.start)), t.target, h)), t = t.prev;
            }
            i && !--i.depth && (i = i.prev);
          }
      }
  }
}
function hO(n, e, t) {
  for (let i of n) {
    if (i.from >= t)
      break;
    if (i.to > e)
      return i.from <= e && i.to >= t ? 2 : 1;
  }
  return 0;
}
function gl(n, e, t, i, r, s) {
  if (e < t) {
    let o = n.buffer[e + 1], l = n.buffer[t - 2];
    i.push(n.slice(e, t, o, l)), r.push(o - s);
  }
}
function cO(n) {
  let { node: e } = n, t = 0;
  do
    n.parent(), t++;
  while (!n.tree);
  let i = 0, r = n.tree, s = 0;
  for (; s = r.positions[i] + n.from, !(s <= e.from && s + r.children[i].length >= e.to); i++)
    ;
  let o = r.children[i], l = o.buffer;
  function a(h, c, f, u, d) {
    let O = h;
    for (; l[O + 2] + s <= e.from; )
      O = l[O + 3];
    let g = [], Q = [];
    gl(o, h, O, g, Q, u);
    let b = l[O + 1], k = l[O + 2], T = b + s == e.from && k + s == e.to && l[O] == e.type.id;
    return g.push(T ? e.toTree() : a(O + 4, l[O + 3], o.set.types[l[O]], b, k - b)), Q.push(b - u), gl(o, l[O + 3], c, g, Q, u), new N(f, g, Q, d);
  }
  r.children[i] = a(0, l.length, de.none, 0, o.length);
  for (let h = 0; h <= t; h++)
    n.childAfter(e.from);
}
class ml {
  constructor(e, t) {
    this.offset = t, this.done = !1, this.cursor = e.cursor(I.IncludeAnonymous | I.IgnoreMounts);
  }
  moveTo(e) {
    let { cursor: t } = this, i = e - this.offset;
    for (; !this.done && t.from < i; )
      t.to >= e && t.enter(i, 1, I.IgnoreOverlays | I.ExcludeBuffers) || t.next(!1) || (this.done = !0);
  }
  hasNode(e) {
    if (this.moveTo(e.from), !this.done && this.cursor.from + this.offset == e.from && this.cursor.tree)
      for (let t = this.cursor.tree; ; ) {
        if (t == e.tree)
          return !0;
        if (t.children.length && t.positions[0] == 0 && t.children[0] instanceof N)
          t = t.children[0];
        else
          break;
      }
    return !1;
  }
}
class fO {
  constructor(e) {
    var t;
    if (this.fragments = e, this.curTo = 0, this.fragI = 0, e.length) {
      let i = this.curFrag = e[0];
      this.curTo = (t = i.tree.prop(ms)) !== null && t !== void 0 ? t : i.to, this.inner = new ml(i.tree, -i.offset);
    } else
      this.curFrag = this.inner = null;
  }
  hasNode(e) {
    for (; this.curFrag && e.from >= this.curTo; )
      this.nextFrag();
    return this.curFrag && this.curFrag.from <= e.from && this.curTo >= e.to && this.inner.hasNode(e);
  }
  nextFrag() {
    var e;
    if (this.fragI++, this.fragI == this.fragments.length)
      this.curFrag = this.inner = null;
    else {
      let t = this.curFrag = this.fragments[this.fragI];
      this.curTo = (e = t.tree.prop(ms)) !== null && e !== void 0 ? e : t.to, this.inner = new ml(t.tree, -t.offset);
    }
  }
  findMounts(e, t) {
    var i;
    let r = [];
    if (this.inner) {
      this.inner.cursor.moveTo(e, 1);
      for (let s = this.inner.cursor.node; s; s = s.parent) {
        let o = (i = s.tree) === null || i === void 0 ? void 0 : i.prop(W.mounted);
        if (o && o.parser == t)
          for (let l = this.fragI; l < this.fragments.length; l++) {
            let a = this.fragments[l];
            if (a.from >= s.to)
              break;
            a.tree == this.curFrag.tree && r.push({
              frag: a,
              pos: s.from - a.offset,
              mount: o
            });
          }
      }
    }
    return r;
  }
}
function Ql(n, e) {
  let t = null, i = e;
  for (let r = 1, s = 0; r < n.length; r++) {
    let o = n[r - 1].to, l = n[r].from;
    for (; s < i.length; s++) {
      let a = i[s];
      if (a.from >= l)
        break;
      a.to <= o || (t || (i = t = e.slice()), a.from < o ? (t[s] = new ve(a.from, o), a.to > l && t.splice(s + 1, 0, new ve(l, a.to))) : a.to > l ? t[s--] = new ve(l, a.to) : t.splice(s--, 1));
    }
  }
  return i;
}
function uO(n, e, t, i) {
  let r = 0, s = 0, o = !1, l = !1, a = -1e9, h = [];
  for (; ; ) {
    let c = r == n.length ? 1e9 : o ? n[r].to : n[r].from, f = s == e.length ? 1e9 : l ? e[s].to : e[s].from;
    if (o != l) {
      let u = Math.max(a, t), d = Math.min(c, f, i);
      u < d && h.push(new ve(u, d));
    }
    if (a = Math.min(c, f), a == 1e9)
      break;
    c == a && (o ? (o = !1, r++) : o = !0), f == a && (l ? (l = !1, s++) : l = !0);
  }
  return h;
}
function bl(n, e) {
  let t = [];
  for (let { pos: i, mount: r, frag: s } of n) {
    let o = i + (r.overlay ? r.overlay[0].from : 0), l = o + r.tree.length, a = Math.max(s.from, o), h = Math.min(s.to, l);
    if (r.overlay) {
      let c = r.overlay.map((u) => new ve(u.from + i, u.to + i)), f = uO(e, c, a, h);
      for (let u = 0, d = a; ; u++) {
        let O = u == f.length, g = O ? h : f[u].from;
        if (g > d && t.push(new tt(d, g, r.tree, -o, s.from >= d, s.to <= g)), O)
          break;
        d = f[u].to;
      }
    } else
      t.push(new tt(a, h, r.tree, -o, s.from >= o, s.to <= l));
  }
  return t;
}
let dO = 0;
class Ie {
  constructor(e, t, i) {
    this.set = e, this.base = t, this.modified = i, this.id = dO++;
  }
  static define(e) {
    if (e != null && e.base)
      throw new Error("Can not derive from a modified tag");
    let t = new Ie([], null, []);
    if (t.set.push(t), e)
      for (let i of e.set)
        t.set.push(i);
    return t;
  }
  static defineModifier() {
    let e = new $n();
    return (t) => t.modified.indexOf(e) > -1 ? t : $n.get(t.base || t, t.modified.concat(e).sort((i, r) => i.id - r.id));
  }
}
let OO = 0;
class $n {
  constructor() {
    this.instances = [], this.id = OO++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let i = t[0].instances.find((l) => l.base == e && pO(t, l.modified));
    if (i)
      return i;
    let r = [], s = new Ie(r, e, t);
    for (let l of t)
      l.instances.push(s);
    let o = Bh(t);
    for (let l of e.set)
      for (let a of o)
        r.push($n.get(l, a));
    return s;
  }
}
function pO(n, e) {
  return n.length == e.length && n.every((t, i) => t == e[i]);
}
function Bh(n) {
  let e = [n];
  for (let t = 0; t < n.length; t++)
    for (let i of Bh(n.slice(0, t).concat(n.slice(t + 1))))
      e.push(i);
  return e;
}
function Ln(n) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in n) {
    let i = n[t];
    Array.isArray(i) || (i = [i]);
    for (let r of t.split(" "))
      if (r) {
        let s = [], o = 2, l = r;
        for (let f = 0; ; ) {
          if (l == "..." && f > 0 && f + 3 == r.length) {
            o = 1;
            break;
          }
          let u = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(l);
          if (!u)
            throw new RangeError("Invalid path: " + r);
          if (s.push(u[0] == "*" ? "" : u[0][0] == '"' ? JSON.parse(u[0]) : u[0]), f += u[0].length, f == r.length)
            break;
          let d = r[f++];
          if (f == r.length && d == "!") {
            o = 0;
            break;
          }
          if (d != "/")
            throw new RangeError("Invalid path: " + r);
          l = r.slice(f);
        }
        let a = s.length - 1, h = s[a];
        if (!h)
          throw new RangeError("Invalid path: " + r);
        let c = new gO(i, o, a > 0 ? s.slice(0, a) : null);
        e[h] = c.sort(e[h]);
      }
  }
  return Lh.add(e);
}
const Lh = new W();
class gO {
  constructor(e, t, i, r) {
    this.tags = e, this.mode = t, this.context = i, this.next = r;
  }
  sort(e) {
    return !e || e.depth < this.depth ? (this.next = e, this) : (e.next = this.sort(e.next), e);
  }
  get depth() {
    return this.context ? this.context.length : 0;
  }
}
function Uh(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let s of n)
    if (!Array.isArray(s.tag))
      t[s.tag.id] = s.class;
    else
      for (let o of s.tag)
        t[o.id] = s.class;
  let { scope: i, all: r = null } = e || {};
  return {
    style: (s) => {
      let o = r;
      for (let l of s)
        for (let a of l.set) {
          let h = t[a.id];
          if (h) {
            o = o ? o + " " + h : h;
            break;
          }
        }
      return o;
    },
    scope: i
  };
}
function mO(n, e) {
  let t = null;
  for (let i of n) {
    let r = i.style(e);
    r && (t = t ? t + " " + r : r);
  }
  return t;
}
function QO(n, e, t, i = 0, r = n.length) {
  let s = new bO(i, Array.isArray(e) ? e : [e], t);
  s.highlightRange(n.cursor(), i, r, "", s.highlighters), s.flush(r);
}
class bO {
  constructor(e, t, i) {
    this.at = e, this.highlighters = t, this.span = i, this.class = "";
  }
  startSpan(e, t) {
    t != this.class && (this.flush(e), e > this.at && (this.at = e), this.class = t);
  }
  flush(e) {
    e > this.at && this.class && this.span(this.at, e, this.class);
  }
  highlightRange(e, t, i, r, s) {
    let { type: o, from: l, to: a } = e;
    if (l >= i || a <= t)
      return;
    o.isTop && (s = this.highlighters.filter((d) => !d.scope || d.scope(o)));
    let h = r, c = o.prop(Lh), f = !1;
    for (; c; ) {
      if (!c.context || e.matchContext(c.context)) {
        let d = mO(s, c.tags);
        d && (h && (h += " "), h += d, c.mode == 1 ? r += (r ? " " : "") + d : c.mode == 0 && (f = !0));
        break;
      }
      c = c.next;
    }
    if (this.startSpan(e.from, h), f)
      return;
    let u = e.tree && e.tree.prop(W.mounted);
    if (u && u.overlay) {
      let d = e.node.enter(u.overlay[0].from + l, 1), O = this.highlighters.filter((Q) => !Q.scope || Q.scope(u.tree.type)), g = e.firstChild();
      for (let Q = 0, b = l; ; Q++) {
        let k = Q < u.overlay.length ? u.overlay[Q] : null, T = k ? k.from + l : a, x = Math.max(t, b), $ = Math.min(i, T);
        if (x < $ && g)
          for (; e.from < $ && (this.highlightRange(e, x, $, r, s), this.startSpan(Math.min(i, e.to), h), !(e.to >= T || !e.nextSibling())); )
            ;
        if (!k || T > i)
          break;
        b = k.to + l, b > t && (this.highlightRange(d.cursor(), Math.max(t, k.from + l), Math.min(i, b), r, O), this.startSpan(b, h));
      }
      g && e.parent();
    } else if (e.firstChild()) {
      do
        if (!(e.to <= t)) {
          if (e.from >= i)
            break;
          this.highlightRange(e, t, i, r, s), this.startSpan(Math.min(i, e.to), h);
        }
      while (e.nextSibling());
      e.parent();
    }
  }
}
const y = Ie.define, Ni = y(), st = y(), yl = y(st), Sl = y(st), ot = y(), Bi = y(ot), Sr = y(ot), _e = y(), $t = y(_e), qe = y(), Ee = y(), Qs = y(), ni = y(Qs), Li = y(), p = {
  comment: Ni,
  lineComment: y(Ni),
  blockComment: y(Ni),
  docComment: y(Ni),
  name: st,
  variableName: y(st),
  typeName: yl,
  tagName: y(yl),
  propertyName: Sl,
  attributeName: y(Sl),
  className: y(st),
  labelName: y(st),
  namespace: y(st),
  macroName: y(st),
  literal: ot,
  string: Bi,
  docString: y(Bi),
  character: y(Bi),
  attributeValue: y(Bi),
  number: Sr,
  integer: y(Sr),
  float: y(Sr),
  bool: y(ot),
  regexp: y(ot),
  escape: y(ot),
  color: y(ot),
  url: y(ot),
  keyword: qe,
  self: y(qe),
  null: y(qe),
  atom: y(qe),
  unit: y(qe),
  modifier: y(qe),
  operatorKeyword: y(qe),
  controlKeyword: y(qe),
  definitionKeyword: y(qe),
  moduleKeyword: y(qe),
  operator: Ee,
  derefOperator: y(Ee),
  arithmeticOperator: y(Ee),
  logicOperator: y(Ee),
  bitwiseOperator: y(Ee),
  compareOperator: y(Ee),
  updateOperator: y(Ee),
  definitionOperator: y(Ee),
  typeOperator: y(Ee),
  controlOperator: y(Ee),
  punctuation: Qs,
  separator: y(Qs),
  bracket: ni,
  angleBracket: y(ni),
  squareBracket: y(ni),
  paren: y(ni),
  brace: y(ni),
  content: _e,
  heading: $t,
  heading1: y($t),
  heading2: y($t),
  heading3: y($t),
  heading4: y($t),
  heading5: y($t),
  heading6: y($t),
  contentSeparator: y(_e),
  list: y(_e),
  quote: y(_e),
  emphasis: y(_e),
  strong: y(_e),
  link: y(_e),
  monospace: y(_e),
  strikethrough: y(_e),
  inserted: y(),
  deleted: y(),
  changed: y(),
  invalid: y(),
  meta: Li,
  documentMeta: y(Li),
  annotation: y(Li),
  processingInstruction: y(Li),
  definition: Ie.defineModifier(),
  constant: Ie.defineModifier(),
  function: Ie.defineModifier(),
  standard: Ie.defineModifier(),
  local: Ie.defineModifier(),
  special: Ie.defineModifier()
};
Uh([
  { tag: p.link, class: "tok-link" },
  { tag: p.heading, class: "tok-heading" },
  { tag: p.emphasis, class: "tok-emphasis" },
  { tag: p.strong, class: "tok-strong" },
  { tag: p.keyword, class: "tok-keyword" },
  { tag: p.atom, class: "tok-atom" },
  { tag: p.bool, class: "tok-bool" },
  { tag: p.url, class: "tok-url" },
  { tag: p.labelName, class: "tok-labelName" },
  { tag: p.inserted, class: "tok-inserted" },
  { tag: p.deleted, class: "tok-deleted" },
  { tag: p.literal, class: "tok-literal" },
  { tag: p.string, class: "tok-string" },
  { tag: p.number, class: "tok-number" },
  { tag: [p.regexp, p.escape, p.special(p.string)], class: "tok-string2" },
  { tag: p.variableName, class: "tok-variableName" },
  { tag: p.local(p.variableName), class: "tok-variableName tok-local" },
  { tag: p.definition(p.variableName), class: "tok-variableName tok-definition" },
  { tag: p.special(p.variableName), class: "tok-variableName2" },
  { tag: p.definition(p.propertyName), class: "tok-propertyName tok-definition" },
  { tag: p.typeName, class: "tok-typeName" },
  { tag: p.namespace, class: "tok-namespace" },
  { tag: p.className, class: "tok-className" },
  { tag: p.macroName, class: "tok-macroName" },
  { tag: p.propertyName, class: "tok-propertyName" },
  { tag: p.operator, class: "tok-operator" },
  { tag: p.comment, class: "tok-comment" },
  { tag: p.meta, class: "tok-meta" },
  { tag: p.invalid, class: "tok-invalid" },
  { tag: p.punctuation, class: "tok-punctuation" }
]);
var xr;
const wi = /* @__PURE__ */ new W();
function yO(n) {
  return v.define({
    combine: n ? (e) => e.concat(n) : void 0
  });
}
class De {
  constructor(e, t, i = []) {
    this.data = e, M.prototype.hasOwnProperty("tree") || Object.defineProperty(M.prototype, "tree", { get() {
      return Y(this);
    } }), this.parser = t, this.extension = [
      bt.of(this),
      M.languageData.of((r, s, o) => r.facet(xl(r, s, o)))
    ].concat(i);
  }
  isActiveAt(e, t, i = -1) {
    return xl(e, t, i) == this.data;
  }
  findRegions(e) {
    let t = e.facet(bt);
    if ((t == null ? void 0 : t.data) == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let i = [], r = (s, o) => {
      if (s.prop(wi) == this.data) {
        i.push({ from: o, to: o + s.length });
        return;
      }
      let l = s.prop(W.mounted);
      if (l) {
        if (l.tree.prop(wi) == this.data) {
          if (l.overlay)
            for (let a of l.overlay)
              i.push({ from: a.from + o, to: a.to + o });
          else
            i.push({ from: o, to: o + s.length });
          return;
        } else if (l.overlay) {
          let a = i.length;
          if (r(l.tree, l.overlay[0].from + o), i.length > a)
            return;
        }
      }
      for (let a = 0; a < s.children.length; a++) {
        let h = s.children[a];
        h instanceof N && r(h, s.positions[a] + o);
      }
    };
    return r(Y(e), 0), i;
  }
  get allowsNesting() {
    return !0;
  }
}
De.setState = /* @__PURE__ */ Z.define();
function xl(n, e, t) {
  let i = n.facet(bt);
  if (!i)
    return null;
  let r = i.data;
  if (i.allowsNesting)
    for (let s = Y(n).topNode; s; s = s.enter(e, t, I.ExcludeBuffers))
      r = s.type.prop(wi) || r;
  return r;
}
class Ut extends De {
  constructor(e, t) {
    super(e, t), this.parser = t;
  }
  static define(e) {
    let t = yO(e.languageData);
    return new Ut(t, e.parser.configure({
      props: [wi.add((i) => i.isTop ? t : void 0)]
    }));
  }
  configure(e) {
    return new Ut(this.data, this.parser.configure(e));
  }
  get allowsNesting() {
    return this.parser.hasWrappers();
  }
}
function Y(n) {
  let e = n.field(De.state, !1);
  return e ? e.tree : N.empty;
}
class SO {
  constructor(e, t = e.length) {
    this.doc = e, this.length = t, this.cursorPos = 0, this.string = "", this.cursor = e.iter();
  }
  syncTo(e) {
    return this.string = this.cursor.next(e - this.cursorPos).value, this.cursorPos = e + this.string.length, this.cursorPos - this.string.length;
  }
  chunk(e) {
    return this.syncTo(e), this.string;
  }
  get lineChunks() {
    return !0;
  }
  read(e, t) {
    let i = this.cursorPos - this.string.length;
    return e < i || t >= this.cursorPos ? this.doc.sliceString(e, t) : this.string.slice(e - i, t - i);
  }
}
let ri = null;
class kn {
  constructor(e, t, i = [], r, s, o, l, a) {
    this.parser = e, this.state = t, this.fragments = i, this.tree = r, this.treeLen = s, this.viewport = o, this.skipped = l, this.scheduleOn = a, this.parse = null, this.tempSkipped = [];
  }
  static create(e, t, i) {
    return new kn(e, t, [], N.empty, 0, i, [], null);
  }
  startParse() {
    return this.parser.startParse(new SO(this.state.doc), this.fragments);
  }
  work(e, t) {
    return t != null && t >= this.state.doc.length && (t = void 0), this.tree != N.empty && this.isDone(t != null ? t : this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
      var i;
      if (typeof e == "number") {
        let r = Date.now() + e;
        e = () => Date.now() > r;
      }
      for (this.parse || (this.parse = this.startParse()), t != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > t) && t < this.state.doc.length && this.parse.stopAt(t); ; ) {
        let r = this.parse.advance();
        if (r)
          if (this.fragments = this.withoutTempSkipped(tt.addTree(r, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (i = this.parse.stoppedAt) !== null && i !== void 0 ? i : this.state.doc.length, this.tree = r, this.parse = null, this.treeLen < (t != null ? t : this.state.doc.length))
            this.parse = this.startParse();
          else
            return !0;
        if (e())
          return !1;
      }
    });
  }
  takeTree() {
    let e, t;
    this.parse && (e = this.parse.parsedPos) >= this.treeLen && ((this.parse.stoppedAt == null || this.parse.stoppedAt > e) && this.parse.stopAt(e), this.withContext(() => {
      for (; !(t = this.parse.advance()); )
        ;
    }), this.treeLen = e, this.tree = t, this.fragments = this.withoutTempSkipped(tt.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(e) {
    let t = ri;
    ri = this;
    try {
      return e();
    } finally {
      ri = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = $l(e, t.from, t.to);
    return e;
  }
  changes(e, t) {
    let { fragments: i, tree: r, treeLen: s, viewport: o, skipped: l } = this;
    if (this.takeTree(), !e.empty) {
      let a = [];
      if (e.iterChangedRanges((h, c, f, u) => a.push({ fromA: h, toA: c, fromB: f, toB: u })), i = tt.applyChanges(i, a), r = N.empty, s = 0, o = { from: e.mapPos(o.from, -1), to: e.mapPos(o.to, 1) }, this.skipped.length) {
        l = [];
        for (let h of this.skipped) {
          let c = e.mapPos(h.from, 1), f = e.mapPos(h.to, -1);
          c < f && l.push({ from: c, to: f });
        }
      }
    }
    return new kn(this.parser, t, i, r, s, o, l, this.scheduleOn);
  }
  updateViewport(e) {
    if (this.viewport.from == e.from && this.viewport.to == e.to)
      return !1;
    this.viewport = e;
    let t = this.skipped.length;
    for (let i = 0; i < this.skipped.length; i++) {
      let { from: r, to: s } = this.skipped[i];
      r < e.to && s > e.from && (this.fragments = $l(this.fragments, r, s), this.skipped.splice(i--, 1));
    }
    return this.skipped.length >= t ? !1 : (this.reset(), !0);
  }
  reset() {
    this.parse && (this.takeTree(), this.parse = null);
  }
  skipUntilInView(e, t) {
    this.skipped.push({ from: e, to: t });
  }
  static getSkippingParser(e) {
    return new class extends Nh {
      createParse(t, i, r) {
        let s = r[0].from, o = r[r.length - 1].to;
        return {
          parsedPos: s,
          advance() {
            let a = ri;
            if (a) {
              for (let h of r)
                a.tempSkipped.push(h);
              e && (a.scheduleOn = a.scheduleOn ? Promise.all([a.scheduleOn, e]) : e);
            }
            return this.parsedPos = o, new N(de.none, [], [], o - s);
          },
          stoppedAt: null,
          stopAt() {
          }
        };
      }
    }();
  }
  isDone(e) {
    e = Math.min(e, this.state.doc.length);
    let t = this.fragments;
    return this.treeLen >= e && t.length && t[0].from == 0 && t[0].to >= e;
  }
  static get() {
    return ri;
  }
}
function $l(n, e, t) {
  return tt.applyChanges(n, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class Yt {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), i = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, i) || t.takeTree(), new Yt(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), i = kn.create(e.facet(bt).parser, e, { from: 0, to: t });
    return i.work(20, t) || i.takeTree(), new Yt(i);
  }
}
De.state = /* @__PURE__ */ Oe.define({
  create: Yt.init,
  update(n, e) {
    for (let t of e.effects)
      if (t.is(De.setState))
        return t.value;
    return e.startState.facet(bt) != e.state.facet(bt) ? Yt.init(e.state) : n.apply(e);
  }
});
let Yh = (n) => {
  let e = setTimeout(() => n(), 500);
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (Yh = (n) => {
  let e = -1, t = setTimeout(() => {
    e = requestIdleCallback(n, { timeout: 500 - 100 });
  }, 100);
  return () => e < 0 ? clearTimeout(t) : cancelIdleCallback(e);
});
const $r = typeof navigator < "u" && ((xr = navigator.scheduling) === null || xr === void 0 ? void 0 : xr.isInputPending) ? () => navigator.scheduling.isInputPending() : null, xO = /* @__PURE__ */ he.fromClass(class {
  constructor(e) {
    this.view = e, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(e) {
    let t = this.view.state.field(De.state).context;
    (t.updateViewport(e.view.viewport) || this.view.viewport.to > t.treeLen) && this.scheduleWork(), e.docChanged && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(t);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: e } = this.view, t = e.field(De.state);
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = Yh(this.work));
  }
  work(e) {
    this.working = null;
    let t = Date.now();
    if (this.chunkEnd < t && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = t + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: i, viewport: { to: r } } = this.view, s = i.field(De.state);
    if (s.tree == s.context.tree && s.context.isDone(r + 1e5))
      return;
    let o = Date.now() + Math.min(this.chunkBudget, 100, e && !$r ? Math.max(25, e.timeRemaining() - 5) : 1e9), l = s.context.treeLen < r && i.doc.length > r + 1e3, a = s.context.work(() => $r && $r() || Date.now() > o, r + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (a || this.chunkBudget <= 0) && (s.context.takeTree(), this.view.dispatch({ effects: De.setState.of(new Yt(s.context)) })), this.chunkBudget > 0 && !(a && !l) && this.scheduleWork(), this.checkAsyncSchedule(s.context);
  }
  checkAsyncSchedule(e) {
    e.scheduleOn && (this.workScheduled++, e.scheduleOn.then(() => this.scheduleWork()).catch((t) => Me(this.view.state, t)).then(() => this.workScheduled--), e.scheduleOn = null);
  }
  destroy() {
    this.working && this.working();
  }
  isWorking() {
    return !!(this.working || this.workScheduled > 0);
  }
}, {
  eventHandlers: { focus() {
    this.scheduleWork();
  } }
}), bt = /* @__PURE__ */ v.define({
  combine(n) {
    return n.length ? n[0] : null;
  },
  enables: [De.state, xO]
});
class Vs {
  constructor(e, t = []) {
    this.language = e, this.support = t, this.extension = [e, t];
  }
}
const $O = /* @__PURE__ */ v.define(), Ci = /* @__PURE__ */ v.define({
  combine: (n) => {
    if (!n.length)
      return "  ";
    if (!/^(?: +|\t+)$/.test(n[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(n[0]));
    return n[0];
  }
});
function wn(n) {
  let e = n.facet(Ci);
  return e.charCodeAt(0) == 9 ? n.tabSize * e.length : e.length;
}
function Ti(n, e) {
  let t = "", i = n.tabSize;
  if (n.facet(Ci).charCodeAt(0) == 9)
    for (; e >= i; )
      t += "	", e -= i;
  for (let r = 0; r < e; r++)
    t += " ";
  return t;
}
function Ns(n, e) {
  n instanceof M && (n = new Un(n));
  for (let i of n.state.facet($O)) {
    let r = i(n, e);
    if (r != null)
      return r;
  }
  let t = Y(n.state);
  return t ? kO(n, t, e) : null;
}
class Un {
  constructor(e, t = {}) {
    this.state = e, this.options = t, this.unit = wn(e);
  }
  lineAt(e, t = 1) {
    let i = this.state.doc.lineAt(e), { simulateBreak: r, simulateDoubleBreak: s } = this.options;
    return r != null && r >= i.from && r <= i.to ? s && r == e ? { text: "", from: e } : (t < 0 ? r < e : r <= e) ? { text: i.text.slice(r - i.from), from: r } : { text: i.text.slice(0, r - i.from), from: i.from } : i;
  }
  textAfterPos(e, t = 1) {
    if (this.options.simulateDoubleBreak && e == this.options.simulateBreak)
      return "";
    let { text: i, from: r } = this.lineAt(e, t);
    return i.slice(e - r, Math.min(i.length, e + 100 - r));
  }
  column(e, t = 1) {
    let { text: i, from: r } = this.lineAt(e, t), s = this.countColumn(i, e - r), o = this.options.overrideIndentation ? this.options.overrideIndentation(r) : -1;
    return o > -1 && (s += o - this.countColumn(i, i.search(/\S|$/))), s;
  }
  countColumn(e, t = e.length) {
    return _n(e, this.state.tabSize, t);
  }
  lineIndent(e, t = 1) {
    let { text: i, from: r } = this.lineAt(e, t), s = this.options.overrideIndentation;
    if (s) {
      let o = s(r);
      if (o > -1)
        return o;
    }
    return this.countColumn(i, i.search(/\S|$/));
  }
  get simulatedBreak() {
    return this.options.simulateBreak || null;
  }
}
const Yn = /* @__PURE__ */ new W();
function kO(n, e, t) {
  return Fh(e.resolveInner(t).enterUnfinishedNodesBefore(t), t, n);
}
function wO(n) {
  return n.pos == n.options.simulateBreak && n.options.simulateDoubleBreak;
}
function TO(n) {
  let e = n.type.prop(Yn);
  if (e)
    return e;
  let t = n.firstChild, i;
  if (t && (i = t.type.prop(W.closedBy))) {
    let r = n.lastChild, s = r && i.indexOf(r.name) > -1;
    return (o) => Hh(o, !0, 1, void 0, s && !wO(o) ? r.from : void 0);
  }
  return n.parent == null ? vO : null;
}
function Fh(n, e, t) {
  for (; n; n = n.parent) {
    let i = TO(n);
    if (i)
      return i(Bs.create(t, e, n));
  }
  return null;
}
function vO() {
  return 0;
}
class Bs extends Un {
  constructor(e, t, i) {
    super(e.state, e.options), this.base = e, this.pos = t, this.node = i;
  }
  static create(e, t, i) {
    return new Bs(e, t, i);
  }
  get textAfter() {
    return this.textAfterPos(this.pos);
  }
  get baseIndent() {
    let e = this.state.doc.lineAt(this.node.from);
    for (; ; ) {
      let t = this.node.resolve(e.from);
      for (; t.parent && t.parent.from == t.from; )
        t = t.parent;
      if (PO(t, this.node))
        break;
      e = this.state.doc.lineAt(t.from);
    }
    return this.lineIndent(e.from);
  }
  continue() {
    let e = this.node.parent;
    return e ? Fh(e, this.pos, this.base) : 0;
  }
}
function PO(n, e) {
  for (let t = e; t; t = t.parent)
    if (n == t)
      return !0;
  return !1;
}
function RO(n) {
  let e = n.node, t = e.childAfter(e.from), i = e.lastChild;
  if (!t)
    return null;
  let r = n.options.simulateBreak, s = n.state.doc.lineAt(t.from), o = r == null || r <= s.from ? s.to : Math.min(s.to, r);
  for (let l = t.to; ; ) {
    let a = e.childAfter(l);
    if (!a || a == i)
      return null;
    if (!a.type.isSkipped)
      return a.from < o ? t : null;
    l = a.to;
  }
}
function CO({ closing: n, align: e = !0, units: t = 1 }) {
  return (i) => Hh(i, e, t, n);
}
function Hh(n, e, t, i, r) {
  let s = n.textAfter, o = s.match(/^\s*/)[0].length, l = i && s.slice(o, o + i.length) == i || r == n.pos + o, a = e ? RO(n) : null;
  return a ? l ? n.column(a.from) : n.column(a.to) : n.baseIndent + (l ? 0 : n.unit * t);
}
const AO = (n) => n.baseIndent;
function ln({ except: n, units: e = 1 } = {}) {
  return (t) => {
    let i = n && n.test(t.textAfter);
    return t.baseIndent + (i ? 0 : e * t.unit);
  };
}
const WO = 200;
function XO() {
  return M.transactionFilter.of((n) => {
    if (!n.docChanged || !n.isUserEvent("input.type") && !n.isUserEvent("input.complete"))
      return n;
    let e = n.startState.languageDataAt("indentOnInput", n.startState.selection.main.head);
    if (!e.length)
      return n;
    let t = n.newDoc, { head: i } = n.newSelection.main, r = t.lineAt(i);
    if (i > r.from + WO)
      return n;
    let s = t.sliceString(r.from, i);
    if (!e.some((h) => h.test(s)))
      return n;
    let { state: o } = n, l = -1, a = [];
    for (let { head: h } of o.selection.ranges) {
      let c = o.doc.lineAt(h);
      if (c.from == l)
        continue;
      l = c.from;
      let f = Ns(o, c.from);
      if (f == null)
        continue;
      let u = /^\s*/.exec(c.text)[0], d = Ti(o, f);
      u != d && a.push({ from: c.from, to: c.from + u.length, insert: d });
    }
    return a.length ? [n, { changes: a, sequential: !0 }] : n;
  });
}
const ZO = /* @__PURE__ */ v.define(), Fn = /* @__PURE__ */ new W();
function Jh(n) {
  let e = n.firstChild, t = n.lastChild;
  return e && e.to < t.from ? { from: e.to, to: t.type.isError ? n.to : t.from } : null;
}
function DO(n, e, t) {
  let i = Y(n);
  if (i.length < t)
    return null;
  let r = i.resolveInner(t), s = null;
  for (let o = r; o; o = o.parent) {
    if (o.to <= t || o.from > t)
      continue;
    if (s && o.from < e)
      break;
    let l = o.type.prop(Fn);
    if (l && (o.to < i.length - 50 || i.length == n.doc.length || !MO(o))) {
      let a = l(o, n);
      a && a.from <= t && a.from >= e && a.to > t && (s = a);
    }
  }
  return s;
}
function MO(n) {
  let e = n.lastChild;
  return e && e.to == n.to && e.type.isError;
}
function Tn(n, e, t) {
  for (let i of n.facet(ZO)) {
    let r = i(n, e, t);
    if (r)
      return r;
  }
  return DO(n, e, t);
}
function Kh(n, e) {
  let t = e.mapPos(n.from, 1), i = e.mapPos(n.to, -1);
  return t >= i ? void 0 : { from: t, to: i };
}
const Hn = /* @__PURE__ */ Z.define({ map: Kh }), Ai = /* @__PURE__ */ Z.define({ map: Kh });
function ec(n) {
  let e = [];
  for (let { head: t } of n.state.selection.ranges)
    e.some((i) => i.from <= t && i.to >= t) || e.push(n.lineBlockAt(t));
  return e;
}
const Rt = /* @__PURE__ */ Oe.define({
  create() {
    return C.none;
  },
  update(n, e) {
    n = n.map(e.changes);
    for (let t of e.effects)
      t.is(Hn) && !jO(n, t.value.from, t.value.to) ? n = n.update({ add: [kl.range(t.value.from, t.value.to)] }) : t.is(Ai) && (n = n.update({
        filter: (i, r) => t.value.from != i || t.value.to != r,
        filterFrom: t.value.from,
        filterTo: t.value.to
      }));
    if (e.selection) {
      let t = !1, { head: i } = e.selection.main;
      n.between(i, i, (r, s) => {
        r < i && s > i && (t = !0);
      }), t && (n = n.update({
        filterFrom: i,
        filterTo: i,
        filter: (r, s) => s <= i || r >= i
      }));
    }
    return n;
  },
  provide: (n) => P.decorations.from(n),
  toJSON(n, e) {
    let t = [];
    return n.between(0, e.doc.length, (i, r) => {
      t.push(i, r);
    }), t;
  },
  fromJSON(n) {
    if (!Array.isArray(n) || n.length % 2)
      throw new RangeError("Invalid JSON for fold state");
    let e = [];
    for (let t = 0; t < n.length; ) {
      let i = n[t++], r = n[t++];
      if (typeof i != "number" || typeof r != "number")
        throw new RangeError("Invalid JSON for fold state");
      e.push(kl.range(i, r));
    }
    return C.set(e, !0);
  }
});
function vn(n, e, t) {
  var i;
  let r = null;
  return (i = n.field(Rt, !1)) === null || i === void 0 || i.between(e, t, (s, o) => {
    (!r || r.from > s) && (r = { from: s, to: o });
  }), r;
}
function jO(n, e, t) {
  let i = !1;
  return n.between(e, e, (r, s) => {
    r == e && s == t && (i = !0);
  }), i;
}
function tc(n, e) {
  return n.field(Rt, !1) ? e : e.concat(Z.appendConfig.of(rc()));
}
const zO = (n) => {
  for (let e of ec(n)) {
    let t = Tn(n.state, e.from, e.to);
    if (t)
      return n.dispatch({ effects: tc(n.state, [Hn.of(t), ic(n, t)]) }), !0;
  }
  return !1;
}, qO = (n) => {
  if (!n.state.field(Rt, !1))
    return !1;
  let e = [];
  for (let t of ec(n)) {
    let i = vn(n.state, t.from, t.to);
    i && e.push(Ai.of(i), ic(n, i, !1));
  }
  return e.length && n.dispatch({ effects: e }), e.length > 0;
};
function ic(n, e, t = !0) {
  let i = n.state.doc.lineAt(e.from).number, r = n.state.doc.lineAt(e.to).number;
  return P.announce.of(`${n.state.phrase(t ? "Folded lines" : "Unfolded lines")} ${i} ${n.state.phrase("to")} ${r}.`);
}
const EO = (n) => {
  let { state: e } = n, t = [];
  for (let i = 0; i < e.doc.length; ) {
    let r = n.lineBlockAt(i), s = Tn(e, r.from, r.to);
    s && t.push(Hn.of(s)), i = (s ? n.lineBlockAt(s.to) : r).to + 1;
  }
  return t.length && n.dispatch({ effects: tc(n.state, t) }), !!t.length;
}, _O = (n) => {
  let e = n.state.field(Rt, !1);
  if (!e || !e.size)
    return !1;
  let t = [];
  return e.between(0, n.state.doc.length, (i, r) => {
    t.push(Ai.of({ from: i, to: r }));
  }), n.dispatch({ effects: t }), !0;
}, IO = [
  { key: "Ctrl-Shift-[", mac: "Cmd-Alt-[", run: zO },
  { key: "Ctrl-Shift-]", mac: "Cmd-Alt-]", run: qO },
  { key: "Ctrl-Alt-[", run: EO },
  { key: "Ctrl-Alt-]", run: _O }
], GO = {
  placeholderDOM: null,
  placeholderText: "\u2026"
}, nc = /* @__PURE__ */ v.define({
  combine(n) {
    return yt(n, GO);
  }
});
function rc(n) {
  let e = [Rt, BO];
  return n && e.push(nc.of(n)), e;
}
const kl = /* @__PURE__ */ C.replace({ widget: /* @__PURE__ */ new class extends St {
  toDOM(n) {
    let { state: e } = n, t = e.facet(nc), i = (s) => {
      let o = n.lineBlockAt(n.posAtDOM(s.target)), l = vn(n.state, o.from, o.to);
      l && n.dispatch({ effects: Ai.of(l) }), s.preventDefault();
    };
    if (t.placeholderDOM)
      return t.placeholderDOM(n, i);
    let r = document.createElement("span");
    return r.textContent = t.placeholderText, r.setAttribute("aria-label", e.phrase("folded code")), r.title = e.phrase("unfold"), r.className = "cm-foldPlaceholder", r.onclick = i, r;
  }
}() }), VO = {
  openText: "\u2304",
  closedText: "\u203A",
  markerDOM: null,
  domEventHandlers: {},
  foldingChanged: () => !1
};
class kr extends it {
  constructor(e, t) {
    super(), this.config = e, this.open = t;
  }
  eq(e) {
    return this.config == e.config && this.open == e.open;
  }
  toDOM(e) {
    if (this.config.markerDOM)
      return this.config.markerDOM(this.open);
    let t = document.createElement("span");
    return t.textContent = this.open ? this.config.openText : this.config.closedText, t.title = e.state.phrase(this.open ? "Fold line" : "Unfold line"), t;
  }
}
function NO(n = {}) {
  let e = Object.assign(Object.assign({}, VO), n), t = new kr(e, !0), i = new kr(e, !1), r = he.fromClass(class {
    constructor(o) {
      this.from = o.viewport.from, this.markers = this.buildMarkers(o);
    }
    update(o) {
      (o.docChanged || o.viewportChanged || o.startState.facet(bt) != o.state.facet(bt) || o.startState.field(Rt, !1) != o.state.field(Rt, !1) || Y(o.startState) != Y(o.state) || e.foldingChanged(o)) && (this.markers = this.buildMarkers(o.view));
    }
    buildMarkers(o) {
      let l = new pt();
      for (let a of o.viewportLineBlocks) {
        let h = vn(o.state, a.from, a.to) ? i : Tn(o.state, a.from, a.to) ? t : null;
        h && l.add(a.from, a.from, h);
      }
      return l.finish();
    }
  }), { domEventHandlers: s } = e;
  return [
    r,
    Gd({
      class: "cm-foldGutter",
      markers(o) {
        var l;
        return ((l = o.plugin(r)) === null || l === void 0 ? void 0 : l.markers) || z.empty;
      },
      initialSpacer() {
        return new kr(e, !1);
      },
      domEventHandlers: Object.assign(Object.assign({}, s), { click: (o, l, a) => {
        if (s.click && s.click(o, l, a))
          return !0;
        let h = vn(o.state, l.from, l.to);
        if (h)
          return o.dispatch({ effects: Ai.of(h) }), !0;
        let c = Tn(o.state, l.from, l.to);
        return c ? (o.dispatch({ effects: Hn.of(c) }), !0) : !1;
      } })
    }),
    rc()
  ];
}
const BO = /* @__PURE__ */ P.baseTheme({
  ".cm-foldPlaceholder": {
    backgroundColor: "#eee",
    border: "1px solid #ddd",
    color: "#888",
    borderRadius: ".2em",
    margin: "0 1px",
    padding: "0 1px",
    cursor: "pointer"
  },
  ".cm-foldGutter span": {
    padding: "0 1px",
    cursor: "pointer"
  }
});
class Jn {
  constructor(e, t) {
    let i;
    function r(l) {
      let a = gt.newName();
      return (i || (i = /* @__PURE__ */ Object.create(null)))["." + a] = l, a;
    }
    const s = typeof t.all == "string" ? t.all : t.all ? r(t.all) : void 0, o = t.scope;
    this.scope = o instanceof De ? (l) => l.prop(wi) == o.data : o ? (l) => l == o : void 0, this.style = Uh(e.map((l) => ({
      tag: l.tag,
      class: l.class || r(Object.assign({}, l, { tag: null }))
    })), {
      all: s
    }).style, this.module = i ? new gt(i) : null, this.themeType = t.themeType;
  }
  static define(e, t) {
    return new Jn(e, t || {});
  }
}
const bs = /* @__PURE__ */ v.define(), sc = /* @__PURE__ */ v.define({
  combine(n) {
    return n.length ? [n[0]] : null;
  }
});
function wr(n) {
  let e = n.facet(bs);
  return e.length ? e : n.facet(sc);
}
function LO(n, e) {
  let t = [YO], i;
  return n instanceof Jn && (n.module && t.push(P.styleModule.of(n.module)), i = n.themeType), e != null && e.fallback ? t.push(sc.of(n)) : i ? t.push(bs.computeN([P.darkTheme], (r) => r.facet(P.darkTheme) == (i == "dark") ? [n] : [])) : t.push(bs.of(n)), t;
}
class UO {
  constructor(e) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = Y(e.state), this.decorations = this.buildDeco(e, wr(e.state));
  }
  update(e) {
    let t = Y(e.state), i = wr(e.state), r = i != wr(e.startState);
    t.length < e.view.viewport.to && !r && t.type == this.tree.type ? this.decorations = this.decorations.map(e.changes) : (t != this.tree || e.viewportChanged || r) && (this.tree = t, this.decorations = this.buildDeco(e.view, i));
  }
  buildDeco(e, t) {
    if (!t || !this.tree.length)
      return C.none;
    let i = new pt();
    for (let { from: r, to: s } of e.visibleRanges)
      QO(this.tree, t, (o, l, a) => {
        i.add(o, l, this.markCache[a] || (this.markCache[a] = C.mark({ class: a })));
      }, r, s);
    return i.finish();
  }
}
const YO = /* @__PURE__ */ Ct.high(/* @__PURE__ */ he.fromClass(UO, {
  decorations: (n) => n.decorations
})), FO = /* @__PURE__ */ Jn.define([
  {
    tag: p.meta,
    color: "#7a757a"
  },
  {
    tag: p.link,
    textDecoration: "underline"
  },
  {
    tag: p.heading,
    textDecoration: "underline",
    fontWeight: "bold"
  },
  {
    tag: p.emphasis,
    fontStyle: "italic"
  },
  {
    tag: p.strong,
    fontWeight: "bold"
  },
  {
    tag: p.strikethrough,
    textDecoration: "line-through"
  },
  {
    tag: p.keyword,
    color: "#708"
  },
  {
    tag: [p.atom, p.bool, p.url, p.contentSeparator, p.labelName],
    color: "#219"
  },
  {
    tag: [p.literal, p.inserted],
    color: "#164"
  },
  {
    tag: [p.string, p.deleted],
    color: "#a11"
  },
  {
    tag: [p.regexp, p.escape, /* @__PURE__ */ p.special(p.string)],
    color: "#e40"
  },
  {
    tag: /* @__PURE__ */ p.definition(p.variableName),
    color: "#00f"
  },
  {
    tag: /* @__PURE__ */ p.local(p.variableName),
    color: "#30a"
  },
  {
    tag: [p.typeName, p.namespace],
    color: "#085"
  },
  {
    tag: p.className,
    color: "#167"
  },
  {
    tag: [/* @__PURE__ */ p.special(p.variableName), p.macroName],
    color: "#256"
  },
  {
    tag: /* @__PURE__ */ p.definition(p.propertyName),
    color: "#00c"
  },
  {
    tag: p.comment,
    color: "#940"
  },
  {
    tag: p.invalid,
    color: "#f00"
  }
]), HO = /* @__PURE__ */ P.baseTheme({
  "&.cm-focused .cm-matchingBracket": { backgroundColor: "#328c8252" },
  "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "#bb555544" }
}), oc = 1e4, lc = "()[]{}", ac = /* @__PURE__ */ v.define({
  combine(n) {
    return yt(n, {
      afterCursor: !0,
      brackets: lc,
      maxScanDistance: oc,
      renderMatch: ep
    });
  }
}), JO = /* @__PURE__ */ C.mark({ class: "cm-matchingBracket" }), KO = /* @__PURE__ */ C.mark({ class: "cm-nonmatchingBracket" });
function ep(n) {
  let e = [], t = n.matched ? JO : KO;
  return e.push(t.range(n.start.from, n.start.to)), n.end && e.push(t.range(n.end.from, n.end.to)), e;
}
const tp = /* @__PURE__ */ Oe.define({
  create() {
    return C.none;
  },
  update(n, e) {
    if (!e.docChanged && !e.selection)
      return n;
    let t = [], i = e.state.facet(ac);
    for (let r of e.state.selection.ranges) {
      if (!r.empty)
        continue;
      let s = Ne(e.state, r.head, -1, i) || r.head > 0 && Ne(e.state, r.head - 1, 1, i) || i.afterCursor && (Ne(e.state, r.head, 1, i) || r.head < e.state.doc.length && Ne(e.state, r.head + 1, -1, i));
      s && (t = t.concat(i.renderMatch(s, e.state)));
    }
    return C.set(t, !0);
  },
  provide: (n) => P.decorations.from(n)
}), ip = [
  tp,
  HO
];
function np(n = {}) {
  return [ac.of(n), ip];
}
function ys(n, e, t) {
  let i = n.prop(e < 0 ? W.openedBy : W.closedBy);
  if (i)
    return i;
  if (n.name.length == 1) {
    let r = t.indexOf(n.name);
    if (r > -1 && r % 2 == (e < 0 ? 1 : 0))
      return [t[r + e]];
  }
  return null;
}
function Ne(n, e, t, i = {}) {
  let r = i.maxScanDistance || oc, s = i.brackets || lc, o = Y(n), l = o.resolveInner(e, t);
  for (let a = l; a; a = a.parent) {
    let h = ys(a.type, t, s);
    if (h && a.from < a.to)
      return rp(n, e, t, a, h, s);
  }
  return sp(n, e, t, o, l.type, r, s);
}
function rp(n, e, t, i, r, s) {
  let o = i.parent, l = { from: i.from, to: i.to }, a = 0, h = o == null ? void 0 : o.cursor();
  if (h && (t < 0 ? h.childBefore(i.from) : h.childAfter(i.to)))
    do
      if (t < 0 ? h.to <= i.from : h.from >= i.to) {
        if (a == 0 && r.indexOf(h.type.name) > -1 && h.from < h.to)
          return { start: l, end: { from: h.from, to: h.to }, matched: !0 };
        if (ys(h.type, t, s))
          a++;
        else if (ys(h.type, -t, s)) {
          if (a == 0)
            return {
              start: l,
              end: h.from == h.to ? void 0 : { from: h.from, to: h.to },
              matched: !1
            };
          a--;
        }
      }
    while (t < 0 ? h.prevSibling() : h.nextSibling());
  return { start: l, matched: !1 };
}
function sp(n, e, t, i, r, s, o) {
  let l = t < 0 ? n.sliceDoc(e - 1, e) : n.sliceDoc(e, e + 1), a = o.indexOf(l);
  if (a < 0 || a % 2 == 0 != t > 0)
    return null;
  let h = { from: t < 0 ? e - 1 : e, to: t > 0 ? e + 1 : e }, c = n.doc.iterRange(e, t > 0 ? n.doc.length : 0), f = 0;
  for (let u = 0; !c.next().done && u <= s; ) {
    let d = c.value;
    t < 0 && (u += d.length);
    let O = e + u * t;
    for (let g = t > 0 ? 0 : d.length - 1, Q = t > 0 ? d.length : -1; g != Q; g += t) {
      let b = o.indexOf(d[g]);
      if (!(b < 0 || i.resolveInner(O + g, 1).type != r))
        if (b % 2 == 0 == t > 0)
          f++;
        else {
          if (f == 1)
            return { start: h, end: { from: O + g, to: O + g + 1 }, matched: b >> 1 == a >> 1 };
          f--;
        }
    }
    t > 0 && (u += d.length);
  }
  return c.done ? { start: h, matched: !1 } : null;
}
const op = /* @__PURE__ */ Object.create(null), wl = [de.none], Tl = [], lp = /* @__PURE__ */ Object.create(null);
for (let [n, e] of [
  ["variable", "variableName"],
  ["variable-2", "variableName.special"],
  ["string-2", "string.special"],
  ["def", "variableName.definition"],
  ["tag", "tagName"],
  ["attribute", "attributeName"],
  ["type", "typeName"],
  ["builtin", "variableName.standard"],
  ["qualifier", "modifier"],
  ["error", "invalid"],
  ["header", "heading"],
  ["property", "propertyName"]
])
  lp[n] = /* @__PURE__ */ ap(op, e);
function Tr(n, e) {
  Tl.indexOf(n) > -1 || (Tl.push(n), console.warn(e));
}
function ap(n, e) {
  let t = null;
  for (let s of e.split(".")) {
    let o = n[s] || p[s];
    o ? typeof o == "function" ? t ? t = o(t) : Tr(s, `Modifier ${s} used at start of tag`) : t ? Tr(s, `Tag ${s} used as modifier`) : t = o : Tr(s, `Unknown highlighting tag ${s}`);
  }
  if (!t)
    return 0;
  let i = e.replace(/ /g, "_"), r = de.define({
    id: wl.length,
    name: i,
    props: [Ln({ [i]: t })]
  });
  return wl.push(r), r.id;
}
const hp = (n) => {
  let e = Us(n.state);
  return e.line ? cp(n) : e.block ? up(n) : !1;
};
function Ls(n, e) {
  return ({ state: t, dispatch: i }) => {
    if (t.readOnly)
      return !1;
    let r = n(e, t);
    return r ? (i(t.update(r)), !0) : !1;
  };
}
const cp = /* @__PURE__ */ Ls(pp, 0), fp = /* @__PURE__ */ Ls(hc, 0), up = /* @__PURE__ */ Ls((n, e) => hc(n, e, Op(e)), 0);
function Us(n, e = n.selection.main.head) {
  let t = n.languageDataAt("commentTokens", e);
  return t.length ? t[0] : {};
}
const si = 50;
function dp(n, { open: e, close: t }, i, r) {
  let s = n.sliceDoc(i - si, i), o = n.sliceDoc(r, r + si), l = /\s*$/.exec(s)[0].length, a = /^\s*/.exec(o)[0].length, h = s.length - l;
  if (s.slice(h - e.length, h) == e && o.slice(a, a + t.length) == t)
    return {
      open: { pos: i - l, margin: l && 1 },
      close: { pos: r + a, margin: a && 1 }
    };
  let c, f;
  r - i <= 2 * si ? c = f = n.sliceDoc(i, r) : (c = n.sliceDoc(i, i + si), f = n.sliceDoc(r - si, r));
  let u = /^\s*/.exec(c)[0].length, d = /\s*$/.exec(f)[0].length, O = f.length - d - t.length;
  return c.slice(u, u + e.length) == e && f.slice(O, O + t.length) == t ? {
    open: {
      pos: i + u + e.length,
      margin: /\s/.test(c.charAt(u + e.length)) ? 1 : 0
    },
    close: {
      pos: r - d - t.length,
      margin: /\s/.test(f.charAt(O - 1)) ? 1 : 0
    }
  } : null;
}
function Op(n) {
  let e = [];
  for (let t of n.selection.ranges) {
    let i = n.doc.lineAt(t.from), r = t.to <= i.to ? i : n.doc.lineAt(t.to), s = e.length - 1;
    s >= 0 && e[s].to > i.from ? e[s].to = r.to : e.push({ from: i.from, to: r.to });
  }
  return e;
}
function hc(n, e, t = e.selection.ranges) {
  let i = t.map((s) => Us(e, s.from).block);
  if (!i.every((s) => s))
    return null;
  let r = t.map((s, o) => dp(e, i[o], s.from, s.to));
  if (n != 2 && !r.every((s) => s))
    return { changes: e.changes(t.map((s, o) => r[o] ? [] : [{ from: s.from, insert: i[o].open + " " }, { from: s.to, insert: " " + i[o].close }])) };
  if (n != 1 && r.some((s) => s)) {
    let s = [];
    for (let o = 0, l; o < r.length; o++)
      if (l = r[o]) {
        let a = i[o], { open: h, close: c } = l;
        s.push({ from: h.pos - a.open.length, to: h.pos + h.margin }, { from: c.pos - c.margin, to: c.pos + a.close.length });
      }
    return { changes: s };
  }
  return null;
}
function pp(n, e, t = e.selection.ranges) {
  let i = [], r = -1;
  for (let { from: s, to: o } of t) {
    let l = i.length, a = 1e9;
    for (let h = s; h <= o; ) {
      let c = e.doc.lineAt(h);
      if (c.from > r && (s == o || o > c.from)) {
        r = c.from;
        let f = Us(e, h).line;
        if (!f)
          continue;
        let u = /^\s*/.exec(c.text)[0].length, d = u == c.length, O = c.text.slice(u, u + f.length) == f ? u : -1;
        u < c.text.length && u < a && (a = u), i.push({ line: c, comment: O, token: f, indent: u, empty: d, single: !1 });
      }
      h = c.to + 1;
    }
    if (a < 1e9)
      for (let h = l; h < i.length; h++)
        i[h].indent < i[h].line.text.length && (i[h].indent = a);
    i.length == l + 1 && (i[l].single = !0);
  }
  if (n != 2 && i.some((s) => s.comment < 0 && (!s.empty || s.single))) {
    let s = [];
    for (let { line: l, token: a, indent: h, empty: c, single: f } of i)
      (f || !c) && s.push({ from: l.from + h, insert: a + " " });
    let o = e.changes(s);
    return { changes: o, selection: e.selection.map(o, 1) };
  } else if (n != 1 && i.some((s) => s.comment >= 0)) {
    let s = [];
    for (let { line: o, comment: l, token: a } of i)
      if (l >= 0) {
        let h = o.from + l, c = h + a.length;
        o.text[c - o.from] == " " && c++, s.push({ from: h, to: c });
      }
    return { changes: s };
  }
  return null;
}
const Ss = /* @__PURE__ */ At.define(), gp = /* @__PURE__ */ At.define(), mp = /* @__PURE__ */ v.define(), cc = /* @__PURE__ */ v.define({
  combine(n) {
    return yt(n, {
      minDepth: 100,
      newGroupDelay: 500
    }, { minDepth: Math.max, newGroupDelay: Math.min });
  }
});
function Qp(n) {
  let e = 0;
  return n.iterChangedRanges((t, i) => e = i), e;
}
const fc = /* @__PURE__ */ Oe.define({
  create() {
    return Be.empty;
  },
  update(n, e) {
    let t = e.state.facet(cc), i = e.annotation(Ss);
    if (i) {
      let a = e.docChanged ? m.single(Qp(e.changes)) : void 0, h = me.fromTransaction(e, a), c = i.side, f = c == 0 ? n.undone : n.done;
      return h ? f = Pn(f, f.length, t.minDepth, h) : f = Oc(f, e.startState.selection), new Be(c == 0 ? i.rest : f, c == 0 ? f : i.rest);
    }
    let r = e.annotation(gp);
    if ((r == "full" || r == "before") && (n = n.isolate()), e.annotation(K.addToHistory) === !1)
      return e.changes.empty ? n : n.addMapping(e.changes.desc);
    let s = me.fromTransaction(e), o = e.annotation(K.time), l = e.annotation(K.userEvent);
    return s ? n = n.addChanges(s, o, l, t.newGroupDelay, t.minDepth) : e.selection && (n = n.addSelection(e.startState.selection, o, l, t.newGroupDelay)), (r == "full" || r == "after") && (n = n.isolate()), n;
  },
  toJSON(n) {
    return { done: n.done.map((e) => e.toJSON()), undone: n.undone.map((e) => e.toJSON()) };
  },
  fromJSON(n) {
    return new Be(n.done.map(me.fromJSON), n.undone.map(me.fromJSON));
  }
});
function bp(n = {}) {
  return [
    fc,
    cc.of(n),
    P.domEventHandlers({
      beforeinput(e, t) {
        let i = e.inputType == "historyUndo" ? uc : e.inputType == "historyRedo" ? xs : null;
        return i ? (e.preventDefault(), i(t)) : !1;
      }
    })
  ];
}
function Kn(n, e) {
  return function({ state: t, dispatch: i }) {
    if (!e && t.readOnly)
      return !1;
    let r = t.field(fc, !1);
    if (!r)
      return !1;
    let s = r.pop(n, t, e);
    return s ? (i(s), !0) : !1;
  };
}
const uc = /* @__PURE__ */ Kn(0, !1), xs = /* @__PURE__ */ Kn(1, !1), yp = /* @__PURE__ */ Kn(0, !0), Sp = /* @__PURE__ */ Kn(1, !0);
class me {
  constructor(e, t, i, r, s) {
    this.changes = e, this.effects = t, this.mapped = i, this.startSelection = r, this.selectionsAfter = s;
  }
  setSelAfter(e) {
    return new me(this.changes, this.effects, this.mapped, this.startSelection, e);
  }
  toJSON() {
    var e, t, i;
    return {
      changes: (e = this.changes) === null || e === void 0 ? void 0 : e.toJSON(),
      mapped: (t = this.mapped) === null || t === void 0 ? void 0 : t.toJSON(),
      startSelection: (i = this.startSelection) === null || i === void 0 ? void 0 : i.toJSON(),
      selectionsAfter: this.selectionsAfter.map((r) => r.toJSON())
    };
  }
  static fromJSON(e) {
    return new me(e.changes && J.fromJSON(e.changes), [], e.mapped && Le.fromJSON(e.mapped), e.startSelection && m.fromJSON(e.startSelection), e.selectionsAfter.map(m.fromJSON));
  }
  static fromTransaction(e, t) {
    let i = Pe;
    for (let r of e.startState.facet(mp)) {
      let s = r(e);
      s.length && (i = i.concat(s));
    }
    return !i.length && e.changes.empty ? null : new me(e.changes.invert(e.startState.doc), i, void 0, t || e.startState.selection, Pe);
  }
  static selection(e) {
    return new me(void 0, Pe, void 0, void 0, e);
  }
}
function Pn(n, e, t, i) {
  let r = e + 1 > t + 20 ? e - t - 1 : 0, s = n.slice(r, e);
  return s.push(i), s;
}
function xp(n, e) {
  let t = [], i = !1;
  return n.iterChangedRanges((r, s) => t.push(r, s)), e.iterChangedRanges((r, s, o, l) => {
    for (let a = 0; a < t.length; ) {
      let h = t[a++], c = t[a++];
      l >= h && o <= c && (i = !0);
    }
  }), i;
}
function $p(n, e) {
  return n.ranges.length == e.ranges.length && n.ranges.filter((t, i) => t.empty != e.ranges[i].empty).length === 0;
}
function dc(n, e) {
  return n.length ? e.length ? n.concat(e) : n : e;
}
const Pe = [], kp = 200;
function Oc(n, e) {
  if (n.length) {
    let t = n[n.length - 1], i = t.selectionsAfter.slice(Math.max(0, t.selectionsAfter.length - kp));
    return i.length && i[i.length - 1].eq(e) ? n : (i.push(e), Pn(n, n.length - 1, 1e9, t.setSelAfter(i)));
  } else
    return [me.selection([e])];
}
function wp(n) {
  let e = n[n.length - 1], t = n.slice();
  return t[n.length - 1] = e.setSelAfter(e.selectionsAfter.slice(0, e.selectionsAfter.length - 1)), t;
}
function vr(n, e) {
  if (!n.length)
    return n;
  let t = n.length, i = Pe;
  for (; t; ) {
    let r = Tp(n[t - 1], e, i);
    if (r.changes && !r.changes.empty || r.effects.length) {
      let s = n.slice(0, t);
      return s[t - 1] = r, s;
    } else
      e = r.mapped, t--, i = r.selectionsAfter;
  }
  return i.length ? [me.selection(i)] : Pe;
}
function Tp(n, e, t) {
  let i = dc(n.selectionsAfter.length ? n.selectionsAfter.map((l) => l.map(e)) : Pe, t);
  if (!n.changes)
    return me.selection(i);
  let r = n.changes.map(e), s = e.mapDesc(n.changes, !0), o = n.mapped ? n.mapped.composeDesc(s) : s;
  return new me(r, Z.mapEffects(n.effects, e), o, n.startSelection.map(s), i);
}
const vp = /^(input\.type|delete)($|\.)/;
class Be {
  constructor(e, t, i = 0, r = void 0) {
    this.done = e, this.undone = t, this.prevTime = i, this.prevUserEvent = r;
  }
  isolate() {
    return this.prevTime ? new Be(this.done, this.undone) : this;
  }
  addChanges(e, t, i, r, s) {
    let o = this.done, l = o[o.length - 1];
    return l && l.changes && !l.changes.empty && e.changes && (!i || vp.test(i)) && (!l.selectionsAfter.length && t - this.prevTime < r && xp(l.changes, e.changes) || i == "input.type.compose") ? o = Pn(o, o.length - 1, s, new me(e.changes.compose(l.changes), dc(e.effects, l.effects), l.mapped, l.startSelection, Pe)) : o = Pn(o, o.length, s, e), new Be(o, Pe, t, i);
  }
  addSelection(e, t, i, r) {
    let s = this.done.length ? this.done[this.done.length - 1].selectionsAfter : Pe;
    return s.length > 0 && t - this.prevTime < r && i == this.prevUserEvent && i && /^select($|\.)/.test(i) && $p(s[s.length - 1], e) ? this : new Be(Oc(this.done, e), this.undone, t, i);
  }
  addMapping(e) {
    return new Be(vr(this.done, e), vr(this.undone, e), this.prevTime, this.prevUserEvent);
  }
  pop(e, t, i) {
    let r = e == 0 ? this.done : this.undone;
    if (r.length == 0)
      return null;
    let s = r[r.length - 1];
    if (i && s.selectionsAfter.length)
      return t.update({
        selection: s.selectionsAfter[s.selectionsAfter.length - 1],
        annotations: Ss.of({ side: e, rest: wp(r) }),
        userEvent: e == 0 ? "select.undo" : "select.redo",
        scrollIntoView: !0
      });
    if (s.changes) {
      let o = r.length == 1 ? Pe : r.slice(0, r.length - 1);
      return s.mapped && (o = vr(o, s.mapped)), t.update({
        changes: s.changes,
        selection: s.startSelection,
        effects: s.effects,
        annotations: Ss.of({ side: e, rest: o }),
        filter: !1,
        userEvent: e == 0 ? "undo" : "redo",
        scrollIntoView: !0
      });
    } else
      return null;
  }
}
Be.empty = /* @__PURE__ */ new Be(Pe, Pe);
const Pp = [
  { key: "Mod-z", run: uc, preventDefault: !0 },
  { key: "Mod-y", mac: "Mod-Shift-z", run: xs, preventDefault: !0 },
  { linux: "Ctrl-Shift-z", run: xs, preventDefault: !0 },
  { key: "Mod-u", run: yp, preventDefault: !0 },
  { key: "Alt-u", mac: "Mod-Shift-u", run: Sp, preventDefault: !0 }
];
function Kt(n, e) {
  return m.create(n.ranges.map(e), n.mainIndex);
}
function Fe(n, e) {
  return n.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function nt({ state: n, dispatch: e }, t) {
  let i = Kt(n.selection, t);
  return i.eq(n.selection) ? !1 : (e(Fe(n, i)), !0);
}
function er(n, e) {
  return m.cursor(e ? n.to : n.from);
}
function pc(n, e) {
  return nt(n, (t) => t.empty ? n.moveByChar(t, e) : er(t, e));
}
function Ce(n) {
  return n.textDirectionAt(n.state.selection.main.head) == U.LTR;
}
const gc = (n) => pc(n, !Ce(n)), mc = (n) => pc(n, Ce(n));
function Qc(n, e) {
  return nt(n, (t) => t.empty ? n.moveByGroup(t, e) : er(t, e));
}
const Rp = (n) => Qc(n, !Ce(n)), Cp = (n) => Qc(n, Ce(n));
function Ap(n, e, t) {
  if (e.type.prop(t))
    return !0;
  let i = e.to - e.from;
  return i && (i > 2 || /[^\s,.;:]/.test(n.sliceDoc(e.from, e.to))) || e.firstChild;
}
function tr(n, e, t) {
  let i = Y(n).resolveInner(e.head), r = t ? W.closedBy : W.openedBy;
  for (let a = e.head; ; ) {
    let h = t ? i.childAfter(a) : i.childBefore(a);
    if (!h)
      break;
    Ap(n, h, r) ? i = h : a = t ? h.to : h.from;
  }
  let s = i.type.prop(r), o, l;
  return s && (o = t ? Ne(n, i.from, 1) : Ne(n, i.to, -1)) && o.matched ? l = t ? o.end.to : o.end.from : l = t ? i.to : i.from, m.cursor(l, t ? -1 : 1);
}
const Wp = (n) => nt(n, (e) => tr(n.state, e, !Ce(n))), Xp = (n) => nt(n, (e) => tr(n.state, e, Ce(n)));
function bc(n, e) {
  return nt(n, (t) => {
    if (!t.empty)
      return er(t, e);
    let i = n.moveVertically(t, e);
    return i.head != t.head ? i : n.moveToLineBoundary(t, e);
  });
}
const yc = (n) => bc(n, !1), Sc = (n) => bc(n, !0);
function xc(n) {
  return Math.max(n.defaultLineHeight, Math.min(n.dom.clientHeight, innerHeight) - 5);
}
function $c(n, e) {
  let { state: t } = n, i = Kt(t.selection, (l) => l.empty ? n.moveVertically(l, e, xc(n)) : er(l, e));
  if (i.eq(t.selection))
    return !1;
  let r = n.coordsAtPos(t.selection.main.head), s = n.scrollDOM.getBoundingClientRect(), o;
  return r && r.top > s.top && r.bottom < s.bottom && r.top - s.top <= n.scrollDOM.scrollHeight - n.scrollDOM.scrollTop - n.scrollDOM.clientHeight && (o = P.scrollIntoView(i.main.head, { y: "start", yMargin: r.top - s.top })), n.dispatch(Fe(t, i), { effects: o }), !0;
}
const vl = (n) => $c(n, !1), $s = (n) => $c(n, !0);
function ir(n, e, t) {
  let i = n.lineBlockAt(e.head), r = n.moveToLineBoundary(e, t);
  if (r.head == e.head && r.head != (t ? i.to : i.from) && (r = n.moveToLineBoundary(e, t, !1)), !t && r.head == i.from && i.length) {
    let s = /^\s*/.exec(n.state.sliceDoc(i.from, Math.min(i.from + 100, i.to)))[0].length;
    s && e.head != i.from + s && (r = m.cursor(i.from + s));
  }
  return r;
}
const Pl = (n) => nt(n, (e) => ir(n, e, !0)), Rl = (n) => nt(n, (e) => ir(n, e, !1)), Zp = (n) => nt(n, (e) => m.cursor(n.lineBlockAt(e.head).from, 1)), Dp = (n) => nt(n, (e) => m.cursor(n.lineBlockAt(e.head).to, -1));
function Mp(n, e, t) {
  let i = !1, r = Kt(n.selection, (s) => {
    let o = Ne(n, s.head, -1) || Ne(n, s.head, 1) || s.head > 0 && Ne(n, s.head - 1, 1) || s.head < n.doc.length && Ne(n, s.head + 1, -1);
    if (!o || !o.end)
      return s;
    i = !0;
    let l = o.start.from == s.head ? o.end.to : o.end.from;
    return t ? m.range(s.anchor, l) : m.cursor(l);
  });
  return i ? (e(Fe(n, r)), !0) : !1;
}
const jp = ({ state: n, dispatch: e }) => Mp(n, e, !1);
function He(n, e) {
  let t = Kt(n.state.selection, (i) => {
    let r = e(i);
    return m.range(i.anchor, r.head, r.goalColumn);
  });
  return t.eq(n.state.selection) ? !1 : (n.dispatch(Fe(n.state, t)), !0);
}
function kc(n, e) {
  return He(n, (t) => n.moveByChar(t, e));
}
const wc = (n) => kc(n, !Ce(n)), Tc = (n) => kc(n, Ce(n));
function vc(n, e) {
  return He(n, (t) => n.moveByGroup(t, e));
}
const zp = (n) => vc(n, !Ce(n)), qp = (n) => vc(n, Ce(n)), Ep = (n) => He(n, (e) => tr(n.state, e, !Ce(n))), _p = (n) => He(n, (e) => tr(n.state, e, Ce(n)));
function Pc(n, e) {
  return He(n, (t) => n.moveVertically(t, e));
}
const Rc = (n) => Pc(n, !1), Cc = (n) => Pc(n, !0);
function Ac(n, e) {
  return He(n, (t) => n.moveVertically(t, e, xc(n)));
}
const Cl = (n) => Ac(n, !1), Al = (n) => Ac(n, !0), Wl = (n) => He(n, (e) => ir(n, e, !0)), Xl = (n) => He(n, (e) => ir(n, e, !1)), Ip = (n) => He(n, (e) => m.cursor(n.lineBlockAt(e.head).from)), Gp = (n) => He(n, (e) => m.cursor(n.lineBlockAt(e.head).to)), Zl = ({ state: n, dispatch: e }) => (e(Fe(n, { anchor: 0 })), !0), Dl = ({ state: n, dispatch: e }) => (e(Fe(n, { anchor: n.doc.length })), !0), Ml = ({ state: n, dispatch: e }) => (e(Fe(n, { anchor: n.selection.main.anchor, head: 0 })), !0), jl = ({ state: n, dispatch: e }) => (e(Fe(n, { anchor: n.selection.main.anchor, head: n.doc.length })), !0), Vp = ({ state: n, dispatch: e }) => (e(n.update({ selection: { anchor: 0, head: n.doc.length }, userEvent: "select" })), !0), Np = ({ state: n, dispatch: e }) => {
  let t = sr(n).map(({ from: i, to: r }) => m.range(i, Math.min(r + 1, n.doc.length)));
  return e(n.update({ selection: m.create(t), userEvent: "select" })), !0;
}, Bp = ({ state: n, dispatch: e }) => {
  let t = Kt(n.selection, (i) => {
    var r;
    let s = Y(n).resolveInner(i.head, 1);
    for (; !(s.from < i.from && s.to >= i.to || s.to > i.to && s.from <= i.from || !(!((r = s.parent) === null || r === void 0) && r.parent)); )
      s = s.parent;
    return m.range(s.to, s.from);
  });
  return e(Fe(n, t)), !0;
}, Lp = ({ state: n, dispatch: e }) => {
  let t = n.selection, i = null;
  return t.ranges.length > 1 ? i = m.create([t.main]) : t.main.empty || (i = m.create([m.cursor(t.main.head)])), i ? (e(Fe(n, i)), !0) : !1;
};
function nr({ state: n, dispatch: e }, t) {
  if (n.readOnly)
    return !1;
  let i = "delete.selection", r = n.changeByRange((s) => {
    let { from: o, to: l } = s;
    if (o == l) {
      let a = t(o);
      a < o ? i = "delete.backward" : a > o && (i = "delete.forward"), o = Math.min(o, a), l = Math.max(l, a);
    }
    return o == l ? { range: s } : { changes: { from: o, to: l }, range: m.cursor(o) };
  });
  return r.changes.empty ? !1 : (e(n.update(r, {
    scrollIntoView: !0,
    userEvent: i,
    effects: i == "delete.selection" ? P.announce.of(n.phrase("Selection deleted")) : void 0
  })), !0);
}
function rr(n, e, t) {
  if (n instanceof P)
    for (let i of n.state.facet(P.atomicRanges).map((r) => r(n)))
      i.between(e, e, (r, s) => {
        r < e && s > e && (e = t ? s : r);
      });
  return e;
}
const Wc = (n, e) => nr(n, (t) => {
  let { state: i } = n, r = i.doc.lineAt(t), s, o;
  if (!e && t > r.from && t < r.from + 200 && !/[^ \t]/.test(s = r.text.slice(0, t - r.from))) {
    if (s[s.length - 1] == "	")
      return t - 1;
    let l = _n(s, i.tabSize), a = l % wn(i) || wn(i);
    for (let h = 0; h < a && s[s.length - 1 - h] == " "; h++)
      t--;
    o = t;
  } else
    o = ke(r.text, t - r.from, e, e) + r.from, o == t && r.number != (e ? i.doc.lines : 1) && (o += e ? 1 : -1);
  return rr(n, o, e);
}), ks = (n) => Wc(n, !1), Xc = (n) => Wc(n, !0), Zc = (n, e) => nr(n, (t) => {
  let i = t, { state: r } = n, s = r.doc.lineAt(i), o = r.charCategorizer(i);
  for (let l = null; ; ) {
    if (i == (e ? s.to : s.from)) {
      i == t && s.number != (e ? r.doc.lines : 1) && (i += e ? 1 : -1);
      break;
    }
    let a = ke(s.text, i - s.from, e) + s.from, h = s.text.slice(Math.min(i, a) - s.from, Math.max(i, a) - s.from), c = o(h);
    if (l != null && c != l)
      break;
    (h != " " || i != t) && (l = c), i = a;
  }
  return rr(n, i, e);
}), Dc = (n) => Zc(n, !1), Up = (n) => Zc(n, !0), Mc = (n) => nr(n, (e) => {
  let t = n.lineBlockAt(e).to;
  return rr(n, e < t ? t : Math.min(n.state.doc.length, e + 1), !0);
}), Yp = (n) => nr(n, (e) => {
  let t = n.lineBlockAt(e).from;
  return rr(n, e > t ? t : Math.max(0, e - 1), !1);
}), Fp = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = n.changeByRange((i) => ({
    changes: { from: i.from, to: i.to, insert: j.of(["", ""]) },
    range: m.cursor(i.from)
  }));
  return e(n.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, Hp = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = n.changeByRange((i) => {
    if (!i.empty || i.from == 0 || i.from == n.doc.length)
      return { range: i };
    let r = i.from, s = n.doc.lineAt(r), o = r == s.from ? r - 1 : ke(s.text, r - s.from, !1) + s.from, l = r == s.to ? r + 1 : ke(s.text, r - s.from, !0) + s.from;
    return {
      changes: { from: o, to: l, insert: n.doc.slice(r, l).append(n.doc.slice(o, r)) },
      range: m.cursor(l)
    };
  });
  return t.changes.empty ? !1 : (e(n.update(t, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function sr(n) {
  let e = [], t = -1;
  for (let i of n.selection.ranges) {
    let r = n.doc.lineAt(i.from), s = n.doc.lineAt(i.to);
    if (!i.empty && i.to == s.from && (s = n.doc.lineAt(i.to - 1)), t >= r.number) {
      let o = e[e.length - 1];
      o.to = s.to, o.ranges.push(i);
    } else
      e.push({ from: r.from, to: s.to, ranges: [i] });
    t = s.number + 1;
  }
  return e;
}
function jc(n, e, t) {
  if (n.readOnly)
    return !1;
  let i = [], r = [];
  for (let s of sr(n)) {
    if (t ? s.to == n.doc.length : s.from == 0)
      continue;
    let o = n.doc.lineAt(t ? s.to + 1 : s.from - 1), l = o.length + 1;
    if (t) {
      i.push({ from: s.to, to: o.to }, { from: s.from, insert: o.text + n.lineBreak });
      for (let a of s.ranges)
        r.push(m.range(Math.min(n.doc.length, a.anchor + l), Math.min(n.doc.length, a.head + l)));
    } else {
      i.push({ from: o.from, to: s.from }, { from: s.to, insert: n.lineBreak + o.text });
      for (let a of s.ranges)
        r.push(m.range(a.anchor - l, a.head - l));
    }
  }
  return i.length ? (e(n.update({
    changes: i,
    scrollIntoView: !0,
    selection: m.create(r, n.selection.mainIndex),
    userEvent: "move.line"
  })), !0) : !1;
}
const Jp = ({ state: n, dispatch: e }) => jc(n, e, !1), Kp = ({ state: n, dispatch: e }) => jc(n, e, !0);
function zc(n, e, t) {
  if (n.readOnly)
    return !1;
  let i = [];
  for (let r of sr(n))
    t ? i.push({ from: r.from, insert: n.doc.slice(r.from, r.to) + n.lineBreak }) : i.push({ from: r.to, insert: n.lineBreak + n.doc.slice(r.from, r.to) });
  return e(n.update({ changes: i, scrollIntoView: !0, userEvent: "input.copyline" })), !0;
}
const eg = ({ state: n, dispatch: e }) => zc(n, e, !1), tg = ({ state: n, dispatch: e }) => zc(n, e, !0), ig = (n) => {
  if (n.state.readOnly)
    return !1;
  let { state: e } = n, t = e.changes(sr(e).map(({ from: r, to: s }) => (r > 0 ? r-- : s < e.doc.length && s++, { from: r, to: s }))), i = Kt(e.selection, (r) => n.moveVertically(r, !0)).map(t);
  return n.dispatch({ changes: t, selection: i, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function ng(n, e) {
  if (/\(\)|\[\]|\{\}/.test(n.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = Y(n).resolveInner(e), i = t.childBefore(e), r = t.childAfter(e), s;
  return i && r && i.to <= e && r.from >= e && (s = i.type.prop(W.closedBy)) && s.indexOf(r.name) > -1 && n.doc.lineAt(i.to).from == n.doc.lineAt(r.from).from ? { from: i.to, to: r.from } : null;
}
const rg = /* @__PURE__ */ qc(!1), sg = /* @__PURE__ */ qc(!0);
function qc(n) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let i = e.changeByRange((r) => {
      let { from: s, to: o } = r, l = e.doc.lineAt(s), a = !n && s == o && ng(e, s);
      n && (s = o = (o <= l.to ? l : e.doc.lineAt(o)).to);
      let h = new Un(e, { simulateBreak: s, simulateDoubleBreak: !!a }), c = Ns(h, s);
      for (c == null && (c = /^\s*/.exec(e.doc.lineAt(s).text)[0].length); o < l.to && /\s/.test(l.text[o - l.from]); )
        o++;
      a ? { from: s, to: o } = a : s > l.from && s < l.from + 100 && !/\S/.test(l.text.slice(0, s)) && (s = l.from);
      let f = ["", Ti(e, c)];
      return a && f.push(Ti(e, h.lineIndent(l.from, -1))), {
        changes: { from: s, to: o, insert: j.of(f) },
        range: m.cursor(s + 1 + f[1].length)
      };
    });
    return t(e.update(i, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function Ys(n, e) {
  let t = -1;
  return n.changeByRange((i) => {
    let r = [];
    for (let o = i.from; o <= i.to; ) {
      let l = n.doc.lineAt(o);
      l.number > t && (i.empty || i.to > l.from) && (e(l, r, i), t = l.number), o = l.to + 1;
    }
    let s = n.changes(r);
    return {
      changes: r,
      range: m.range(s.mapPos(i.anchor, 1), s.mapPos(i.head, 1))
    };
  });
}
const og = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), i = new Un(n, { overrideIndentation: (s) => {
    let o = t[s];
    return o == null ? -1 : o;
  } }), r = Ys(n, (s, o, l) => {
    let a = Ns(i, s.from);
    if (a == null)
      return;
    /\S/.test(s.text) || (a = 0);
    let h = /^\s*/.exec(s.text)[0], c = Ti(n, a);
    (h != c || l.from < s.from + h.length) && (t[s.from] = a, o.push({ from: s.from, to: s.from + h.length, insert: c }));
  });
  return r.changes.empty || e(n.update(r, { userEvent: "indent" })), !0;
}, Ec = ({ state: n, dispatch: e }) => n.readOnly ? !1 : (e(n.update(Ys(n, (t, i) => {
  i.push({ from: t.from, insert: n.facet(Ci) });
}), { userEvent: "input.indent" })), !0), _c = ({ state: n, dispatch: e }) => n.readOnly ? !1 : (e(n.update(Ys(n, (t, i) => {
  let r = /^\s*/.exec(t.text)[0];
  if (!r)
    return;
  let s = _n(r, n.tabSize), o = 0, l = Ti(n, Math.max(0, s - wn(n)));
  for (; o < r.length && o < l.length && r.charCodeAt(o) == l.charCodeAt(o); )
    o++;
  i.push({ from: t.from + o, to: t.from + r.length, insert: l.slice(o) });
}), { userEvent: "delete.dedent" })), !0), lg = [
  { key: "Ctrl-b", run: gc, shift: wc, preventDefault: !0 },
  { key: "Ctrl-f", run: mc, shift: Tc },
  { key: "Ctrl-p", run: yc, shift: Rc },
  { key: "Ctrl-n", run: Sc, shift: Cc },
  { key: "Ctrl-a", run: Zp, shift: Ip },
  { key: "Ctrl-e", run: Dp, shift: Gp },
  { key: "Ctrl-d", run: Xc },
  { key: "Ctrl-h", run: ks },
  { key: "Ctrl-k", run: Mc },
  { key: "Ctrl-Alt-h", run: Dc },
  { key: "Ctrl-o", run: Fp },
  { key: "Ctrl-t", run: Hp },
  { key: "Ctrl-v", run: $s }
], ag = /* @__PURE__ */ [
  { key: "ArrowLeft", run: gc, shift: wc, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: Rp, shift: zp },
  { mac: "Cmd-ArrowLeft", run: Rl, shift: Xl },
  { key: "ArrowRight", run: mc, shift: Tc, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: Cp, shift: qp },
  { mac: "Cmd-ArrowRight", run: Pl, shift: Wl },
  { key: "ArrowUp", run: yc, shift: Rc, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: Zl, shift: Ml },
  { mac: "Ctrl-ArrowUp", run: vl, shift: Cl },
  { key: "ArrowDown", run: Sc, shift: Cc, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: Dl, shift: jl },
  { mac: "Ctrl-ArrowDown", run: $s, shift: Al },
  { key: "PageUp", run: vl, shift: Cl },
  { key: "PageDown", run: $s, shift: Al },
  { key: "Home", run: Rl, shift: Xl, preventDefault: !0 },
  { key: "Mod-Home", run: Zl, shift: Ml },
  { key: "End", run: Pl, shift: Wl, preventDefault: !0 },
  { key: "Mod-End", run: Dl, shift: jl },
  { key: "Enter", run: rg },
  { key: "Mod-a", run: Vp },
  { key: "Backspace", run: ks, shift: ks },
  { key: "Delete", run: Xc },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: Dc },
  { key: "Mod-Delete", mac: "Alt-Delete", run: Up },
  { mac: "Mod-Backspace", run: Yp },
  { mac: "Mod-Delete", run: Mc }
].concat(/* @__PURE__ */ lg.map((n) => ({ mac: n.key, run: n.run, shift: n.shift }))), hg = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: Wp, shift: Ep },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: Xp, shift: _p },
  { key: "Alt-ArrowUp", run: Jp },
  { key: "Shift-Alt-ArrowUp", run: eg },
  { key: "Alt-ArrowDown", run: Kp },
  { key: "Shift-Alt-ArrowDown", run: tg },
  { key: "Escape", run: Lp },
  { key: "Mod-Enter", run: sg },
  { key: "Alt-l", mac: "Ctrl-l", run: Np },
  { key: "Mod-i", run: Bp, preventDefault: !0 },
  { key: "Mod-[", run: _c },
  { key: "Mod-]", run: Ec },
  { key: "Mod-Alt-\\", run: og },
  { key: "Shift-Mod-k", run: ig },
  { key: "Shift-Mod-\\", run: jp },
  { key: "Mod-/", run: hp },
  { key: "Alt-A", run: fp }
].concat(ag), cg = { key: "Tab", run: Ec, shift: _c };
function pe() {
  var n = arguments[0];
  typeof n == "string" && (n = document.createElement(n));
  var e = 1, t = arguments[1];
  if (t && typeof t == "object" && t.nodeType == null && !Array.isArray(t)) {
    for (var i in t)
      if (Object.prototype.hasOwnProperty.call(t, i)) {
        var r = t[i];
        typeof r == "string" ? n.setAttribute(i, r) : r != null && (n[i] = r);
      }
    e++;
  }
  for (; e < arguments.length; e++)
    Ic(n, arguments[e]);
  return n;
}
function Ic(n, e) {
  if (typeof e == "string")
    n.appendChild(document.createTextNode(e));
  else if (e != null)
    if (e.nodeType != null)
      n.appendChild(e);
    else if (Array.isArray(e))
      for (var t = 0; t < e.length; t++)
        Ic(n, e[t]);
    else
      throw new RangeError("Unsupported child node: " + e);
}
const zl = typeof String.prototype.normalize == "function" ? (n) => n.normalize("NFKD") : (n) => n;
class Ft {
  constructor(e, t, i = 0, r = e.length, s) {
    this.value = { from: 0, to: 0 }, this.done = !1, this.matches = [], this.buffer = "", this.bufferPos = 0, this.iter = e.iterRange(i, r), this.bufferStart = i, this.normalize = s ? (o) => s(zl(o)) : zl, this.query = this.normalize(t);
  }
  peek() {
    if (this.bufferPos == this.buffer.length) {
      if (this.bufferStart += this.buffer.length, this.iter.next(), this.iter.done)
        return -1;
      this.bufferPos = 0, this.buffer = this.iter.value;
    }
    return ne(this.buffer, this.bufferPos);
  }
  next() {
    for (; this.matches.length; )
      this.matches.pop();
    return this.nextOverlapping();
  }
  nextOverlapping() {
    for (; ; ) {
      let e = this.peek();
      if (e < 0)
        return this.done = !0, this;
      let t = As(e), i = this.bufferStart + this.bufferPos;
      this.bufferPos += xe(e);
      let r = this.normalize(t);
      for (let s = 0, o = i; ; s++) {
        let l = r.charCodeAt(s), a = this.match(l, o);
        if (a)
          return this.value = a, this;
        if (s == r.length - 1)
          break;
        o == i && s < t.length && t.charCodeAt(s) == l && o++;
      }
    }
  }
  match(e, t) {
    let i = null;
    for (let r = 0; r < this.matches.length; r += 2) {
      let s = this.matches[r], o = !1;
      this.query.charCodeAt(s) == e && (s == this.query.length - 1 ? i = { from: this.matches[r + 1], to: t + 1 } : (this.matches[r]++, o = !0)), o || (this.matches.splice(r, 2), r -= 2);
    }
    return this.query.charCodeAt(0) == e && (this.query.length == 1 ? i = { from: t, to: t + 1 } : this.matches.push(1, t)), i;
  }
}
typeof Symbol < "u" && (Ft.prototype[Symbol.iterator] = function() {
  return this;
});
const Gc = { from: -1, to: -1, match: /* @__PURE__ */ /.*/.exec("") }, Fs = "gm" + (/x/.unicode == null ? "" : "u");
class Vc {
  constructor(e, t, i, r = 0, s = e.length) {
    if (this.to = s, this.curLine = "", this.done = !1, this.value = Gc, /\\[sWDnr]|\n|\r|\[\^/.test(t))
      return new Nc(e, t, i, r, s);
    this.re = new RegExp(t, Fs + (i != null && i.ignoreCase ? "i" : "")), this.iter = e.iter();
    let o = e.lineAt(r);
    this.curLineStart = o.from, this.matchPos = r, this.getLine(this.curLineStart);
  }
  getLine(e) {
    this.iter.next(e), this.iter.lineBreak ? this.curLine = "" : (this.curLine = this.iter.value, this.curLineStart + this.curLine.length > this.to && (this.curLine = this.curLine.slice(0, this.to - this.curLineStart)), this.iter.next());
  }
  nextLine() {
    this.curLineStart = this.curLineStart + this.curLine.length + 1, this.curLineStart > this.to ? this.curLine = "" : this.getLine(0);
  }
  next() {
    for (let e = this.matchPos - this.curLineStart; ; ) {
      this.re.lastIndex = e;
      let t = this.matchPos <= this.to && this.re.exec(this.curLine);
      if (t) {
        let i = this.curLineStart + t.index, r = i + t[0].length;
        if (this.matchPos = r + (i == r ? 1 : 0), i == this.curLine.length && this.nextLine(), i < r || i > this.value.to)
          return this.value = { from: i, to: r, match: t }, this;
        e = this.matchPos - this.curLineStart;
      } else if (this.curLineStart + this.curLine.length < this.to)
        this.nextLine(), e = 0;
      else
        return this.done = !0, this;
    }
  }
}
const Pr = /* @__PURE__ */ new WeakMap();
class It {
  constructor(e, t) {
    this.from = e, this.text = t;
  }
  get to() {
    return this.from + this.text.length;
  }
  static get(e, t, i) {
    let r = Pr.get(e);
    if (!r || r.from >= i || r.to <= t) {
      let l = new It(t, e.sliceString(t, i));
      return Pr.set(e, l), l;
    }
    if (r.from == t && r.to == i)
      return r;
    let { text: s, from: o } = r;
    return o > t && (s = e.sliceString(t, o) + s, o = t), r.to < i && (s += e.sliceString(r.to, i)), Pr.set(e, new It(o, s)), new It(t, s.slice(t - o, i - o));
  }
}
class Nc {
  constructor(e, t, i, r, s) {
    this.text = e, this.to = s, this.done = !1, this.value = Gc, this.matchPos = r, this.re = new RegExp(t, Fs + (i != null && i.ignoreCase ? "i" : "")), this.flat = It.get(e, r, this.chunkEnd(r + 5e3));
  }
  chunkEnd(e) {
    return e >= this.to ? this.to : this.text.lineAt(e).to;
  }
  next() {
    for (; ; ) {
      let e = this.re.lastIndex = this.matchPos - this.flat.from, t = this.re.exec(this.flat.text);
      if (t && !t[0] && t.index == e && (this.re.lastIndex = e + 1, t = this.re.exec(this.flat.text)), t && this.flat.to < this.to && t.index + t[0].length > this.flat.text.length - 10 && (t = null), t) {
        let i = this.flat.from + t.index, r = i + t[0].length;
        return this.value = { from: i, to: r, match: t }, this.matchPos = r + (i == r ? 1 : 0), this;
      } else {
        if (this.flat.to == this.to)
          return this.done = !0, this;
        this.flat = It.get(this.text, this.flat.from, this.chunkEnd(this.flat.from + this.flat.text.length * 2));
      }
    }
  }
}
typeof Symbol < "u" && (Vc.prototype[Symbol.iterator] = Nc.prototype[Symbol.iterator] = function() {
  return this;
});
function fg(n) {
  try {
    return new RegExp(n, Fs), !0;
  } catch {
    return !1;
  }
}
function ws(n) {
  let e = pe("input", { class: "cm-textfield", name: "line" }), t = pe("form", {
    class: "cm-gotoLine",
    onkeydown: (r) => {
      r.keyCode == 27 ? (r.preventDefault(), n.dispatch({ effects: Rn.of(!1) }), n.focus()) : r.keyCode == 13 && (r.preventDefault(), i());
    },
    onsubmit: (r) => {
      r.preventDefault(), i();
    }
  }, pe("label", n.state.phrase("Go to line"), ": ", e), " ", pe("button", { class: "cm-button", type: "submit" }, n.state.phrase("go")));
  function i() {
    let r = /^([+-])?(\d+)?(:\d+)?(%)?$/.exec(e.value);
    if (!r)
      return;
    let { state: s } = n, o = s.doc.lineAt(s.selection.main.head), [, l, a, h, c] = r, f = h ? +h.slice(1) : 0, u = a ? +a : o.number;
    if (a && c) {
      let O = u / 100;
      l && (O = O * (l == "-" ? -1 : 1) + o.number / s.doc.lines), u = Math.round(s.doc.lines * O);
    } else
      a && l && (u = u * (l == "-" ? -1 : 1) + o.number);
    let d = s.doc.line(Math.max(1, Math.min(s.doc.lines, u)));
    n.dispatch({
      effects: Rn.of(!1),
      selection: m.cursor(d.from + Math.max(0, Math.min(f, d.length))),
      scrollIntoView: !0
    }), n.focus();
  }
  return { dom: t };
}
const Rn = /* @__PURE__ */ Z.define(), ql = /* @__PURE__ */ Oe.define({
  create() {
    return !0;
  },
  update(n, e) {
    for (let t of e.effects)
      t.is(Rn) && (n = t.value);
    return n;
  },
  provide: (n) => yn.from(n, (e) => e ? ws : null)
}), ug = (n) => {
  let e = bn(n, ws);
  if (!e) {
    let t = [Rn.of(!0)];
    n.state.field(ql, !1) == null && t.push(Z.appendConfig.of([ql, dg])), n.dispatch({ effects: t }), e = bn(n, ws);
  }
  return e && e.dom.querySelector("input").focus(), !0;
}, dg = /* @__PURE__ */ P.baseTheme({
  ".cm-panel.cm-gotoLine": {
    padding: "2px 6px 4px",
    "& label": { fontSize: "80%" }
  }
}), Og = {
  highlightWordAroundCursor: !1,
  minSelectionLength: 1,
  maxMatches: 100,
  wholeWords: !1
}, Bc = /* @__PURE__ */ v.define({
  combine(n) {
    return yt(n, Og, {
      highlightWordAroundCursor: (e, t) => e || t,
      minSelectionLength: Math.min,
      maxMatches: Math.min
    });
  }
});
function pg(n) {
  let e = [yg, bg];
  return n && e.push(Bc.of(n)), e;
}
const gg = /* @__PURE__ */ C.mark({ class: "cm-selectionMatch" }), mg = /* @__PURE__ */ C.mark({ class: "cm-selectionMatch cm-selectionMatch-main" });
function El(n, e, t, i) {
  return (t == 0 || n(e.sliceDoc(t - 1, t)) != fe.Word) && (i == e.doc.length || n(e.sliceDoc(i, i + 1)) != fe.Word);
}
function Qg(n, e, t, i) {
  return n(e.sliceDoc(t, t + 1)) == fe.Word && n(e.sliceDoc(i - 1, i)) == fe.Word;
}
const bg = /* @__PURE__ */ he.fromClass(class {
  constructor(n) {
    this.decorations = this.getDeco(n);
  }
  update(n) {
    (n.selectionSet || n.docChanged || n.viewportChanged) && (this.decorations = this.getDeco(n.view));
  }
  getDeco(n) {
    let e = n.state.facet(Bc), { state: t } = n, i = t.selection;
    if (i.ranges.length > 1)
      return C.none;
    let r = i.main, s, o = null;
    if (r.empty) {
      if (!e.highlightWordAroundCursor)
        return C.none;
      let a = t.wordAt(r.head);
      if (!a)
        return C.none;
      o = t.charCategorizer(r.head), s = t.sliceDoc(a.from, a.to);
    } else {
      let a = r.to - r.from;
      if (a < e.minSelectionLength || a > 200)
        return C.none;
      if (e.wholeWords) {
        if (s = t.sliceDoc(r.from, r.to), o = t.charCategorizer(r.head), !(El(o, t, r.from, r.to) && Qg(o, t, r.from, r.to)))
          return C.none;
      } else if (s = t.sliceDoc(r.from, r.to).trim(), !s)
        return C.none;
    }
    let l = [];
    for (let a of n.visibleRanges) {
      let h = new Ft(t.doc, s, a.from, a.to);
      for (; !h.next().done; ) {
        let { from: c, to: f } = h.value;
        if ((!o || El(o, t, c, f)) && (r.empty && c <= r.from && f >= r.to ? l.push(mg.range(c, f)) : (c >= r.to || f <= r.from) && l.push(gg.range(c, f)), l.length > e.maxMatches))
          return C.none;
      }
    }
    return C.set(l);
  }
}, {
  decorations: (n) => n.decorations
}), yg = /* @__PURE__ */ P.baseTheme({
  ".cm-selectionMatch": { backgroundColor: "#99ff7780" },
  ".cm-searchMatch .cm-selectionMatch": { backgroundColor: "transparent" }
}), Sg = ({ state: n, dispatch: e }) => {
  let { selection: t } = n, i = m.create(t.ranges.map((r) => n.wordAt(r.head) || m.cursor(r.head)), t.mainIndex);
  return i.eq(t) ? !1 : (e(n.update({ selection: i })), !0);
};
function xg(n, e) {
  let { main: t, ranges: i } = n.selection, r = n.wordAt(t.head), s = r && r.from == t.from && r.to == t.to;
  for (let o = !1, l = new Ft(n.doc, e, i[i.length - 1].to); ; )
    if (l.next(), l.done) {
      if (o)
        return null;
      l = new Ft(n.doc, e, 0, Math.max(0, i[i.length - 1].from - 1)), o = !0;
    } else {
      if (o && i.some((a) => a.from == l.value.from))
        continue;
      if (s) {
        let a = n.wordAt(l.value.from);
        if (!a || a.from != l.value.from || a.to != l.value.to)
          continue;
      }
      return l.value;
    }
}
const $g = ({ state: n, dispatch: e }) => {
  let { ranges: t } = n.selection;
  if (t.some((s) => s.from === s.to))
    return Sg({ state: n, dispatch: e });
  let i = n.sliceDoc(t[0].from, t[0].to);
  if (n.selection.ranges.some((s) => n.sliceDoc(s.from, s.to) != i))
    return !1;
  let r = xg(n, i);
  return r ? (e(n.update({
    selection: n.selection.addRange(m.range(r.from, r.to), !1),
    effects: P.scrollIntoView(r.to)
  })), !0) : !1;
}, Hs = /* @__PURE__ */ v.define({
  combine(n) {
    var e;
    return {
      top: n.reduce((t, i) => t != null ? t : i.top, void 0) || !1,
      caseSensitive: n.reduce((t, i) => t != null ? t : i.caseSensitive, void 0) || !1,
      createPanel: ((e = n.find((t) => t.createPanel)) === null || e === void 0 ? void 0 : e.createPanel) || ((t) => new Xg(t))
    };
  }
});
class Lc {
  constructor(e) {
    this.search = e.search, this.caseSensitive = !!e.caseSensitive, this.regexp = !!e.regexp, this.replace = e.replace || "", this.valid = !!this.search && (!this.regexp || fg(this.search)), this.unquoted = e.literal ? this.search : this.search.replace(/\\([nrt\\])/g, (t, i) => i == "n" ? `
` : i == "r" ? "\r" : i == "t" ? "	" : "\\");
  }
  eq(e) {
    return this.search == e.search && this.replace == e.replace && this.caseSensitive == e.caseSensitive && this.regexp == e.regexp;
  }
  create() {
    return this.regexp ? new wg(this) : new kg(this);
  }
  getCursor(e, t = 0, i = e.length) {
    return this.regexp ? jt(this, e, t, i) : Mt(this, e, t, i);
  }
}
class Uc {
  constructor(e) {
    this.spec = e;
  }
}
function Mt(n, e, t, i) {
  return new Ft(e, n.unquoted, t, i, n.caseSensitive ? void 0 : (r) => r.toLowerCase());
}
class kg extends Uc {
  constructor(e) {
    super(e);
  }
  nextMatch(e, t, i) {
    let r = Mt(this.spec, e, i, e.length).nextOverlapping();
    return r.done && (r = Mt(this.spec, e, 0, t).nextOverlapping()), r.done ? null : r.value;
  }
  prevMatchInRange(e, t, i) {
    for (let r = i; ; ) {
      let s = Math.max(t, r - 1e4 - this.spec.unquoted.length), o = Mt(this.spec, e, s, r), l = null;
      for (; !o.nextOverlapping().done; )
        l = o.value;
      if (l)
        return l;
      if (s == t)
        return null;
      r -= 1e4;
    }
  }
  prevMatch(e, t, i) {
    return this.prevMatchInRange(e, 0, t) || this.prevMatchInRange(e, i, e.length);
  }
  getReplacement(e) {
    return this.spec.replace;
  }
  matchAll(e, t) {
    let i = Mt(this.spec, e, 0, e.length), r = [];
    for (; !i.next().done; ) {
      if (r.length >= t)
        return null;
      r.push(i.value);
    }
    return r;
  }
  highlight(e, t, i, r) {
    let s = Mt(this.spec, e, Math.max(0, t - this.spec.unquoted.length), Math.min(i + this.spec.unquoted.length, e.length));
    for (; !s.next().done; )
      r(s.value.from, s.value.to);
  }
}
function jt(n, e, t, i) {
  return new Vc(e, n.search, n.caseSensitive ? void 0 : { ignoreCase: !0 }, t, i);
}
class wg extends Uc {
  nextMatch(e, t, i) {
    let r = jt(this.spec, e, i, e.length).next();
    return r.done && (r = jt(this.spec, e, 0, t).next()), r.done ? null : r.value;
  }
  prevMatchInRange(e, t, i) {
    for (let r = 1; ; r++) {
      let s = Math.max(t, i - r * 1e4), o = jt(this.spec, e, s, i), l = null;
      for (; !o.next().done; )
        l = o.value;
      if (l && (s == t || l.from > s + 10))
        return l;
      if (s == t)
        return null;
    }
  }
  prevMatch(e, t, i) {
    return this.prevMatchInRange(e, 0, t) || this.prevMatchInRange(e, i, e.length);
  }
  getReplacement(e) {
    return this.spec.replace.replace(/\$([$&\d+])/g, (t, i) => i == "$" ? "$" : i == "&" ? e.match[0] : i != "0" && +i < e.match.length ? e.match[i] : t);
  }
  matchAll(e, t) {
    let i = jt(this.spec, e, 0, e.length), r = [];
    for (; !i.next().done; ) {
      if (r.length >= t)
        return null;
      r.push(i.value);
    }
    return r;
  }
  highlight(e, t, i, r) {
    let s = jt(this.spec, e, Math.max(0, t - 250), Math.min(i + 250, e.length));
    for (; !s.next().done; )
      r(s.value.from, s.value.to);
  }
}
const vi = /* @__PURE__ */ Z.define(), Js = /* @__PURE__ */ Z.define(), ut = /* @__PURE__ */ Oe.define({
  create(n) {
    return new Rr(Ts(n).create(), null);
  },
  update(n, e) {
    for (let t of e.effects)
      t.is(vi) ? n = new Rr(t.value.create(), n.panel) : t.is(Js) && (n = new Rr(n.query, t.value ? Ks : null));
    return n;
  },
  provide: (n) => yn.from(n, (e) => e.panel)
});
class Rr {
  constructor(e, t) {
    this.query = e, this.panel = t;
  }
}
const Tg = /* @__PURE__ */ C.mark({ class: "cm-searchMatch" }), vg = /* @__PURE__ */ C.mark({ class: "cm-searchMatch cm-searchMatch-selected" }), Pg = /* @__PURE__ */ he.fromClass(class {
  constructor(n) {
    this.view = n, this.decorations = this.highlight(n.state.field(ut));
  }
  update(n) {
    let e = n.state.field(ut);
    (e != n.startState.field(ut) || n.docChanged || n.selectionSet || n.viewportChanged) && (this.decorations = this.highlight(e));
  }
  highlight({ query: n, panel: e }) {
    if (!e || !n.spec.valid)
      return C.none;
    let { view: t } = this, i = new pt();
    for (let r = 0, s = t.visibleRanges, o = s.length; r < o; r++) {
      let { from: l, to: a } = s[r];
      for (; r < o - 1 && a > s[r + 1].from - 2 * 250; )
        a = s[++r].to;
      n.highlight(t.state.doc, l, a, (h, c) => {
        let f = t.state.selection.ranges.some((u) => u.from == h && u.to == c);
        i.add(h, c, f ? vg : Tg);
      });
    }
    return i.finish();
  }
}, {
  decorations: (n) => n.decorations
});
function Wi(n) {
  return (e) => {
    let t = e.state.field(ut, !1);
    return t && t.query.spec.valid ? n(e, t) : Yc(e);
  };
}
const Cn = /* @__PURE__ */ Wi((n, { query: e }) => {
  let { to: t } = n.state.selection.main, i = e.nextMatch(n.state.doc, t, t);
  return i ? (n.dispatch({
    selection: { anchor: i.from, head: i.to },
    scrollIntoView: !0,
    effects: eo(n, i),
    userEvent: "select.search"
  }), !0) : !1;
}), An = /* @__PURE__ */ Wi((n, { query: e }) => {
  let { state: t } = n, { from: i } = t.selection.main, r = e.prevMatch(t.doc, i, i);
  return r ? (n.dispatch({
    selection: { anchor: r.from, head: r.to },
    scrollIntoView: !0,
    effects: eo(n, r),
    userEvent: "select.search"
  }), !0) : !1;
}), Rg = /* @__PURE__ */ Wi((n, { query: e }) => {
  let t = e.matchAll(n.state.doc, 1e3);
  return !t || !t.length ? !1 : (n.dispatch({
    selection: m.create(t.map((i) => m.range(i.from, i.to))),
    userEvent: "select.search.matches"
  }), !0);
}), Cg = ({ state: n, dispatch: e }) => {
  let t = n.selection;
  if (t.ranges.length > 1 || t.main.empty)
    return !1;
  let { from: i, to: r } = t.main, s = [], o = 0;
  for (let l = new Ft(n.doc, n.sliceDoc(i, r)); !l.next().done; ) {
    if (s.length > 1e3)
      return !1;
    l.value.from == i && (o = s.length), s.push(m.range(l.value.from, l.value.to));
  }
  return e(n.update({
    selection: m.create(s, o),
    userEvent: "select.search.matches"
  })), !0;
}, _l = /* @__PURE__ */ Wi((n, { query: e }) => {
  let { state: t } = n, { from: i, to: r } = t.selection.main;
  if (t.readOnly)
    return !1;
  let s = e.nextMatch(t.doc, i, i);
  if (!s)
    return !1;
  let o = [], l, a, h = [];
  if (s.from == i && s.to == r && (a = t.toText(e.getReplacement(s)), o.push({ from: s.from, to: s.to, insert: a }), s = e.nextMatch(t.doc, s.from, s.to), h.push(P.announce.of(t.phrase("replaced match on line $", t.doc.lineAt(i).number) + "."))), s) {
    let c = o.length == 0 || o[0].from >= s.to ? 0 : s.to - s.from - a.length;
    l = { anchor: s.from - c, head: s.to - c }, h.push(eo(n, s));
  }
  return n.dispatch({
    changes: o,
    selection: l,
    scrollIntoView: !!l,
    effects: h,
    userEvent: "input.replace"
  }), !0;
}), Ag = /* @__PURE__ */ Wi((n, { query: e }) => {
  if (n.state.readOnly)
    return !1;
  let t = e.matchAll(n.state.doc, 1e9).map((r) => {
    let { from: s, to: o } = r;
    return { from: s, to: o, insert: e.getReplacement(r) };
  });
  if (!t.length)
    return !1;
  let i = n.state.phrase("replaced $ matches", t.length) + ".";
  return n.dispatch({
    changes: t,
    effects: P.announce.of(i),
    userEvent: "input.replace.all"
  }), !0;
});
function Ks(n) {
  return n.state.facet(Hs).createPanel(n);
}
function Ts(n, e) {
  var t;
  let i = n.selection.main, r = i.empty || i.to > i.from + 100 ? "" : n.sliceDoc(i.from, i.to), s = (t = e == null ? void 0 : e.caseSensitive) !== null && t !== void 0 ? t : n.facet(Hs).caseSensitive;
  return e && !r ? e : new Lc({ search: r.replace(/\n/g, "\\n"), caseSensitive: s });
}
const Yc = (n) => {
  let e = n.state.field(ut, !1);
  if (e && e.panel) {
    let t = bn(n, Ks);
    if (!t)
      return !1;
    let i = t.dom.querySelector("[main-field]");
    if (i && i != n.root.activeElement) {
      let r = Ts(n.state, e.query.spec);
      r.valid && n.dispatch({ effects: vi.of(r) }), i.focus(), i.select();
    }
  } else
    n.dispatch({ effects: [
      Js.of(!0),
      e ? vi.of(Ts(n.state, e.query.spec)) : Z.appendConfig.of(Dg)
    ] });
  return !0;
}, Fc = (n) => {
  let e = n.state.field(ut, !1);
  if (!e || !e.panel)
    return !1;
  let t = bn(n, Ks);
  return t && t.dom.contains(n.root.activeElement) && n.focus(), n.dispatch({ effects: Js.of(!1) }), !0;
}, Wg = [
  { key: "Mod-f", run: Yc, scope: "editor search-panel" },
  { key: "F3", run: Cn, shift: An, scope: "editor search-panel", preventDefault: !0 },
  { key: "Mod-g", run: Cn, shift: An, scope: "editor search-panel", preventDefault: !0 },
  { key: "Escape", run: Fc, scope: "editor search-panel" },
  { key: "Mod-Shift-l", run: Cg },
  { key: "Alt-g", run: ug },
  { key: "Mod-d", run: $g, preventDefault: !0 }
];
class Xg {
  constructor(e) {
    this.view = e;
    let t = this.query = e.state.field(ut).query.spec;
    this.commit = this.commit.bind(this), this.searchField = pe("input", {
      value: t.search,
      placeholder: we(e, "Find"),
      "aria-label": we(e, "Find"),
      class: "cm-textfield",
      name: "search",
      "main-field": "true",
      onchange: this.commit,
      onkeyup: this.commit
    }), this.replaceField = pe("input", {
      value: t.replace,
      placeholder: we(e, "Replace"),
      "aria-label": we(e, "Replace"),
      class: "cm-textfield",
      name: "replace",
      onchange: this.commit,
      onkeyup: this.commit
    }), this.caseField = pe("input", {
      type: "checkbox",
      name: "case",
      checked: t.caseSensitive,
      onchange: this.commit
    }), this.reField = pe("input", {
      type: "checkbox",
      name: "re",
      checked: t.regexp,
      onchange: this.commit
    });
    function i(r, s, o) {
      return pe("button", { class: "cm-button", name: r, onclick: s, type: "button" }, o);
    }
    this.dom = pe("div", { onkeydown: (r) => this.keydown(r), class: "cm-search" }, [
      this.searchField,
      i("next", () => Cn(e), [we(e, "next")]),
      i("prev", () => An(e), [we(e, "previous")]),
      i("select", () => Rg(e), [we(e, "all")]),
      pe("label", null, [this.caseField, we(e, "match case")]),
      pe("label", null, [this.reField, we(e, "regexp")]),
      ...e.state.readOnly ? [] : [
        pe("br"),
        this.replaceField,
        i("replace", () => _l(e), [we(e, "replace")]),
        i("replaceAll", () => Ag(e), [we(e, "replace all")]),
        pe("button", {
          name: "close",
          onclick: () => Fc(e),
          "aria-label": we(e, "close"),
          type: "button"
        }, ["\xD7"])
      ]
    ]);
  }
  commit() {
    let e = new Lc({
      search: this.searchField.value,
      caseSensitive: this.caseField.checked,
      regexp: this.reField.checked,
      replace: this.replaceField.value
    });
    e.eq(this.query) || (this.query = e, this.view.dispatch({ effects: vi.of(e) }));
  }
  keydown(e) {
    pd(this.view, e, "search-panel") ? e.preventDefault() : e.keyCode == 13 && e.target == this.searchField ? (e.preventDefault(), (e.shiftKey ? An : Cn)(this.view)) : e.keyCode == 13 && e.target == this.replaceField && (e.preventDefault(), _l(this.view));
  }
  update(e) {
    for (let t of e.transactions)
      for (let i of t.effects)
        i.is(vi) && !i.value.eq(this.query) && this.setQuery(i.value);
  }
  setQuery(e) {
    this.query = e, this.searchField.value = e.search, this.replaceField.value = e.replace, this.caseField.checked = e.caseSensitive, this.reField.checked = e.regexp;
  }
  mount() {
    this.searchField.select();
  }
  get pos() {
    return 80;
  }
  get top() {
    return this.view.state.facet(Hs).top;
  }
}
function we(n, e) {
  return n.state.phrase(e);
}
const Ui = 30, Yi = /[\s\.,:;?!]/;
function eo(n, { from: e, to: t }) {
  let i = n.state.doc.lineAt(e), r = n.state.doc.lineAt(t).to, s = Math.max(i.from, e - Ui), o = Math.min(r, t + Ui), l = n.state.sliceDoc(s, o);
  if (s != i.from) {
    for (let a = 0; a < Ui; a++)
      if (!Yi.test(l[a + 1]) && Yi.test(l[a])) {
        l = l.slice(a);
        break;
      }
  }
  if (o != r) {
    for (let a = l.length - 1; a > l.length - Ui; a--)
      if (!Yi.test(l[a - 1]) && Yi.test(l[a])) {
        l = l.slice(0, a);
        break;
      }
  }
  return P.announce.of(`${n.state.phrase("current match")}. ${l} ${n.state.phrase("on line")} ${i.number}.`);
}
const Zg = /* @__PURE__ */ P.baseTheme({
  ".cm-panel.cm-search": {
    padding: "2px 6px 4px",
    position: "relative",
    "& [name=close]": {
      position: "absolute",
      top: "0",
      right: "4px",
      backgroundColor: "inherit",
      border: "none",
      font: "inherit",
      padding: 0,
      margin: 0
    },
    "& input, & button, & label": {
      margin: ".2em .6em .2em 0"
    },
    "& input[type=checkbox]": {
      marginRight: ".2em"
    },
    "& label": {
      fontSize: "80%",
      whiteSpace: "pre"
    }
  },
  "&light .cm-searchMatch": { backgroundColor: "#ffff0054" },
  "&dark .cm-searchMatch": { backgroundColor: "#00ffff8a" },
  "&light .cm-searchMatch-selected": { backgroundColor: "#ff6a0054" },
  "&dark .cm-searchMatch-selected": { backgroundColor: "#ff00ff8a" }
}), Dg = [
  ut,
  /* @__PURE__ */ Ct.lowest(Pg),
  Zg
];
class Hc {
  constructor(e, t, i) {
    this.state = e, this.pos = t, this.explicit = i, this.abortListeners = [];
  }
  tokenBefore(e) {
    let t = Y(this.state).resolveInner(this.pos, -1);
    for (; t && e.indexOf(t.name) < 0; )
      t = t.parent;
    return t ? {
      from: t.from,
      to: this.pos,
      text: this.state.sliceDoc(t.from, this.pos),
      type: t.type
    } : null;
  }
  matchBefore(e) {
    let t = this.state.doc.lineAt(this.pos), i = Math.max(t.from, this.pos - 250), r = t.text.slice(i - t.from, this.pos - t.from), s = r.search(Kc(e, !1));
    return s < 0 ? null : { from: i + s, to: this.pos, text: r.slice(s) };
  }
  get aborted() {
    return this.abortListeners == null;
  }
  addEventListener(e, t) {
    e == "abort" && this.abortListeners && this.abortListeners.push(t);
  }
}
function Il(n) {
  let e = Object.keys(n).join(""), t = /\w/.test(e);
  return t && (e = e.replace(/\w/g, "")), `[${t ? "\\w" : ""}${e.replace(/[^\w\s]/g, "\\$&")}]`;
}
function Mg(n) {
  let e = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ Object.create(null);
  for (let { label: r } of n) {
    e[r[0]] = !0;
    for (let s = 1; s < r.length; s++)
      t[r[s]] = !0;
  }
  let i = Il(e) + Il(t) + "*$";
  return [new RegExp("^" + i), new RegExp(i)];
}
function Jc(n) {
  let e = n.map((r) => typeof r == "string" ? { label: r } : r), [t, i] = e.every((r) => /^\w+$/.test(r.label)) ? [/\w*$/, /\w+$/] : Mg(e);
  return (r) => {
    let s = r.matchBefore(i);
    return s || r.explicit ? { from: s ? s.from : r.pos, options: e, validFor: t } : null;
  };
}
function jg(n, e) {
  return (t) => {
    for (let i = Y(t.state).resolveInner(t.pos, -1); i; i = i.parent)
      if (n.indexOf(i.name) > -1)
        return null;
    return e(t);
  };
}
class Gl {
  constructor(e, t, i) {
    this.completion = e, this.source = t, this.match = i;
  }
}
function dt(n) {
  return n.selection.main.head;
}
function Kc(n, e) {
  var t;
  let { source: i } = n, r = e && i[0] != "^", s = i[i.length - 1] != "$";
  return !r && !s ? n : new RegExp(`${r ? "^" : ""}(?:${i})${s ? "$" : ""}`, (t = n.flags) !== null && t !== void 0 ? t : n.ignoreCase ? "i" : "");
}
function zg(n, e, t, i) {
  return Object.assign(Object.assign({}, n.changeByRange((r) => {
    if (r == n.selection.main)
      return {
        changes: { from: t, to: i, insert: e },
        range: m.cursor(t + e.length)
      };
    let s = i - t;
    return !r.empty || s && n.sliceDoc(r.from - s, r.from) != n.sliceDoc(t, i) ? { range: r } : {
      changes: { from: r.from - s, to: r.from, insert: e },
      range: m.cursor(r.from - s + e.length)
    };
  })), { userEvent: "input.complete" });
}
function ef(n, e) {
  const t = e.completion.apply || e.completion.label;
  let i = e.source;
  typeof t == "string" ? n.dispatch(zg(n.state, t, i.from, i.to)) : t(n, e.completion, i.from, i.to);
}
const Vl = /* @__PURE__ */ new WeakMap();
function qg(n) {
  if (!Array.isArray(n))
    return n;
  let e = Vl.get(n);
  return e || Vl.set(n, e = Jc(n)), e;
}
class Eg {
  constructor(e) {
    this.pattern = e, this.chars = [], this.folded = [], this.any = [], this.precise = [], this.byWord = [];
    for (let t = 0; t < e.length; ) {
      let i = ne(e, t), r = xe(i);
      this.chars.push(i);
      let s = e.slice(t, t + r), o = s.toUpperCase();
      this.folded.push(ne(o == s ? s.toLowerCase() : o, 0)), t += r;
    }
    this.astral = e.length != this.chars.length;
  }
  match(e) {
    if (this.pattern.length == 0)
      return [0];
    if (e.length < this.pattern.length)
      return null;
    let { chars: t, folded: i, any: r, precise: s, byWord: o } = this;
    if (t.length == 1) {
      let k = ne(e, 0);
      return k == t[0] ? [0, 0, xe(k)] : k == i[0] ? [-200, 0, xe(k)] : null;
    }
    let l = e.indexOf(this.pattern);
    if (l == 0)
      return [0, 0, this.pattern.length];
    let a = t.length, h = 0;
    if (l < 0) {
      for (let k = 0, T = Math.min(e.length, 200); k < T && h < a; ) {
        let x = ne(e, k);
        (x == t[h] || x == i[h]) && (r[h++] = k), k += xe(x);
      }
      if (h < a)
        return null;
    }
    let c = 0, f = 0, u = !1, d = 0, O = -1, g = -1, Q = /[a-z]/.test(e), b = !0;
    for (let k = 0, T = Math.min(e.length, 200), x = 0; k < T && f < a; ) {
      let $ = ne(e, k);
      l < 0 && (c < a && $ == t[c] && (s[c++] = k), d < a && ($ == t[d] || $ == i[d] ? (d == 0 && (O = k), g = k + 1, d++) : d = 0));
      let R, A = $ < 255 ? $ >= 48 && $ <= 57 || $ >= 97 && $ <= 122 ? 2 : $ >= 65 && $ <= 90 ? 1 : 0 : (R = As($)) != R.toLowerCase() ? 1 : R != R.toUpperCase() ? 2 : 0;
      (!k || A == 1 && Q || x == 0 && A != 0) && (t[f] == $ || i[f] == $ && (u = !0) ? o[f++] = k : o.length && (b = !1)), x = A, k += xe($);
    }
    return f == a && o[0] == 0 && b ? this.result(-100 + (u ? -200 : 0), o, e) : d == a && O == 0 ? [-200 - e.length, 0, g] : l > -1 ? [-700 - e.length, l, l + this.pattern.length] : d == a ? [-200 + -700 - e.length, O, g] : f == a ? this.result(-100 + (u ? -200 : 0) + -700 + (b ? 0 : -1100), o, e) : t.length == 2 ? null : this.result((r[0] ? -700 : 0) + -200 + -1100, r, e);
  }
  result(e, t, i) {
    let r = [e - i.length], s = 1;
    for (let o of t) {
      let l = o + (this.astral ? xe(ne(i, o)) : 1);
      s > 1 && r[s - 1] == o ? r[s - 1] = l : (r[s++] = o, r[s++] = l);
    }
    return r;
  }
}
const Ye = /* @__PURE__ */ v.define({
  combine(n) {
    return yt(n, {
      activateOnTyping: !0,
      selectOnOpen: !0,
      override: null,
      closeOnBlur: !0,
      maxRenderedOptions: 100,
      defaultKeymap: !0,
      optionClass: () => "",
      aboveCursor: !1,
      icons: !0,
      addToOptions: [],
      compareCompletions: (e, t) => e.label.localeCompare(t.label)
    }, {
      defaultKeymap: (e, t) => e && t,
      closeOnBlur: (e, t) => e && t,
      icons: (e, t) => e && t,
      optionClass: (e, t) => (i) => _g(e(i), t(i)),
      addToOptions: (e, t) => e.concat(t)
    });
  }
});
function _g(n, e) {
  return n ? e ? n + " " + e : n : e;
}
function Ig(n) {
  let e = n.addToOptions.slice();
  return n.icons && e.push({
    render(t) {
      let i = document.createElement("div");
      return i.classList.add("cm-completionIcon"), t.type && i.classList.add(...t.type.split(/\s+/g).map((r) => "cm-completionIcon-" + r)), i.setAttribute("aria-hidden", "true"), i;
    },
    position: 20
  }), e.push({
    render(t, i, r) {
      let s = document.createElement("span");
      s.className = "cm-completionLabel";
      let { label: o } = t, l = 0;
      for (let a = 1; a < r.length; ) {
        let h = r[a++], c = r[a++];
        h > l && s.appendChild(document.createTextNode(o.slice(l, h)));
        let f = s.appendChild(document.createElement("span"));
        f.appendChild(document.createTextNode(o.slice(h, c))), f.className = "cm-completionMatchedText", l = c;
      }
      return l < o.length && s.appendChild(document.createTextNode(o.slice(l))), s;
    },
    position: 50
  }, {
    render(t) {
      if (!t.detail)
        return null;
      let i = document.createElement("span");
      return i.className = "cm-completionDetail", i.textContent = t.detail, i;
    },
    position: 80
  }), e.sort((t, i) => t.position - i.position).map((t) => t.render);
}
function Nl(n, e, t) {
  if (n <= t)
    return { from: 0, to: n };
  if (e < 0 && (e = 0), e <= n >> 1) {
    let r = Math.floor(e / t);
    return { from: r * t, to: (r + 1) * t };
  }
  let i = Math.floor((n - e) / t);
  return { from: n - (i + 1) * t, to: n - i * t };
}
class Gg {
  constructor(e, t) {
    this.view = e, this.stateField = t, this.info = null, this.placeInfo = {
      read: () => this.measureInfo(),
      write: (l) => this.positionInfo(l),
      key: this
    };
    let i = e.state.field(t), { options: r, selected: s } = i.open, o = e.state.facet(Ye);
    this.optionContent = Ig(o), this.optionClass = o.optionClass, this.range = Nl(r.length, s, o.maxRenderedOptions), this.dom = document.createElement("div"), this.dom.className = "cm-tooltip-autocomplete", this.dom.addEventListener("mousedown", (l) => {
      for (let a = l.target, h; a && a != this.dom; a = a.parentNode)
        if (a.nodeName == "LI" && (h = /-(\d+)$/.exec(a.id)) && +h[1] < r.length) {
          ef(e, r[+h[1]]), l.preventDefault();
          return;
        }
    }), this.list = this.dom.appendChild(this.createListBox(r, i.id, this.range)), this.list.addEventListener("scroll", () => {
      this.info && this.view.requestMeasure(this.placeInfo);
    });
  }
  mount() {
    this.updateSel();
  }
  update(e) {
    e.state.field(this.stateField) != e.startState.field(this.stateField) && this.updateSel();
  }
  positioned() {
    this.info && this.view.requestMeasure(this.placeInfo);
  }
  updateSel() {
    let e = this.view.state.field(this.stateField), t = e.open;
    if ((t.selected < this.range.from || t.selected >= this.range.to) && (this.range = Nl(t.options.length, t.selected, this.view.state.facet(Ye).maxRenderedOptions), this.list.remove(), this.list = this.dom.appendChild(this.createListBox(t.options, e.id, this.range)), this.list.addEventListener("scroll", () => {
      this.info && this.view.requestMeasure(this.placeInfo);
    })), this.updateSelectedOption(t.selected)) {
      this.info && (this.info.remove(), this.info = null);
      let { completion: i } = t.options[t.selected], { info: r } = i;
      if (!r)
        return;
      let s = typeof r == "string" ? document.createTextNode(r) : r(i);
      if (!s)
        return;
      "then" in s ? s.then((o) => {
        o && this.view.state.field(this.stateField, !1) == e && this.addInfoPane(o);
      }).catch((o) => Me(this.view.state, o, "completion info")) : this.addInfoPane(s);
    }
  }
  addInfoPane(e) {
    let t = this.info = document.createElement("div");
    t.className = "cm-tooltip cm-completionInfo", t.appendChild(e), this.dom.appendChild(t), this.view.requestMeasure(this.placeInfo);
  }
  updateSelectedOption(e) {
    let t = null;
    for (let i = this.list.firstChild, r = this.range.from; i; i = i.nextSibling, r++)
      r == e ? i.hasAttribute("aria-selected") || (i.setAttribute("aria-selected", "true"), t = i) : i.hasAttribute("aria-selected") && i.removeAttribute("aria-selected");
    return t && Ng(this.list, t), t;
  }
  measureInfo() {
    let e = this.dom.querySelector("[aria-selected]");
    if (!e || !this.info)
      return null;
    let t = this.dom.getBoundingClientRect(), i = this.info.getBoundingClientRect(), r = e.getBoundingClientRect();
    if (r.top > Math.min(innerHeight, t.bottom) - 10 || r.bottom < Math.max(0, t.top) + 10)
      return null;
    let s = Math.max(0, Math.min(r.top, innerHeight - i.height)) - t.top, o = this.view.textDirection == U.RTL, l = t.left, a = innerWidth - t.right;
    return o && l < Math.min(i.width, a) ? o = !1 : !o && a < Math.min(i.width, l) && (o = !0), { top: s, left: o };
  }
  positionInfo(e) {
    this.info && (this.info.style.top = (e ? e.top : -1e6) + "px", e && (this.info.classList.toggle("cm-completionInfo-left", e.left), this.info.classList.toggle("cm-completionInfo-right", !e.left)));
  }
  createListBox(e, t, i) {
    const r = document.createElement("ul");
    r.id = t, r.setAttribute("role", "listbox"), r.setAttribute("aria-expanded", "true"), r.setAttribute("aria-label", this.view.state.phrase("Completions"));
    for (let s = i.from; s < i.to; s++) {
      let { completion: o, match: l } = e[s];
      const a = r.appendChild(document.createElement("li"));
      a.id = t + "-" + s, a.setAttribute("role", "option");
      let h = this.optionClass(o);
      h && (a.className = h);
      for (let c of this.optionContent) {
        let f = c(o, this.view.state, l);
        f && a.appendChild(f);
      }
    }
    return i.from && r.classList.add("cm-completionListIncompleteTop"), i.to < e.length && r.classList.add("cm-completionListIncompleteBottom"), r;
  }
}
function Vg(n) {
  return (e) => new Gg(e, n);
}
function Ng(n, e) {
  let t = n.getBoundingClientRect(), i = e.getBoundingClientRect();
  i.top < t.top ? n.scrollTop -= t.top - i.top : i.bottom > t.bottom && (n.scrollTop += i.bottom - t.bottom);
}
function Bl(n) {
  return (n.boost || 0) * 100 + (n.apply ? 10 : 0) + (n.info ? 5 : 0) + (n.type ? 1 : 0);
}
function Bg(n, e) {
  let t = [], i = 0;
  for (let l of n)
    if (l.hasResult())
      if (l.result.filter === !1) {
        let a = l.result.getMatch;
        for (let h of l.result.options) {
          let c = [1e9 - i++];
          if (a)
            for (let f of a(h))
              c.push(f);
          t.push(new Gl(h, l, c));
        }
      } else {
        let a = new Eg(e.sliceDoc(l.from, l.to)), h;
        for (let c of l.result.options)
          (h = a.match(c.label)) && (c.boost != null && (h[0] += c.boost), t.push(new Gl(c, l, h)));
      }
  let r = [], s = null, o = e.facet(Ye).compareCompletions;
  for (let l of t.sort((a, h) => h.match[0] - a.match[0] || o(a.completion, h.completion)))
    !s || s.label != l.completion.label || s.detail != l.completion.detail || s.type != null && l.completion.type != null && s.type != l.completion.type || s.apply != l.completion.apply ? r.push(l) : Bl(l.completion) > Bl(s) && (r[r.length - 1] = l), s = l.completion;
  return r;
}
class gi {
  constructor(e, t, i, r, s) {
    this.options = e, this.attrs = t, this.tooltip = i, this.timestamp = r, this.selected = s;
  }
  setSelected(e, t) {
    return e == this.selected || e >= this.options.length ? this : new gi(this.options, Ll(t, e), this.tooltip, this.timestamp, e);
  }
  static build(e, t, i, r, s) {
    let o = Bg(e, t);
    if (!o.length)
      return null;
    let l = t.facet(Ye).selectOnOpen ? 0 : -1;
    if (r && r.selected != l && r.selected != -1) {
      let a = r.options[r.selected].completion;
      for (let h = 0; h < o.length; h++)
        if (o[h].completion == a) {
          l = h;
          break;
        }
    }
    return new gi(o, Ll(i, l), {
      pos: e.reduce((a, h) => h.hasResult() ? Math.min(a, h.from) : a, 1e8),
      create: Vg(Te),
      above: s.aboveCursor
    }, r ? r.timestamp : Date.now(), l);
  }
  map(e) {
    return new gi(this.options, this.attrs, Object.assign(Object.assign({}, this.tooltip), { pos: e.mapPos(this.tooltip.pos) }), this.timestamp, this.selected);
  }
}
class Wn {
  constructor(e, t, i) {
    this.active = e, this.id = t, this.open = i;
  }
  static start() {
    return new Wn(Yg, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
  }
  update(e) {
    let { state: t } = e, i = t.facet(Ye), s = (i.override || t.languageDataAt("autocomplete", dt(t)).map(qg)).map((l) => (this.active.find((h) => h.source == l) || new ge(l, this.active.some((h) => h.state != 0) ? 1 : 0)).update(e, i));
    s.length == this.active.length && s.every((l, a) => l == this.active[a]) && (s = this.active);
    let o = e.selection || s.some((l) => l.hasResult() && e.changes.touchesRange(l.from, l.to)) || !Lg(s, this.active) ? gi.build(s, t, this.id, this.open, i) : this.open && e.docChanged ? this.open.map(e.changes) : this.open;
    !o && s.every((l) => l.state != 1) && s.some((l) => l.hasResult()) && (s = s.map((l) => l.hasResult() ? new ge(l.source, 0) : l));
    for (let l of e.effects)
      l.is(nf) && (o = o && o.setSelected(l.value, this.id));
    return s == this.active && o == this.open ? this : new Wn(s, this.id, o);
  }
  get tooltip() {
    return this.open ? this.open.tooltip : null;
  }
  get attrs() {
    return this.open ? this.open.attrs : Ug;
  }
}
function Lg(n, e) {
  if (n == e)
    return !0;
  for (let t = 0, i = 0; ; ) {
    for (; t < n.length && !n[t].hasResult; )
      t++;
    for (; i < e.length && !e[i].hasResult; )
      i++;
    let r = t == n.length, s = i == e.length;
    if (r || s)
      return r == s;
    if (n[t++].result != e[i++].result)
      return !1;
  }
}
const Ug = {
  "aria-autocomplete": "list"
};
function Ll(n, e) {
  let t = {
    "aria-autocomplete": "list",
    "aria-haspopup": "listbox",
    "aria-controls": n
  };
  return e > -1 && (t["aria-activedescendant"] = n + "-" + e), t;
}
const Yg = [];
function vs(n) {
  return n.isUserEvent("input.type") ? "input" : n.isUserEvent("delete.backward") ? "delete" : null;
}
class ge {
  constructor(e, t, i = -1) {
    this.source = e, this.state = t, this.explicitPos = i;
  }
  hasResult() {
    return !1;
  }
  update(e, t) {
    let i = vs(e), r = this;
    i ? r = r.handleUserEvent(e, i, t) : e.docChanged ? r = r.handleChange(e) : e.selection && r.state != 0 && (r = new ge(r.source, 0));
    for (let s of e.effects)
      if (s.is(to))
        r = new ge(r.source, 1, s.value ? dt(e.state) : -1);
      else if (s.is(Xn))
        r = new ge(r.source, 0);
      else if (s.is(tf))
        for (let o of s.value)
          o.source == r.source && (r = o);
    return r;
  }
  handleUserEvent(e, t, i) {
    return t == "delete" || !i.activateOnTyping ? this.map(e.changes) : new ge(this.source, 1);
  }
  handleChange(e) {
    return e.changes.touchesRange(dt(e.startState)) ? new ge(this.source, 0) : this.map(e.changes);
  }
  map(e) {
    return e.empty || this.explicitPos < 0 ? this : new ge(this.source, this.state, e.mapPos(this.explicitPos));
  }
}
class mi extends ge {
  constructor(e, t, i, r, s) {
    super(e, 2, t), this.result = i, this.from = r, this.to = s;
  }
  hasResult() {
    return !0;
  }
  handleUserEvent(e, t, i) {
    var r;
    let s = e.changes.mapPos(this.from), o = e.changes.mapPos(this.to, 1), l = dt(e.state);
    if ((this.explicitPos < 0 ? l <= s : l < this.from) || l > o || t == "delete" && dt(e.startState) == this.from)
      return new ge(this.source, t == "input" && i.activateOnTyping ? 1 : 0);
    let a = this.explicitPos < 0 ? -1 : e.changes.mapPos(this.explicitPos), h;
    return Fg(this.result.validFor, e.state, s, o) ? new mi(this.source, a, this.result, s, o) : this.result.update && (h = this.result.update(this.result, s, o, new Hc(e.state, l, a >= 0))) ? new mi(this.source, a, h, h.from, (r = h.to) !== null && r !== void 0 ? r : dt(e.state)) : new ge(this.source, 1, a);
  }
  handleChange(e) {
    return e.changes.touchesRange(this.from, this.to) ? new ge(this.source, 0) : this.map(e.changes);
  }
  map(e) {
    return e.empty ? this : new mi(this.source, this.explicitPos < 0 ? -1 : e.mapPos(this.explicitPos), this.result, e.mapPos(this.from), e.mapPos(this.to, 1));
  }
}
function Fg(n, e, t, i) {
  if (!n)
    return !1;
  let r = e.sliceDoc(t, i);
  return typeof n == "function" ? n(r, t, i, e) : Kc(n, !0).test(r);
}
const to = /* @__PURE__ */ Z.define(), Xn = /* @__PURE__ */ Z.define(), tf = /* @__PURE__ */ Z.define({
  map(n, e) {
    return n.map((t) => t.map(e));
  }
}), nf = /* @__PURE__ */ Z.define(), Te = /* @__PURE__ */ Oe.define({
  create() {
    return Wn.start();
  },
  update(n, e) {
    return n.update(e);
  },
  provide: (n) => [
    jh.from(n, (e) => e.tooltip),
    P.contentAttributes.from(n, (e) => e.attrs)
  ]
}), rf = 75;
function Fi(n, e = "option") {
  return (t) => {
    let i = t.state.field(Te, !1);
    if (!i || !i.open || Date.now() - i.open.timestamp < rf)
      return !1;
    let r = 1, s;
    e == "page" && (s = _d(t, i.open.tooltip)) && (r = Math.max(2, Math.floor(s.dom.offsetHeight / s.dom.querySelector("li").offsetHeight) - 1));
    let { length: o } = i.open.options, l = i.open.selected > -1 ? i.open.selected + r * (n ? 1 : -1) : n ? 0 : o - 1;
    return l < 0 ? l = e == "page" ? 0 : o - 1 : l >= o && (l = e == "page" ? o - 1 : 0), t.dispatch({ effects: nf.of(l) }), !0;
  };
}
const Hg = (n) => {
  let e = n.state.field(Te, !1);
  return n.state.readOnly || !e || !e.open || Date.now() - e.open.timestamp < rf || e.open.selected < 0 ? !1 : (ef(n, e.open.options[e.open.selected]), !0);
}, Jg = (n) => n.state.field(Te, !1) ? (n.dispatch({ effects: to.of(!0) }), !0) : !1, Kg = (n) => {
  let e = n.state.field(Te, !1);
  return !e || !e.active.some((t) => t.state != 0) ? !1 : (n.dispatch({ effects: Xn.of(null) }), !0);
};
class em {
  constructor(e, t) {
    this.active = e, this.context = t, this.time = Date.now(), this.updates = [], this.done = void 0;
  }
}
const Ul = 50, tm = 50, im = 1e3, nm = /* @__PURE__ */ he.fromClass(class {
  constructor(n) {
    this.view = n, this.debounceUpdate = -1, this.running = [], this.debounceAccept = -1, this.composing = 0;
    for (let e of n.state.field(Te).active)
      e.state == 1 && this.startQuery(e);
  }
  update(n) {
    let e = n.state.field(Te);
    if (!n.selectionSet && !n.docChanged && n.startState.field(Te) == e)
      return;
    let t = n.transactions.some((i) => (i.selection || i.docChanged) && !vs(i));
    for (let i = 0; i < this.running.length; i++) {
      let r = this.running[i];
      if (t || r.updates.length + n.transactions.length > tm && Date.now() - r.time > im) {
        for (let s of r.context.abortListeners)
          try {
            s();
          } catch (o) {
            Me(this.view.state, o);
          }
        r.context.abortListeners = null, this.running.splice(i--, 1);
      } else
        r.updates.push(...n.transactions);
    }
    if (this.debounceUpdate > -1 && clearTimeout(this.debounceUpdate), this.debounceUpdate = e.active.some((i) => i.state == 1 && !this.running.some((r) => r.active.source == i.source)) ? setTimeout(() => this.startUpdate(), Ul) : -1, this.composing != 0)
      for (let i of n.transactions)
        vs(i) == "input" ? this.composing = 2 : this.composing == 2 && i.selection && (this.composing = 3);
  }
  startUpdate() {
    this.debounceUpdate = -1;
    let { state: n } = this.view, e = n.field(Te);
    for (let t of e.active)
      t.state == 1 && !this.running.some((i) => i.active.source == t.source) && this.startQuery(t);
  }
  startQuery(n) {
    let { state: e } = this.view, t = dt(e), i = new Hc(e, t, n.explicitPos == t), r = new em(n, i);
    this.running.push(r), Promise.resolve(n.source(i)).then((s) => {
      r.context.aborted || (r.done = s || null, this.scheduleAccept());
    }, (s) => {
      this.view.dispatch({ effects: Xn.of(null) }), Me(this.view.state, s);
    });
  }
  scheduleAccept() {
    this.running.every((n) => n.done !== void 0) ? this.accept() : this.debounceAccept < 0 && (this.debounceAccept = setTimeout(() => this.accept(), Ul));
  }
  accept() {
    var n;
    this.debounceAccept > -1 && clearTimeout(this.debounceAccept), this.debounceAccept = -1;
    let e = [], t = this.view.state.facet(Ye);
    for (let i = 0; i < this.running.length; i++) {
      let r = this.running[i];
      if (r.done === void 0)
        continue;
      if (this.running.splice(i--, 1), r.done) {
        let o = new mi(r.active.source, r.active.explicitPos, r.done, r.done.from, (n = r.done.to) !== null && n !== void 0 ? n : dt(r.updates.length ? r.updates[0].startState : this.view.state));
        for (let l of r.updates)
          o = o.update(l, t);
        if (o.hasResult()) {
          e.push(o);
          continue;
        }
      }
      let s = this.view.state.field(Te).active.find((o) => o.source == r.active.source);
      if (s && s.state == 1)
        if (r.done == null) {
          let o = new ge(r.active.source, 0);
          for (let l of r.updates)
            o = o.update(l, t);
          o.state != 1 && e.push(o);
        } else
          this.startQuery(s);
    }
    e.length && this.view.dispatch({ effects: tf.of(e) });
  }
}, {
  eventHandlers: {
    blur() {
      let n = this.view.state.field(Te, !1);
      n && n.tooltip && this.view.state.facet(Ye).closeOnBlur && this.view.dispatch({ effects: Xn.of(null) });
    },
    compositionstart() {
      this.composing = 1;
    },
    compositionend() {
      this.composing == 3 && setTimeout(() => this.view.dispatch({ effects: to.of(!1) }), 20), this.composing = 0;
    }
  }
}), sf = /* @__PURE__ */ P.baseTheme({
  ".cm-tooltip.cm-tooltip-autocomplete": {
    "& > ul": {
      fontFamily: "monospace",
      whiteSpace: "nowrap",
      overflow: "hidden auto",
      maxWidth_fallback: "700px",
      maxWidth: "min(700px, 95vw)",
      minWidth: "250px",
      maxHeight: "10em",
      listStyle: "none",
      margin: 0,
      padding: 0,
      "& > li": {
        overflowX: "hidden",
        textOverflow: "ellipsis",
        cursor: "pointer",
        padding: "1px 3px",
        lineHeight: 1.2
      }
    }
  },
  "&light .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#17c",
    color: "white"
  },
  "&dark .cm-tooltip-autocomplete ul li[aria-selected]": {
    background: "#347",
    color: "white"
  },
  ".cm-completionListIncompleteTop:before, .cm-completionListIncompleteBottom:after": {
    content: '"\xB7\xB7\xB7"',
    opacity: 0.5,
    display: "block",
    textAlign: "center"
  },
  ".cm-tooltip.cm-completionInfo": {
    position: "absolute",
    padding: "3px 9px",
    width: "max-content",
    maxWidth: "300px"
  },
  ".cm-completionInfo.cm-completionInfo-left": { right: "100%" },
  ".cm-completionInfo.cm-completionInfo-right": { left: "100%" },
  "&light .cm-snippetField": { backgroundColor: "#00000022" },
  "&dark .cm-snippetField": { backgroundColor: "#ffffff22" },
  ".cm-snippetFieldPosition": {
    verticalAlign: "text-top",
    width: 0,
    height: "1.15em",
    margin: "0 -0.7px -.7em",
    borderLeft: "1.4px dotted #888"
  },
  ".cm-completionMatchedText": {
    textDecoration: "underline"
  },
  ".cm-completionDetail": {
    marginLeft: "0.5em",
    fontStyle: "italic"
  },
  ".cm-completionIcon": {
    fontSize: "90%",
    width: ".8em",
    display: "inline-block",
    textAlign: "center",
    paddingRight: ".6em",
    opacity: "0.6"
  },
  ".cm-completionIcon-function, .cm-completionIcon-method": {
    "&:after": { content: "'\u0192'" }
  },
  ".cm-completionIcon-class": {
    "&:after": { content: "'\u25CB'" }
  },
  ".cm-completionIcon-interface": {
    "&:after": { content: "'\u25CC'" }
  },
  ".cm-completionIcon-variable": {
    "&:after": { content: "'\u{1D465}'" }
  },
  ".cm-completionIcon-constant": {
    "&:after": { content: "'\u{1D436}'" }
  },
  ".cm-completionIcon-type": {
    "&:after": { content: "'\u{1D461}'" }
  },
  ".cm-completionIcon-enum": {
    "&:after": { content: "'\u222A'" }
  },
  ".cm-completionIcon-property": {
    "&:after": { content: "'\u25A1'" }
  },
  ".cm-completionIcon-keyword": {
    "&:after": { content: "'\u{1F511}\uFE0E'" }
  },
  ".cm-completionIcon-namespace": {
    "&:after": { content: "'\u25A2'" }
  },
  ".cm-completionIcon-text": {
    "&:after": { content: "'abc'", fontSize: "50%", verticalAlign: "middle" }
  }
});
class rm {
  constructor(e, t, i, r) {
    this.field = e, this.line = t, this.from = i, this.to = r;
  }
}
class io {
  constructor(e, t, i) {
    this.field = e, this.from = t, this.to = i;
  }
  map(e) {
    let t = e.mapPos(this.from, -1, ae.TrackDel), i = e.mapPos(this.to, 1, ae.TrackDel);
    return t == null || i == null ? null : new io(this.field, t, i);
  }
}
class no {
  constructor(e, t) {
    this.lines = e, this.fieldPositions = t;
  }
  instantiate(e, t) {
    let i = [], r = [t], s = e.doc.lineAt(t), o = /^\s*/.exec(s.text)[0];
    for (let a of this.lines) {
      if (i.length) {
        let h = o, c = /^\t*/.exec(a)[0].length;
        for (let f = 0; f < c; f++)
          h += e.facet(Ci);
        r.push(t + h.length - c), a = h + a.slice(c);
      }
      i.push(a), t += a.length + 1;
    }
    let l = this.fieldPositions.map((a) => new io(a.field, r[a.line] + a.from, r[a.line] + a.to));
    return { text: i, ranges: l };
  }
  static parse(e) {
    let t = [], i = [], r = [], s;
    for (let o of e.split(/\r\n?|\n/)) {
      for (; s = /[#$]\{(?:(\d+)(?::([^}]*))?|([^}]*))\}/.exec(o); ) {
        let l = s[1] ? +s[1] : null, a = s[2] || s[3] || "", h = -1;
        for (let c = 0; c < t.length; c++)
          (l != null ? t[c].seq == l : a ? t[c].name == a : !1) && (h = c);
        if (h < 0) {
          let c = 0;
          for (; c < t.length && (l == null || t[c].seq != null && t[c].seq < l); )
            c++;
          t.splice(c, 0, { seq: l, name: a }), h = c;
          for (let f of r)
            f.field >= h && f.field++;
        }
        r.push(new rm(h, i.length, s.index, s.index + a.length)), o = o.slice(0, s.index) + a + o.slice(s.index + s[0].length);
      }
      for (let l; l = /([$#])\\{/.exec(o); ) {
        o = o.slice(0, l.index) + l[1] + "{" + o.slice(l.index + l[0].length);
        for (let a of r)
          a.line == i.length && a.from > l.index && (a.from--, a.to--);
      }
      i.push(o);
    }
    return new no(i, r);
  }
}
let sm = /* @__PURE__ */ C.widget({ widget: /* @__PURE__ */ new class extends St {
  toDOM() {
    let n = document.createElement("span");
    return n.className = "cm-snippetFieldPosition", n;
  }
  ignoreEvent() {
    return !1;
  }
}() }), om = /* @__PURE__ */ C.mark({ class: "cm-snippetField" });
class ei {
  constructor(e, t) {
    this.ranges = e, this.active = t, this.deco = C.set(e.map((i) => (i.from == i.to ? sm : om).range(i.from, i.to)));
  }
  map(e) {
    let t = [];
    for (let i of this.ranges) {
      let r = i.map(e);
      if (!r)
        return null;
      t.push(r);
    }
    return new ei(t, this.active);
  }
  selectionInsideField(e) {
    return e.ranges.every((t) => this.ranges.some((i) => i.field == this.active && i.from <= t.from && i.to >= t.to));
  }
}
const Xi = /* @__PURE__ */ Z.define({
  map(n, e) {
    return n && n.map(e);
  }
}), lm = /* @__PURE__ */ Z.define(), Pi = /* @__PURE__ */ Oe.define({
  create() {
    return null;
  },
  update(n, e) {
    for (let t of e.effects) {
      if (t.is(Xi))
        return t.value;
      if (t.is(lm) && n)
        return new ei(n.ranges, t.value);
    }
    return n && e.docChanged && (n = n.map(e.changes)), n && e.selection && !n.selectionInsideField(e.selection) && (n = null), n;
  },
  provide: (n) => P.decorations.from(n, (e) => e ? e.deco : C.none)
});
function ro(n, e) {
  return m.create(n.filter((t) => t.field == e).map((t) => m.range(t.from, t.to)));
}
function am(n) {
  let e = no.parse(n);
  return (t, i, r, s) => {
    let { text: o, ranges: l } = e.instantiate(t.state, r), a = {
      changes: { from: r, to: s, insert: j.of(o) },
      scrollIntoView: !0
    };
    if (l.length && (a.selection = ro(l, 0)), l.length > 1) {
      let h = new ei(l, 0), c = a.effects = [Xi.of(h)];
      t.state.field(Pi, !1) === void 0 && c.push(Z.appendConfig.of([Pi, dm, Om, sf]));
    }
    t.dispatch(t.state.update(a));
  };
}
function of(n) {
  return ({ state: e, dispatch: t }) => {
    let i = e.field(Pi, !1);
    if (!i || n < 0 && i.active == 0)
      return !1;
    let r = i.active + n, s = n > 0 && !i.ranges.some((o) => o.field == r + n);
    return t(e.update({
      selection: ro(i.ranges, r),
      effects: Xi.of(s ? null : new ei(i.ranges, r))
    })), !0;
  };
}
const hm = ({ state: n, dispatch: e }) => n.field(Pi, !1) ? (e(n.update({ effects: Xi.of(null) })), !0) : !1, cm = /* @__PURE__ */ of(1), fm = /* @__PURE__ */ of(-1), um = [
  { key: "Tab", run: cm, shift: fm },
  { key: "Escape", run: hm }
], Yl = /* @__PURE__ */ v.define({
  combine(n) {
    return n.length ? n[0] : um;
  }
}), dm = /* @__PURE__ */ Ct.highest(/* @__PURE__ */ Bn.compute([Yl], (n) => n.facet(Yl)));
function Xe(n, e) {
  return Object.assign(Object.assign({}, e), { apply: am(n) });
}
const Om = /* @__PURE__ */ P.domEventHandlers({
  mousedown(n, e) {
    let t = e.state.field(Pi, !1), i;
    if (!t || (i = e.posAtCoords({ x: n.clientX, y: n.clientY })) == null)
      return !1;
    let r = t.ranges.find((s) => s.from <= i && s.to >= i);
    return !r || r.field == t.active ? !1 : (e.dispatch({
      selection: ro(t.ranges, r.field),
      effects: Xi.of(t.ranges.some((s) => s.field > r.field) ? new ei(t.ranges, r.field) : null)
    }), !0);
  }
}), Zn = {
  brackets: ["(", "[", "{", "'", '"'],
  before: ")]}:;>"
}, wt = /* @__PURE__ */ Z.define({
  map(n, e) {
    let t = e.mapPos(n, -1, ae.TrackAfter);
    return t == null ? void 0 : t;
  }
}), so = /* @__PURE__ */ Z.define({
  map(n, e) {
    return e.mapPos(n);
  }
}), oo = /* @__PURE__ */ new class extends vt {
}();
oo.startSide = 1;
oo.endSide = -1;
const lf = /* @__PURE__ */ Oe.define({
  create() {
    return z.empty;
  },
  update(n, e) {
    if (e.selection) {
      let t = e.state.doc.lineAt(e.selection.main.head).from, i = e.startState.doc.lineAt(e.startState.selection.main.head).from;
      t != e.changes.mapPos(i, -1) && (n = z.empty);
    }
    n = n.map(e.changes);
    for (let t of e.effects)
      t.is(wt) ? n = n.update({ add: [oo.range(t.value, t.value + 1)] }) : t.is(so) && (n = n.update({ filter: (i) => i != t.value }));
    return n;
  }
});
function pm() {
  return [mm, lf];
}
const Cr = "()[]{}<>";
function af(n) {
  for (let e = 0; e < Cr.length; e += 2)
    if (Cr.charCodeAt(e) == n)
      return Cr.charAt(e + 1);
  return As(n < 128 ? n : n + 1);
}
function hf(n, e) {
  return n.languageDataAt("closeBrackets", e)[0] || Zn;
}
const gm = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent), mm = /* @__PURE__ */ P.inputHandler.of((n, e, t, i) => {
  if ((gm ? n.composing : n.compositionStarted) || n.state.readOnly)
    return !1;
  let r = n.state.selection.main;
  if (i.length > 2 || i.length == 2 && xe(ne(i, 0)) == 1 || e != r.from || t != r.to)
    return !1;
  let s = ym(n.state, i);
  return s ? (n.dispatch(s), !0) : !1;
}), Qm = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let i = hf(n, n.selection.main.head).brackets || Zn.brackets, r = null, s = n.changeByRange((o) => {
    if (o.empty) {
      let l = Sm(n.doc, o.head);
      for (let a of i)
        if (a == l && or(n.doc, o.head) == af(ne(a, 0)))
          return {
            changes: { from: o.head - a.length, to: o.head + a.length },
            range: m.cursor(o.head - a.length),
            userEvent: "delete.backward"
          };
    }
    return { range: r = o };
  });
  return r || e(n.update(s, { scrollIntoView: !0 })), !r;
}, bm = [
  { key: "Backspace", run: Qm }
];
function ym(n, e) {
  let t = hf(n, n.selection.main.head), i = t.brackets || Zn.brackets;
  for (let r of i) {
    let s = af(ne(r, 0));
    if (e == r)
      return s == r ? km(n, r, i.indexOf(r + r + r) > -1) : xm(n, r, s, t.before || Zn.before);
    if (e == s && cf(n, n.selection.main.from))
      return $m(n, r, s);
  }
  return null;
}
function cf(n, e) {
  let t = !1;
  return n.field(lf).between(0, n.doc.length, (i) => {
    i == e && (t = !0);
  }), t;
}
function or(n, e) {
  let t = n.sliceString(e, e + 2);
  return t.slice(0, xe(ne(t, 0)));
}
function Sm(n, e) {
  let t = n.sliceString(e - 2, e);
  return xe(ne(t, 0)) == t.length ? t : t.slice(1);
}
function xm(n, e, t, i) {
  let r = null, s = n.changeByRange((o) => {
    if (!o.empty)
      return {
        changes: [{ insert: e, from: o.from }, { insert: t, from: o.to }],
        effects: wt.of(o.to + e.length),
        range: m.range(o.anchor + e.length, o.head + e.length)
      };
    let l = or(n.doc, o.head);
    return !l || /\s/.test(l) || i.indexOf(l) > -1 ? {
      changes: { insert: e + t, from: o.head },
      effects: wt.of(o.head + e.length),
      range: m.cursor(o.head + e.length)
    } : { range: r = o };
  });
  return r ? null : n.update(s, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function $m(n, e, t) {
  let i = null, r = n.selection.ranges.map((s) => s.empty && or(n.doc, s.head) == t ? m.cursor(s.head + t.length) : i = s);
  return i ? null : n.update({
    selection: m.create(r, n.selection.mainIndex),
    scrollIntoView: !0,
    effects: n.selection.ranges.map(({ from: s }) => so.of(s))
  });
}
function km(n, e, t) {
  let i = null, r = n.changeByRange((s) => {
    if (!s.empty)
      return {
        changes: [{ insert: e, from: s.from }, { insert: e, from: s.to }],
        effects: wt.of(s.to + e.length),
        range: m.range(s.anchor + e.length, s.head + e.length)
      };
    let o = s.head, l = or(n.doc, o);
    if (l == e) {
      if (Fl(n, o))
        return {
          changes: { insert: e + e, from: o },
          effects: wt.of(o + e.length),
          range: m.cursor(o + e.length)
        };
      if (cf(n, o)) {
        let a = t && n.sliceDoc(o, o + e.length * 3) == e + e + e;
        return {
          range: m.cursor(o + e.length * (a ? 3 : 1)),
          effects: so.of(o)
        };
      }
    } else {
      if (t && n.sliceDoc(o - 2 * e.length, o) == e + e && Fl(n, o - 2 * e.length))
        return {
          changes: { insert: e + e + e + e, from: o },
          effects: wt.of(o + e.length),
          range: m.cursor(o + e.length)
        };
      if (n.charCategorizer(o)(l) != fe.Word) {
        let a = n.sliceDoc(o - 1, o);
        if (a != e && n.charCategorizer(o)(a) != fe.Word && !wm(n, o, e))
          return {
            changes: { insert: e + e, from: o },
            effects: wt.of(o + e.length),
            range: m.cursor(o + e.length)
          };
      }
    }
    return { range: i = s };
  });
  return i ? null : n.update(r, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function Fl(n, e) {
  let t = Y(n).resolveInner(e + 1);
  return t.parent && t.from == e;
}
function wm(n, e, t) {
  let i = Y(n).resolveInner(e, -1);
  for (let r = 0; r < 5; r++) {
    if (n.sliceDoc(i.from, i.from + t.length) == t) {
      let o = i.firstChild;
      for (; o && o.from == i.from && o.to - o.from > t.length; ) {
        if (n.sliceDoc(o.to - t.length, o.to) == t)
          return !1;
        o = o.firstChild;
      }
      return !0;
    }
    let s = i.to == e && i.parent;
    if (!s)
      break;
    i = s;
  }
  return !1;
}
function Tm(n = {}) {
  return [
    Te,
    Ye.of(n),
    nm,
    vm,
    sf
  ];
}
const ff = [
  { key: "Ctrl-Space", run: Jg },
  { key: "Escape", run: Kg },
  { key: "ArrowDown", run: /* @__PURE__ */ Fi(!0) },
  { key: "ArrowUp", run: /* @__PURE__ */ Fi(!1) },
  { key: "PageDown", run: /* @__PURE__ */ Fi(!0, "page") },
  { key: "PageUp", run: /* @__PURE__ */ Fi(!1, "page") },
  { key: "Enter", run: Hg }
], vm = /* @__PURE__ */ Ct.highest(/* @__PURE__ */ Bn.computeN([Ye], (n) => n.facet(Ye).defaultKeymap ? [ff] : []));
class Dn {
  constructor(e, t, i, r, s, o, l, a, h, c = 0, f) {
    this.p = e, this.stack = t, this.state = i, this.reducePos = r, this.pos = s, this.score = o, this.buffer = l, this.bufferBase = a, this.curContext = h, this.lookAhead = c, this.parent = f;
  }
  toString() {
    return `[${this.stack.filter((e, t) => t % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
  }
  static start(e, t, i = 0) {
    let r = e.parser.context;
    return new Dn(e, [], t, i, i, 0, [], 0, r ? new Hl(r, r.start) : null, 0, null);
  }
  get context() {
    return this.curContext ? this.curContext.context : null;
  }
  pushState(e, t) {
    this.stack.push(this.state, t, this.bufferBase + this.buffer.length), this.state = e;
  }
  reduce(e) {
    let t = e >> 19, i = e & 65535, { parser: r } = this.p, s = r.dynamicPrecedence(i);
    if (s && (this.score += s), t == 0) {
      this.pushState(r.getGoto(this.state, i, !0), this.reducePos), i < r.minRepeatTerm && this.storeNode(i, this.reducePos, this.reducePos, 4, !0), this.reduceContext(i, this.reducePos);
      return;
    }
    let o = this.stack.length - (t - 1) * 3 - (e & 262144 ? 6 : 0), l = this.stack[o - 2], a = this.stack[o - 1], h = this.bufferBase + this.buffer.length - a;
    if (i < r.minRepeatTerm || e & 131072) {
      let c = r.stateFlag(this.state, 1) ? this.pos : this.reducePos;
      this.storeNode(i, l, c, h + 4, !0);
    }
    if (e & 262144)
      this.state = this.stack[o];
    else {
      let c = this.stack[o - 3];
      this.state = r.getGoto(c, i, !0);
    }
    for (; this.stack.length > o; )
      this.stack.pop();
    this.reduceContext(i, l);
  }
  storeNode(e, t, i, r = 4, s = !1) {
    if (e == 0 && (!this.stack.length || this.stack[this.stack.length - 1] < this.buffer.length + this.bufferBase)) {
      let o = this, l = this.buffer.length;
      if (l == 0 && o.parent && (l = o.bufferBase - o.parent.bufferBase, o = o.parent), l > 0 && o.buffer[l - 4] == 0 && o.buffer[l - 1] > -1) {
        if (t == i)
          return;
        if (o.buffer[l - 2] >= t) {
          o.buffer[l - 2] = i;
          return;
        }
      }
    }
    if (!s || this.pos == i)
      this.buffer.push(e, t, i, r);
    else {
      let o = this.buffer.length;
      if (o > 0 && this.buffer[o - 4] != 0)
        for (; o > 0 && this.buffer[o - 2] > i; )
          this.buffer[o] = this.buffer[o - 4], this.buffer[o + 1] = this.buffer[o - 3], this.buffer[o + 2] = this.buffer[o - 2], this.buffer[o + 3] = this.buffer[o - 1], o -= 4, r > 4 && (r -= 4);
      this.buffer[o] = e, this.buffer[o + 1] = t, this.buffer[o + 2] = i, this.buffer[o + 3] = r;
    }
  }
  shift(e, t, i) {
    let r = this.pos;
    if (e & 131072)
      this.pushState(e & 65535, this.pos);
    else if ((e & 262144) == 0) {
      let s = e, { parser: o } = this.p;
      (i > this.pos || t <= o.maxNode) && (this.pos = i, o.stateFlag(s, 1) || (this.reducePos = i)), this.pushState(s, r), this.shiftContext(t, r), t <= o.maxNode && this.buffer.push(t, r, i, 4);
    } else
      this.pos = i, this.shiftContext(t, r), t <= this.p.parser.maxNode && this.buffer.push(t, r, i, 4);
  }
  apply(e, t, i) {
    e & 65536 ? this.reduce(e) : this.shift(e, t, i);
  }
  useNode(e, t) {
    let i = this.p.reused.length - 1;
    (i < 0 || this.p.reused[i] != e) && (this.p.reused.push(e), i++);
    let r = this.pos;
    this.reducePos = this.pos = r + e.length, this.pushState(t, r), this.buffer.push(i, r, this.reducePos, -1), this.curContext && this.updateContext(this.curContext.tracker.reuse(this.curContext.context, e, this, this.p.stream.reset(this.pos - e.length)));
  }
  split() {
    let e = this, t = e.buffer.length;
    for (; t > 0 && e.buffer[t - 2] > e.reducePos; )
      t -= 4;
    let i = e.buffer.slice(t), r = e.bufferBase + t;
    for (; e && r == e.bufferBase; )
      e = e.parent;
    return new Dn(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, i, r, this.curContext, this.lookAhead, e);
  }
  recoverByDelete(e, t) {
    let i = e <= this.p.parser.maxNode;
    i && this.storeNode(e, this.pos, t, 4), this.storeNode(0, this.pos, t, i ? 8 : 4), this.pos = this.reducePos = t, this.score -= 190;
  }
  canShift(e) {
    for (let t = new Pm(this); ; ) {
      let i = this.p.parser.stateSlot(t.state, 4) || this.p.parser.hasAction(t.state, e);
      if ((i & 65536) == 0)
        return !0;
      if (i == 0)
        return !1;
      t.reduce(i);
    }
  }
  recoverByInsert(e) {
    if (this.stack.length >= 300)
      return [];
    let t = this.p.parser.nextStates(this.state);
    if (t.length > 4 << 1 || this.stack.length >= 120) {
      let r = [];
      for (let s = 0, o; s < t.length; s += 2)
        (o = t[s + 1]) != this.state && this.p.parser.hasAction(o, e) && r.push(t[s], o);
      if (this.stack.length < 120)
        for (let s = 0; r.length < 4 << 1 && s < t.length; s += 2) {
          let o = t[s + 1];
          r.some((l, a) => a & 1 && l == o) || r.push(t[s], o);
        }
      t = r;
    }
    let i = [];
    for (let r = 0; r < t.length && i.length < 4; r += 2) {
      let s = t[r + 1];
      if (s == this.state)
        continue;
      let o = this.split();
      o.pushState(s, this.pos), o.storeNode(0, o.pos, o.pos, 4, !0), o.shiftContext(t[r], this.pos), o.score -= 200, i.push(o);
    }
    return i;
  }
  forceReduce() {
    let e = this.p.parser.stateSlot(this.state, 5);
    if ((e & 65536) == 0)
      return !1;
    let { parser: t } = this.p;
    if (!t.validAction(this.state, e)) {
      let i = e >> 19, r = e & 65535, s = this.stack.length - i * 3;
      if (s < 0 || t.getGoto(this.stack[s], r, !1) < 0)
        return !1;
      this.storeNode(0, this.reducePos, this.reducePos, 4, !0), this.score -= 100;
    }
    return this.reducePos = this.pos, this.reduce(e), !0;
  }
  forceAll() {
    for (; !this.p.parser.stateFlag(this.state, 2); )
      if (!this.forceReduce()) {
        this.storeNode(0, this.pos, this.pos, 4, !0);
        break;
      }
    return this;
  }
  get deadEnd() {
    if (this.stack.length != 3)
      return !1;
    let { parser: e } = this.p;
    return e.data[e.stateSlot(this.state, 1)] == 65535 && !e.stateSlot(this.state, 4);
  }
  restart() {
    this.state = this.stack[0], this.stack.length = 0;
  }
  sameState(e) {
    if (this.state != e.state || this.stack.length != e.stack.length)
      return !1;
    for (let t = 0; t < this.stack.length; t += 3)
      if (this.stack[t] != e.stack[t])
        return !1;
    return !0;
  }
  get parser() {
    return this.p.parser;
  }
  dialectEnabled(e) {
    return this.p.parser.dialect.flags[e];
  }
  shiftContext(e, t) {
    this.curContext && this.updateContext(this.curContext.tracker.shift(this.curContext.context, e, this, this.p.stream.reset(t)));
  }
  reduceContext(e, t) {
    this.curContext && this.updateContext(this.curContext.tracker.reduce(this.curContext.context, e, this, this.p.stream.reset(t)));
  }
  emitContext() {
    let e = this.buffer.length - 1;
    (e < 0 || this.buffer[e] != -3) && this.buffer.push(this.curContext.hash, this.reducePos, this.reducePos, -3);
  }
  emitLookAhead() {
    let e = this.buffer.length - 1;
    (e < 0 || this.buffer[e] != -4) && this.buffer.push(this.lookAhead, this.reducePos, this.reducePos, -4);
  }
  updateContext(e) {
    if (e != this.curContext.context) {
      let t = new Hl(this.curContext.tracker, e);
      t.hash != this.curContext.hash && this.emitContext(), this.curContext = t;
    }
  }
  setLookAhead(e) {
    e > this.lookAhead && (this.emitLookAhead(), this.lookAhead = e);
  }
  close() {
    this.curContext && this.curContext.tracker.strict && this.emitContext(), this.lookAhead > 0 && this.emitLookAhead();
  }
}
class Hl {
  constructor(e, t) {
    this.tracker = e, this.context = t, this.hash = e.strict ? e.hash(t) : 0;
  }
}
var Jl;
(function(n) {
  n[n.Insert = 200] = "Insert", n[n.Delete = 190] = "Delete", n[n.Reduce = 100] = "Reduce", n[n.MaxNext = 4] = "MaxNext", n[n.MaxInsertStackDepth = 300] = "MaxInsertStackDepth", n[n.DampenInsertStackDepth = 120] = "DampenInsertStackDepth";
})(Jl || (Jl = {}));
class Pm {
  constructor(e) {
    this.start = e, this.state = e.state, this.stack = e.stack, this.base = this.stack.length;
  }
  reduce(e) {
    let t = e & 65535, i = e >> 19;
    i == 0 ? (this.stack == this.start.stack && (this.stack = this.stack.slice()), this.stack.push(this.state, 0, 0), this.base += 3) : this.base -= (i - 1) * 3;
    let r = this.start.p.parser.getGoto(this.stack[this.base - 3], t, !0);
    this.state = r;
  }
}
class Mn {
  constructor(e, t, i) {
    this.stack = e, this.pos = t, this.index = i, this.buffer = e.buffer, this.index == 0 && this.maybeNext();
  }
  static create(e, t = e.bufferBase + e.buffer.length) {
    return new Mn(e, t, t - e.bufferBase);
  }
  maybeNext() {
    let e = this.stack.parent;
    e != null && (this.index = this.stack.bufferBase - e.bufferBase, this.stack = e, this.buffer = e.buffer);
  }
  get id() {
    return this.buffer[this.index - 4];
  }
  get start() {
    return this.buffer[this.index - 3];
  }
  get end() {
    return this.buffer[this.index - 2];
  }
  get size() {
    return this.buffer[this.index - 1];
  }
  next() {
    this.index -= 4, this.pos -= 4, this.index == 0 && this.maybeNext();
  }
  fork() {
    return new Mn(this.stack, this.pos, this.index);
  }
}
class an {
  constructor() {
    this.start = -1, this.value = -1, this.end = -1, this.extended = -1, this.lookAhead = 0, this.mask = 0, this.context = 0;
  }
}
const Kl = new an();
class Rm {
  constructor(e, t) {
    this.input = e, this.ranges = t, this.chunk = "", this.chunkOff = 0, this.chunk2 = "", this.chunk2Pos = 0, this.next = -1, this.token = Kl, this.rangeIndex = 0, this.pos = this.chunkPos = t[0].from, this.range = t[0], this.end = t[t.length - 1].to, this.readNext();
  }
  resolveOffset(e, t) {
    let i = this.range, r = this.rangeIndex, s = this.pos + e;
    for (; s < i.from; ) {
      if (!r)
        return null;
      let o = this.ranges[--r];
      s -= i.from - o.to, i = o;
    }
    for (; t < 0 ? s > i.to : s >= i.to; ) {
      if (r == this.ranges.length - 1)
        return null;
      let o = this.ranges[++r];
      s += o.from - i.to, i = o;
    }
    return s;
  }
  peek(e) {
    let t = this.chunkOff + e, i, r;
    if (t >= 0 && t < this.chunk.length)
      i = this.pos + e, r = this.chunk.charCodeAt(t);
    else {
      let s = this.resolveOffset(e, 1);
      if (s == null)
        return -1;
      if (i = s, i >= this.chunk2Pos && i < this.chunk2Pos + this.chunk2.length)
        r = this.chunk2.charCodeAt(i - this.chunk2Pos);
      else {
        let o = this.rangeIndex, l = this.range;
        for (; l.to <= i; )
          l = this.ranges[++o];
        this.chunk2 = this.input.chunk(this.chunk2Pos = i), i + this.chunk2.length > l.to && (this.chunk2 = this.chunk2.slice(0, l.to - i)), r = this.chunk2.charCodeAt(0);
      }
    }
    return i >= this.token.lookAhead && (this.token.lookAhead = i + 1), r;
  }
  acceptToken(e, t = 0) {
    let i = t ? this.resolveOffset(t, -1) : this.pos;
    if (i == null || i < this.token.start)
      throw new RangeError("Token end out of bounds");
    this.token.value = e, this.token.end = i;
  }
  getChunk() {
    if (this.pos >= this.chunk2Pos && this.pos < this.chunk2Pos + this.chunk2.length) {
      let { chunk: e, chunkPos: t } = this;
      this.chunk = this.chunk2, this.chunkPos = this.chunk2Pos, this.chunk2 = e, this.chunk2Pos = t, this.chunkOff = this.pos - this.chunkPos;
    } else {
      this.chunk2 = this.chunk, this.chunk2Pos = this.chunkPos;
      let e = this.input.chunk(this.pos), t = this.pos + e.length;
      this.chunk = t > this.range.to ? e.slice(0, this.range.to - this.pos) : e, this.chunkPos = this.pos, this.chunkOff = 0;
    }
  }
  readNext() {
    return this.chunkOff >= this.chunk.length && (this.getChunk(), this.chunkOff == this.chunk.length) ? this.next = -1 : this.next = this.chunk.charCodeAt(this.chunkOff);
  }
  advance(e = 1) {
    for (this.chunkOff += e; this.pos + e >= this.range.to; ) {
      if (this.rangeIndex == this.ranges.length - 1)
        return this.setDone();
      e -= this.range.to - this.pos, this.range = this.ranges[++this.rangeIndex], this.pos = this.range.from;
    }
    return this.pos += e, this.pos >= this.token.lookAhead && (this.token.lookAhead = this.pos + 1), this.readNext();
  }
  setDone() {
    return this.pos = this.chunkPos = this.end, this.range = this.ranges[this.rangeIndex = this.ranges.length - 1], this.chunk = "", this.next = -1;
  }
  reset(e, t) {
    if (t ? (this.token = t, t.start = e, t.lookAhead = e + 1, t.value = t.extended = -1) : this.token = Kl, this.pos != e) {
      if (this.pos = e, e == this.end)
        return this.setDone(), this;
      for (; e < this.range.from; )
        this.range = this.ranges[--this.rangeIndex];
      for (; e >= this.range.to; )
        this.range = this.ranges[++this.rangeIndex];
      e >= this.chunkPos && e < this.chunkPos + this.chunk.length ? this.chunkOff = e - this.chunkPos : (this.chunk = "", this.chunkOff = 0), this.readNext();
    }
    return this;
  }
  read(e, t) {
    if (e >= this.chunkPos && t <= this.chunkPos + this.chunk.length)
      return this.chunk.slice(e - this.chunkPos, t - this.chunkPos);
    if (e >= this.chunk2Pos && t <= this.chunk2Pos + this.chunk2.length)
      return this.chunk2.slice(e - this.chunk2Pos, t - this.chunk2Pos);
    if (e >= this.range.from && t <= this.range.to)
      return this.input.read(e, t);
    let i = "";
    for (let r of this.ranges) {
      if (r.from >= t)
        break;
      r.to > e && (i += this.input.read(Math.max(r.from, e), Math.min(r.to, t)));
    }
    return i;
  }
}
class hn {
  constructor(e, t) {
    this.data = e, this.id = t;
  }
  token(e, t) {
    Cm(this.data, e, t, this.id);
  }
}
hn.prototype.contextual = hn.prototype.fallback = hn.prototype.extend = !1;
class je {
  constructor(e, t = {}) {
    this.token = e, this.contextual = !!t.contextual, this.fallback = !!t.fallback, this.extend = !!t.extend;
  }
}
function Cm(n, e, t, i) {
  let r = 0, s = 1 << i, { parser: o } = t.p, { dialect: l } = o;
  e:
    for (; (s & n[r]) != 0; ) {
      let a = n[r + 1];
      for (let u = r + 3; u < a; u += 2)
        if ((n[u + 1] & s) > 0) {
          let d = n[u];
          if (l.allows(d) && (e.token.value == -1 || e.token.value == d || o.overrides(d, e.token.value))) {
            e.acceptToken(d);
            break;
          }
        }
      let h = e.next, c = 0, f = n[r + 2];
      if (e.next < 0 && f > c && n[a + f * 3 - 3] == 65535) {
        r = n[a + f * 3 - 1];
        continue e;
      }
      for (; c < f; ) {
        let u = c + f >> 1, d = a + u + (u << 1), O = n[d], g = n[d + 1];
        if (h < O)
          f = u;
        else if (h >= g)
          c = u + 1;
        else {
          r = n[d + 2], e.advance();
          continue e;
        }
      }
      break;
    }
}
function Hi(n, e = Uint16Array) {
  if (typeof n != "string")
    return n;
  let t = null;
  for (let i = 0, r = 0; i < n.length; ) {
    let s = 0;
    for (; ; ) {
      let o = n.charCodeAt(i++), l = !1;
      if (o == 126) {
        s = 65535;
        break;
      }
      o >= 92 && o--, o >= 34 && o--;
      let a = o - 32;
      if (a >= 46 && (a -= 46, l = !0), s += a, l)
        break;
      s *= 46;
    }
    t ? t[r++] = s : t = new e(s);
  }
  return t;
}
const Ze = typeof process < "u" && process.env && /\bparse\b/.test(process.env.LOG);
let Ar = null;
var ea;
(function(n) {
  n[n.Margin = 25] = "Margin";
})(ea || (ea = {}));
function ta(n, e, t) {
  let i = n.cursor(I.IncludeAnonymous);
  for (i.moveTo(e); ; )
    if (!(t < 0 ? i.childBefore(e) : i.childAfter(e)))
      for (; ; ) {
        if ((t < 0 ? i.to < e : i.from > e) && !i.type.isError)
          return t < 0 ? Math.max(0, Math.min(i.to - 1, e - 25)) : Math.min(n.length, Math.max(i.from + 1, e + 25));
        if (t < 0 ? i.prevSibling() : i.nextSibling())
          break;
        if (!i.parent())
          return t < 0 ? 0 : n.length;
      }
}
class Am {
  constructor(e, t) {
    this.fragments = e, this.nodeSet = t, this.i = 0, this.fragment = null, this.safeFrom = -1, this.safeTo = -1, this.trees = [], this.start = [], this.index = [], this.nextFragment();
  }
  nextFragment() {
    let e = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
    if (e) {
      for (this.safeFrom = e.openStart ? ta(e.tree, e.from + e.offset, 1) - e.offset : e.from, this.safeTo = e.openEnd ? ta(e.tree, e.to + e.offset, -1) - e.offset : e.to; this.trees.length; )
        this.trees.pop(), this.start.pop(), this.index.pop();
      this.trees.push(e.tree), this.start.push(-e.offset), this.index.push(0), this.nextStart = this.safeFrom;
    } else
      this.nextStart = 1e9;
  }
  nodeAt(e) {
    if (e < this.nextStart)
      return null;
    for (; this.fragment && this.safeTo <= e; )
      this.nextFragment();
    if (!this.fragment)
      return null;
    for (; ; ) {
      let t = this.trees.length - 1;
      if (t < 0)
        return this.nextFragment(), null;
      let i = this.trees[t], r = this.index[t];
      if (r == i.children.length) {
        this.trees.pop(), this.start.pop(), this.index.pop();
        continue;
      }
      let s = i.children[r], o = this.start[t] + i.positions[r];
      if (o > e)
        return this.nextStart = o, null;
      if (s instanceof N) {
        if (o == e) {
          if (o < this.safeFrom)
            return null;
          let l = o + s.length;
          if (l <= this.safeTo) {
            let a = s.prop(W.lookAhead);
            if (!a || l + a < this.fragment.to)
              return s;
          }
        }
        this.index[t]++, o + s.length >= Math.max(this.safeFrom, e) && (this.trees.push(s), this.start.push(o), this.index.push(0));
      } else
        this.index[t]++, this.nextStart = o + s.length;
    }
  }
}
class Wm {
  constructor(e, t) {
    this.stream = t, this.tokens = [], this.mainToken = null, this.actions = [], this.tokens = e.tokenizers.map((i) => new an());
  }
  getActions(e) {
    let t = 0, i = null, { parser: r } = e.p, { tokenizers: s } = r, o = r.stateSlot(e.state, 3), l = e.curContext ? e.curContext.hash : 0, a = 0;
    for (let h = 0; h < s.length; h++) {
      if ((1 << h & o) == 0)
        continue;
      let c = s[h], f = this.tokens[h];
      if (!(i && !c.fallback) && ((c.contextual || f.start != e.pos || f.mask != o || f.context != l) && (this.updateCachedToken(f, c, e), f.mask = o, f.context = l), f.lookAhead > f.end + 25 && (a = Math.max(f.lookAhead, a)), f.value != 0)) {
        let u = t;
        if (f.extended > -1 && (t = this.addActions(e, f.extended, f.end, t)), t = this.addActions(e, f.value, f.end, t), !c.extend && (i = f, t > u))
          break;
      }
    }
    for (; this.actions.length > t; )
      this.actions.pop();
    return a && e.setLookAhead(a), !i && e.pos == this.stream.end && (i = new an(), i.value = e.p.parser.eofTerm, i.start = i.end = e.pos, t = this.addActions(e, i.value, i.end, t)), this.mainToken = i, this.actions;
  }
  getMainToken(e) {
    if (this.mainToken)
      return this.mainToken;
    let t = new an(), { pos: i, p: r } = e;
    return t.start = i, t.end = Math.min(i + 1, r.stream.end), t.value = i == r.stream.end ? r.parser.eofTerm : 0, t;
  }
  updateCachedToken(e, t, i) {
    if (t.token(this.stream.reset(i.pos, e), i), e.value > -1) {
      let { parser: r } = i.p;
      for (let s = 0; s < r.specialized.length; s++)
        if (r.specialized[s] == e.value) {
          let o = r.specializers[s](this.stream.read(e.start, e.end), i);
          if (o >= 0 && i.p.parser.dialect.allows(o >> 1)) {
            (o & 1) == 0 ? e.value = o >> 1 : e.extended = o >> 1;
            break;
          }
        }
    } else
      e.value = 0, e.end = Math.min(i.p.stream.end, i.pos + 1);
  }
  putAction(e, t, i, r) {
    for (let s = 0; s < r; s += 3)
      if (this.actions[s] == e)
        return r;
    return this.actions[r++] = e, this.actions[r++] = t, this.actions[r++] = i, r;
  }
  addActions(e, t, i, r) {
    let { state: s } = e, { parser: o } = e.p, { data: l } = o;
    for (let a = 0; a < 2; a++)
      for (let h = o.stateSlot(s, a ? 2 : 1); ; h += 3) {
        if (l[h] == 65535)
          if (l[h + 1] == 1)
            h = Ke(l, h + 2);
          else {
            r == 0 && l[h + 1] == 2 && (r = this.putAction(Ke(l, h + 2), t, i, r));
            break;
          }
        l[h] == t && (r = this.putAction(Ke(l, h + 1), t, i, r));
      }
    return r;
  }
}
var ia;
(function(n) {
  n[n.Distance = 5] = "Distance", n[n.MaxRemainingPerStep = 3] = "MaxRemainingPerStep", n[n.MinBufferLengthPrune = 500] = "MinBufferLengthPrune", n[n.ForceReduceLimit = 10] = "ForceReduceLimit", n[n.CutDepth = 15e3] = "CutDepth", n[n.CutTo = 9e3] = "CutTo";
})(ia || (ia = {}));
class Xm {
  constructor(e, t, i, r) {
    this.parser = e, this.input = t, this.ranges = r, this.recovering = 0, this.nextStackID = 9812, this.minStackPos = 0, this.reused = [], this.stoppedAt = null, this.stream = new Rm(t, r), this.tokens = new Wm(e, this.stream), this.topTerm = e.top[1];
    let { from: s } = r[0];
    this.stacks = [Dn.start(this, e.top[0], s)], this.fragments = i.length && this.stream.end - s > e.bufferLength * 4 ? new Am(i, e.nodeSet) : null;
  }
  get parsedPos() {
    return this.minStackPos;
  }
  advance() {
    let e = this.stacks, t = this.minStackPos, i = this.stacks = [], r, s;
    for (let o = 0; o < e.length; o++) {
      let l = e[o];
      for (; ; ) {
        if (this.tokens.mainToken = null, l.pos > t)
          i.push(l);
        else {
          if (this.advanceStack(l, i, e))
            continue;
          {
            r || (r = [], s = []), r.push(l);
            let a = this.tokens.getMainToken(l);
            s.push(a.value, a.end);
          }
        }
        break;
      }
    }
    if (!i.length) {
      let o = r && Dm(r);
      if (o)
        return this.stackToTree(o);
      if (this.parser.strict)
        throw Ze && r && console.log("Stuck with token " + (this.tokens.mainToken ? this.parser.getName(this.tokens.mainToken.value) : "none")), new SyntaxError("No parse at " + t);
      this.recovering || (this.recovering = 5);
    }
    if (this.recovering && r) {
      let o = this.stoppedAt != null && r[0].pos > this.stoppedAt ? r[0] : this.runRecovery(r, s, i);
      if (o)
        return this.stackToTree(o.forceAll());
    }
    if (this.recovering) {
      let o = this.recovering == 1 ? 1 : this.recovering * 3;
      if (i.length > o)
        for (i.sort((l, a) => a.score - l.score); i.length > o; )
          i.pop();
      i.some((l) => l.reducePos > t) && this.recovering--;
    } else if (i.length > 1) {
      e:
        for (let o = 0; o < i.length - 1; o++) {
          let l = i[o];
          for (let a = o + 1; a < i.length; a++) {
            let h = i[a];
            if (l.sameState(h) || l.buffer.length > 500 && h.buffer.length > 500)
              if ((l.score - h.score || l.buffer.length - h.buffer.length) > 0)
                i.splice(a--, 1);
              else {
                i.splice(o--, 1);
                continue e;
              }
          }
        }
    }
    this.minStackPos = i[0].pos;
    for (let o = 1; o < i.length; o++)
      i[o].pos < this.minStackPos && (this.minStackPos = i[o].pos);
    return null;
  }
  stopAt(e) {
    if (this.stoppedAt != null && this.stoppedAt < e)
      throw new RangeError("Can't move stoppedAt forward");
    this.stoppedAt = e;
  }
  advanceStack(e, t, i) {
    let r = e.pos, { parser: s } = this, o = Ze ? this.stackID(e) + " -> " : "";
    if (this.stoppedAt != null && r > this.stoppedAt)
      return e.forceReduce() ? e : null;
    if (this.fragments) {
      let h = e.curContext && e.curContext.tracker.strict, c = h ? e.curContext.hash : 0;
      for (let f = this.fragments.nodeAt(r); f; ) {
        let u = this.parser.nodeSet.types[f.type.id] == f.type ? s.getGoto(e.state, f.type.id) : -1;
        if (u > -1 && f.length && (!h || (f.prop(W.contextHash) || 0) == c))
          return e.useNode(f, u), Ze && console.log(o + this.stackID(e) + ` (via reuse of ${s.getName(f.type.id)})`), !0;
        if (!(f instanceof N) || f.children.length == 0 || f.positions[0] > 0)
          break;
        let d = f.children[0];
        if (d instanceof N && f.positions[0] == 0)
          f = d;
        else
          break;
      }
    }
    let l = s.stateSlot(e.state, 4);
    if (l > 0)
      return e.reduce(l), Ze && console.log(o + this.stackID(e) + ` (via always-reduce ${s.getName(l & 65535)})`), !0;
    if (e.stack.length >= 15e3)
      for (; e.stack.length > 9e3 && e.forceReduce(); )
        ;
    let a = this.tokens.getActions(e);
    for (let h = 0; h < a.length; ) {
      let c = a[h++], f = a[h++], u = a[h++], d = h == a.length || !i, O = d ? e : e.split();
      if (O.apply(c, f, u), Ze && console.log(o + this.stackID(O) + ` (via ${(c & 65536) == 0 ? "shift" : `reduce of ${s.getName(c & 65535)}`} for ${s.getName(f)} @ ${r}${O == e ? "" : ", split"})`), d)
        return !0;
      O.pos > r ? t.push(O) : i.push(O);
    }
    return !1;
  }
  advanceFully(e, t) {
    let i = e.pos;
    for (; ; ) {
      if (!this.advanceStack(e, null, null))
        return !1;
      if (e.pos > i)
        return na(e, t), !0;
    }
  }
  runRecovery(e, t, i) {
    let r = null, s = !1;
    for (let o = 0; o < e.length; o++) {
      let l = e[o], a = t[o << 1], h = t[(o << 1) + 1], c = Ze ? this.stackID(l) + " -> " : "";
      if (l.deadEnd && (s || (s = !0, l.restart(), Ze && console.log(c + this.stackID(l) + " (restarted)"), this.advanceFully(l, i))))
        continue;
      let f = l.split(), u = c;
      for (let d = 0; f.forceReduce() && d < 10 && (Ze && console.log(u + this.stackID(f) + " (via force-reduce)"), !this.advanceFully(f, i)); d++)
        Ze && (u = this.stackID(f) + " -> ");
      for (let d of l.recoverByInsert(a))
        Ze && console.log(c + this.stackID(d) + " (via recover-insert)"), this.advanceFully(d, i);
      this.stream.end > l.pos ? (h == l.pos && (h++, a = 0), l.recoverByDelete(a, h), Ze && console.log(c + this.stackID(l) + ` (via recover-delete ${this.parser.getName(a)})`), na(l, i)) : (!r || r.score < l.score) && (r = l);
    }
    return r;
  }
  stackToTree(e) {
    return e.close(), N.build({
      buffer: Mn.create(e),
      nodeSet: this.parser.nodeSet,
      topID: this.topTerm,
      maxBufferLength: this.parser.bufferLength,
      reused: this.reused,
      start: this.ranges[0].from,
      length: e.pos - this.ranges[0].from,
      minRepeatType: this.parser.minRepeatTerm
    });
  }
  stackID(e) {
    let t = (Ar || (Ar = /* @__PURE__ */ new WeakMap())).get(e);
    return t || Ar.set(e, t = String.fromCodePoint(this.nextStackID++)), t + e;
  }
}
function na(n, e) {
  for (let t = 0; t < e.length; t++) {
    let i = e[t];
    if (i.pos == n.pos && i.sameState(n)) {
      e[t].score < n.score && (e[t] = n);
      return;
    }
  }
  e.push(n);
}
class Zm {
  constructor(e, t, i) {
    this.source = e, this.flags = t, this.disabled = i;
  }
  allows(e) {
    return !this.disabled || this.disabled[e] == 0;
  }
}
const Wr = (n) => n;
class uf {
  constructor(e) {
    this.start = e.start, this.shift = e.shift || Wr, this.reduce = e.reduce || Wr, this.reuse = e.reuse || Wr, this.hash = e.hash || (() => 0), this.strict = e.strict !== !1;
  }
}
class Ht extends Nh {
  constructor(e) {
    if (super(), this.wrappers = [], e.version != 14)
      throw new RangeError(`Parser version (${e.version}) doesn't match runtime version (${14})`);
    let t = e.nodeNames.split(" ");
    this.minRepeatTerm = t.length;
    for (let l = 0; l < e.repeatNodeCount; l++)
      t.push("");
    let i = Object.keys(e.topRules).map((l) => e.topRules[l][1]), r = [];
    for (let l = 0; l < t.length; l++)
      r.push([]);
    function s(l, a, h) {
      r[l].push([a, a.deserialize(String(h))]);
    }
    if (e.nodeProps)
      for (let l of e.nodeProps) {
        let a = l[0];
        typeof a == "string" && (a = W[a]);
        for (let h = 1; h < l.length; ) {
          let c = l[h++];
          if (c >= 0)
            s(c, a, l[h++]);
          else {
            let f = l[h + -c];
            for (let u = -c; u > 0; u--)
              s(l[h++], a, f);
            h++;
          }
        }
      }
    this.nodeSet = new Es(t.map((l, a) => de.define({
      name: a >= this.minRepeatTerm ? void 0 : l,
      id: a,
      props: r[a],
      top: i.indexOf(a) > -1,
      error: a == 0,
      skipped: e.skippedNodes && e.skippedNodes.indexOf(a) > -1
    }))), e.propSources && (this.nodeSet = this.nodeSet.extend(...e.propSources)), this.strict = !1, this.bufferLength = Ih;
    let o = Hi(e.tokenData);
    if (this.context = e.context, this.specialized = new Uint16Array(e.specialized ? e.specialized.length : 0), this.specializers = [], e.specialized)
      for (let l = 0; l < e.specialized.length; l++)
        this.specialized[l] = e.specialized[l].term, this.specializers[l] = e.specialized[l].get;
    this.states = Hi(e.states, Uint32Array), this.data = Hi(e.stateData), this.goto = Hi(e.goto), this.maxTerm = e.maxTerm, this.tokenizers = e.tokenizers.map((l) => typeof l == "number" ? new hn(o, l) : l), this.topRules = e.topRules, this.dialects = e.dialects || {}, this.dynamicPrecedences = e.dynamicPrecedences || null, this.tokenPrecTable = e.tokenPrec, this.termNames = e.termNames || null, this.maxNode = this.nodeSet.types.length - 1, this.dialect = this.parseDialect(), this.top = this.topRules[Object.keys(this.topRules)[0]];
  }
  createParse(e, t, i) {
    let r = new Xm(this, e, t, i);
    for (let s of this.wrappers)
      r = s(r, e, t, i);
    return r;
  }
  getGoto(e, t, i = !1) {
    let r = this.goto;
    if (t >= r[0])
      return -1;
    for (let s = r[t + 1]; ; ) {
      let o = r[s++], l = o & 1, a = r[s++];
      if (l && i)
        return a;
      for (let h = s + (o >> 1); s < h; s++)
        if (r[s] == e)
          return a;
      if (l)
        return -1;
    }
  }
  hasAction(e, t) {
    let i = this.data;
    for (let r = 0; r < 2; r++)
      for (let s = this.stateSlot(e, r ? 2 : 1), o; ; s += 3) {
        if ((o = i[s]) == 65535)
          if (i[s + 1] == 1)
            o = i[s = Ke(i, s + 2)];
          else {
            if (i[s + 1] == 2)
              return Ke(i, s + 2);
            break;
          }
        if (o == t || o == 0)
          return Ke(i, s + 1);
      }
    return 0;
  }
  stateSlot(e, t) {
    return this.states[e * 6 + t];
  }
  stateFlag(e, t) {
    return (this.stateSlot(e, 0) & t) > 0;
  }
  validAction(e, t) {
    if (t == this.stateSlot(e, 4))
      return !0;
    for (let i = this.stateSlot(e, 1); ; i += 3) {
      if (this.data[i] == 65535)
        if (this.data[i + 1] == 1)
          i = Ke(this.data, i + 2);
        else
          return !1;
      if (t == Ke(this.data, i + 1))
        return !0;
    }
  }
  nextStates(e) {
    let t = [];
    for (let i = this.stateSlot(e, 1); ; i += 3) {
      if (this.data[i] == 65535)
        if (this.data[i + 1] == 1)
          i = Ke(this.data, i + 2);
        else
          break;
      if ((this.data[i + 2] & 1) == 0) {
        let r = this.data[i + 1];
        t.some((s, o) => o & 1 && s == r) || t.push(this.data[i], r);
      }
    }
    return t;
  }
  overrides(e, t) {
    let i = ra(this.data, this.tokenPrecTable, t);
    return i < 0 || ra(this.data, this.tokenPrecTable, e) < i;
  }
  configure(e) {
    let t = Object.assign(Object.create(Ht.prototype), this);
    if (e.props && (t.nodeSet = this.nodeSet.extend(...e.props)), e.top) {
      let i = this.topRules[e.top];
      if (!i)
        throw new RangeError(`Invalid top rule name ${e.top}`);
      t.top = i;
    }
    return e.tokenizers && (t.tokenizers = this.tokenizers.map((i) => {
      let r = e.tokenizers.find((s) => s.from == i);
      return r ? r.to : i;
    })), e.specializers && (t.specializers = this.specializers.map((i) => {
      let r = e.specializers.find((s) => s.from == i);
      return r ? r.to : i;
    })), e.contextTracker && (t.context = e.contextTracker), e.dialect && (t.dialect = this.parseDialect(e.dialect)), e.strict != null && (t.strict = e.strict), e.wrap && (t.wrappers = t.wrappers.concat(e.wrap)), e.bufferLength != null && (t.bufferLength = e.bufferLength), t;
  }
  hasWrappers() {
    return this.wrappers.length > 0;
  }
  getName(e) {
    return this.termNames ? this.termNames[e] : String(e <= this.maxNode && this.nodeSet.types[e].name || e);
  }
  get eofTerm() {
    return this.maxNode + 1;
  }
  get topNode() {
    return this.nodeSet.types[this.top[1]];
  }
  dynamicPrecedence(e) {
    let t = this.dynamicPrecedences;
    return t == null ? 0 : t[e] || 0;
  }
  parseDialect(e) {
    let t = Object.keys(this.dialects), i = t.map(() => !1);
    if (e)
      for (let s of e.split(" ")) {
        let o = t.indexOf(s);
        o >= 0 && (i[o] = !0);
      }
    let r = null;
    for (let s = 0; s < t.length; s++)
      if (!i[s])
        for (let o = this.dialects[t[s]], l; (l = this.data[o++]) != 65535; )
          (r || (r = new Uint8Array(this.maxTerm + 1)))[l] = 1;
    return new Zm(e, i, r);
  }
  static deserialize(e) {
    return new Ht(e);
  }
}
function Ke(n, e) {
  return n[e] | n[e + 1] << 16;
}
function ra(n, e, t) {
  for (let i = e, r; (r = n[i]) != 65535; i++)
    if (r == t)
      return i - e;
  return -1;
}
function Dm(n) {
  let e = null;
  for (let t of n) {
    let i = t.p.stoppedAt;
    (t.pos == t.p.stream.end || i != null && t.pos > i) && t.p.parser.stateFlag(t.state, 2) && (!e || e.score < t.score) && (e = t);
  }
  return e;
}
const Mm = 1, sa = 281, oa = 2, jm = 3, Ji = 282, zm = 4, qm = 283, la = 284, Em = 286, _m = 287, Im = 5, Gm = 6, Vm = 1, Nm = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
], df = 125, Bm = 123, Lm = 59, aa = 47, Um = 42, Ym = 43, Fm = 45, Hm = 36, Jm = 96, Km = 92, e0 = new uf({
  start: !1,
  shift(n, e) {
    return e == Im || e == Gm || e == Em ? n : e == _m;
  },
  strict: !1
}), t0 = new je((n, e) => {
  let { next: t } = n;
  (t == df || t == -1 || e.context) && e.canShift(la) && n.acceptToken(la);
}, { contextual: !0, fallback: !0 }), i0 = new je((n, e) => {
  let { next: t } = n, i;
  Nm.indexOf(t) > -1 || t == aa && ((i = n.peek(1)) == aa || i == Um) || t != df && t != Lm && t != -1 && !e.context && e.canShift(sa) && n.acceptToken(sa);
}, { contextual: !0 }), n0 = new je((n, e) => {
  let { next: t } = n;
  if ((t == Ym || t == Fm) && (n.advance(), t == n.next)) {
    n.advance();
    let i = !e.context && e.canShift(oa);
    n.acceptToken(i ? oa : jm);
  }
}, { contextual: !0 }), r0 = new je((n) => {
  for (let e = !1, t = 0; ; t++) {
    let { next: i } = n;
    if (i < 0) {
      t && n.acceptToken(Ji);
      break;
    } else if (i == Jm) {
      t ? n.acceptToken(Ji) : n.acceptToken(qm, 1);
      break;
    } else if (i == Bm && e) {
      t == 1 ? n.acceptToken(zm, 1) : n.acceptToken(Ji, -1);
      break;
    } else if (i == 10 && t) {
      n.advance(), n.acceptToken(Ji);
      break;
    } else
      i == Km && n.advance();
    e = i == Hm, n.advance();
  }
}), s0 = new je((n, e) => {
  if (!(n.next != 101 || !e.dialectEnabled(Vm))) {
    n.advance();
    for (let t = 0; t < 6; t++) {
      if (n.next != "xtends".charCodeAt(t))
        return;
      n.advance();
    }
    n.next >= 57 && n.next <= 65 || n.next >= 48 && n.next <= 90 || n.next == 95 || n.next >= 97 && n.next <= 122 || n.next > 160 || n.acceptToken(Mm);
  }
}), o0 = Ln({
  "get set async static": p.modifier,
  "for while do if else switch try catch finally return throw break continue default case": p.controlKeyword,
  "in of await yield void typeof delete instanceof": p.operatorKeyword,
  "let var const function class extends": p.definitionKeyword,
  "import export from": p.moduleKeyword,
  "with debugger as new": p.keyword,
  TemplateString: p.special(p.string),
  super: p.atom,
  BooleanLiteral: p.bool,
  this: p.self,
  null: p.null,
  Star: p.modifier,
  VariableName: p.variableName,
  "CallExpression/VariableName TaggedTemplateExpression/VariableName": p.function(p.variableName),
  VariableDefinition: p.definition(p.variableName),
  Label: p.labelName,
  PropertyName: p.propertyName,
  PrivatePropertyName: p.special(p.propertyName),
  "CallExpression/MemberExpression/PropertyName": p.function(p.propertyName),
  "FunctionDeclaration/VariableDefinition": p.function(p.definition(p.variableName)),
  "ClassDeclaration/VariableDefinition": p.definition(p.className),
  PropertyDefinition: p.definition(p.propertyName),
  PrivatePropertyDefinition: p.definition(p.special(p.propertyName)),
  UpdateOp: p.updateOperator,
  LineComment: p.lineComment,
  BlockComment: p.blockComment,
  Number: p.number,
  String: p.string,
  ArithOp: p.arithmeticOperator,
  LogicOp: p.logicOperator,
  BitOp: p.bitwiseOperator,
  CompareOp: p.compareOperator,
  RegExp: p.regexp,
  Equals: p.definitionOperator,
  Arrow: p.function(p.punctuation),
  ": Spread": p.punctuation,
  "( )": p.paren,
  "[ ]": p.squareBracket,
  "{ }": p.brace,
  "InterpolationStart InterpolationEnd": p.special(p.brace),
  ".": p.derefOperator,
  ", ;": p.separator,
  TypeName: p.typeName,
  TypeDefinition: p.definition(p.typeName),
  "type enum interface implements namespace module declare": p.definitionKeyword,
  "abstract global Privacy readonly override": p.modifier,
  "is keyof unique infer": p.operatorKeyword,
  JSXAttributeValue: p.attributeValue,
  JSXText: p.content,
  "JSXStartTag JSXStartCloseTag JSXSelfCloseEndTag JSXEndTag": p.angleBracket,
  "JSXIdentifier JSXNameSpacedName": p.tagName,
  "JSXAttribute/JSXIdentifier JSXAttribute/JSXNameSpacedName": p.attributeName
}), l0 = { __proto__: null, export: 18, as: 23, from: 29, default: 32, async: 37, function: 38, this: 48, true: 56, false: 56, void: 66, typeof: 70, null: 86, super: 88, new: 122, await: 139, yield: 141, delete: 142, class: 152, extends: 154, public: 197, private: 197, protected: 197, readonly: 199, instanceof: 220, in: 222, const: 224, import: 256, keyof: 307, unique: 311, infer: 317, is: 351, abstract: 371, implements: 373, type: 375, let: 378, var: 380, interface: 387, enum: 391, namespace: 397, module: 399, declare: 403, global: 407, for: 428, of: 437, while: 440, with: 444, do: 448, if: 452, else: 454, switch: 458, case: 464, try: 470, catch: 474, finally: 478, return: 482, throw: 486, break: 490, continue: 494, debugger: 498 }, a0 = { __proto__: null, async: 109, get: 111, set: 113, public: 161, private: 161, protected: 161, static: 163, abstract: 165, override: 167, readonly: 173, new: 355 }, h0 = { __proto__: null, "<": 129 }, c0 = Ht.deserialize({
  version: 14,
  states: "$8SO`QdOOO'QQ(C|O'#ChO'XOWO'#DVO)dQdO'#D]O)tQdO'#DhO){QdO'#DrO-xQdO'#DxOOQO'#E]'#E]O.]Q`O'#E[O.bQ`O'#E[OOQ(C['#Ef'#EfO0aQ(C|O'#ItO2wQ(C|O'#IuO3eQ`O'#EzO3jQ!bO'#FaOOQ(C['#FS'#FSO3rO#tO'#FSO4QQ&jO'#FhO5bQ`O'#FgOOQ(C['#Iu'#IuOOQ(CW'#It'#ItOOQS'#J^'#J^O5gQ`O'#HpO5lQ(ChO'#HqOOQS'#Ih'#IhOOQS'#Hr'#HrQ`QdOOO){QdO'#DjO5tQ`O'#G[O5yQ&jO'#CmO6XQ`O'#EZO6dQ`O'#EgO6iQ,UO'#FRO7TQ`O'#G[O7YQ`O'#G`O7eQ`O'#G`O7sQ`O'#GcO7sQ`O'#GdO7sQ`O'#GfO5tQ`O'#GiO8dQ`O'#GlO9rQ`O'#CdO:SQ`O'#GyO:[Q`O'#HPO:[Q`O'#HRO`QdO'#HTO:[Q`O'#HVO:[Q`O'#HYO:aQ`O'#H`O:fQ(CjO'#HfO){QdO'#HhO:qQ(CjO'#HjO:|Q(CjO'#HlO5lQ(ChO'#HnO){QdO'#DWOOOW'#Ht'#HtO;XOWO,59qOOQ(C[,59q,59qO=jQtO'#ChO=tQdO'#HuO>XQ`O'#IvO@WQtO'#IvO'dQdO'#IvO@_Q`O,59wO@uQ7[O'#DbOAnQ`O'#E]OA{Q`O'#JROBWQ`O'#JQOBWQ`O'#JQOB`Q`O,5:yOBeQ`O'#JPOBlQaO'#DyO5yQ&jO'#EZOBzQ`O'#EZOCVQpO'#FROOQ(C[,5:S,5:SOC_QdO,5:SOE]Q(C|O,5:^OEyQ`O,5:dOFdQ(ChO'#JOO7YQ`O'#I}OFkQ`O'#I}OFsQ`O,5:xOFxQ`O'#I}OGWQdO,5:vOIWQ&jO'#EWOJeQ`O,5:vOKwQ&jO'#DlOLOQdO'#DqOLYQ7[O,5;PO){QdO,5;POOQS'#Er'#ErOOQS'#Et'#EtO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;ROOQS'#Ex'#ExOLbQdO,5;cOOQ(C[,5;h,5;hOOQ(C[,5;i,5;iONbQ`O,5;iOOQ(C[,5;j,5;jO){QdO'#IPONgQ(ChO,5<TO! RQ&jO,5;RO){QdO,5;fO! kQ!bO'#JVO! YQ!bO'#JVO! rQ!bO'#JVO!!TQ!bO,5;qOOOO,5;{,5;{O!!cQdO'#FcOOOO'#IO'#IOO3rO#tO,5;nO!!jQ!bO'#FeOOQ(C[,5;n,5;nO!#WQ,VO'#CrOOQ(C]'#Cu'#CuO!#kQ`O'#CuO!#pOWO'#CyO!$^Q,VO,5<QO!$eQ`O,5<SO!%tQ&jO'#FrO!&RQ`O'#FsO!&WQ`O'#FsO!&]Q&jO'#FwO!'[Q7[O'#F{O!'}Q,VO'#IqOOQ(C]'#Iq'#IqO!(XQaO'#IpO!(gQ`O'#IoO!(oQ`O'#CqOOQ(C]'#Cs'#CsOOQ(C]'#C|'#C|O!(wQ`O'#DOOJjQ&jO'#FjOJjQ&jO'#FlO!(|Q`O'#FnO!)RQ`O'#FoO!&WQ`O'#FuOJjQ&jO'#FzO!)WQ`O'#E^O!)oQ`O,5<RO`QdO,5>[OOQS'#Ik'#IkOOQS,5>],5>]OOQS-E;p-E;pO!+kQ(C|O,5:UOOQ(CX'#Cp'#CpO!,[Q&kO,5<vOOQO'#Cf'#CfO!,mQ(ChO'#IlO5bQ`O'#IlO:aQ`O,59XO!-OQ!bO,59XO!-WQ&jO,59XO5yQ&jO,59XO!-cQ`O,5:vO!-kQ`O'#GxO!-yQ`O'#JbO){QdO,5;kO!.RQ7[O,5;mO!.WQ`O,5=cO!.]Q`O,5=cO!.bQ`O,5=cO5lQ(ChO,5=cO5tQ`O,5<vO!.pQ`O'#E_O!/UQ7[O'#E`OOQ(CW'#JP'#JPO!/gQ(ChO'#J_O5lQ(ChO,5<zO7sQ`O,5=QOOQP'#Cr'#CrO!/rQ!bO,5<}O!/zQ!cO,5=OO!0VQ`O,5=QO!0[QpO,5=TO:aQ`O'#GnO5tQ`O'#GpO!0dQ`O'#GpO5yQ&jO'#GsO!0iQ`O'#GsOOQS,5=W,5=WO!0nQ`O'#GtO!0vQ`O'#CmO!0{Q`O,59OO!1VQ`O,59OO!3XQdO,59OOOQS,59O,59OO!3fQ(ChO,59OO){QdO,59OO!3qQdO'#G{OOQS'#G|'#G|OOQS'#G}'#G}O`QdO,5=eO!4RQ`O,5=eO){QdO'#DxO`QdO,5=kO`QdO,5=mO!4WQ`O,5=oO`QdO,5=qO!4]Q`O,5=tO!4bQdO,5=zOOQS,5>Q,5>QO){QdO,5>QO5lQ(ChO,5>SOOQS,5>U,5>UO!8cQ`O,5>UOOQS,5>W,5>WO!8cQ`O,5>WOOQS,5>Y,5>YO!8hQpO,59rOOOW-E;r-E;rOOQ(C[1G/]1G/]O!8mQtO,5>aO'dQdO,5>aOOQO,5>f,5>fO!8wQdO'#HuOOQO-E;s-E;sO!9UQ`O,5?bO!9^QtO,5?bO!9eQ`O,5?lOOQ(C[1G/c1G/cO!9mQ!bO'#DTOOQO'#Ix'#IxO){QdO'#IxO!:[Q!bO'#IxO!:yQ!bO'#DcO!;[Q7[O'#DcO!=gQdO'#DcO!=nQ`O'#IwO!=vQ`O,59|O!={Q`O'#EaO!>ZQ`O'#JSO!>cQ`O,5:zO!>yQ7[O'#DcO){QdO,5?mO!?TQ`O'#HzOOQO-E;x-E;xO!9eQ`O,5?lOOQ(CW1G0e1G0eO!@aQ7[O'#D|OOQ(C[,5:e,5:eO){QdO,5:eOIWQ&jO,5:eO!@hQaO,5:eO:aQ`O,5:uO!-OQ!bO,5:uO!-WQ&jO,5:uO5yQ&jO,5:uOOQ(C[1G/n1G/nOOQ(C[1G0O1G0OOOQ(CW'#EV'#EVO){QdO,5?jO!@sQ(ChO,5?jO!AUQ(ChO,5?jO!A]Q`O,5?iO!AeQ`O'#H|O!A]Q`O,5?iOOQ(CW1G0d1G0dO7YQ`O,5?iOOQ(C[1G0b1G0bO!BPQ(C|O1G0bO!CRQ(CyO,5:rOOQ(C]'#Fq'#FqO!CoQ(C}O'#IqOGWQdO1G0bO!EqQ,VO'#IyO!E{Q`O,5:WO!FQQtO'#IzO){QdO'#IzO!F[Q`O,5:]OOQ(C]'#DT'#DTOOQ(C[1G0k1G0kO!FaQ`O1G0kO!HrQ(C|O1G0mO!HyQ(C|O1G0mO!K^Q(C|O1G0mO!KeQ(C|O1G0mO!MlQ(C|O1G0mO!NPQ(C|O1G0mO#!pQ(C|O1G0mO#!wQ(C|O1G0mO#%[Q(C|O1G0mO#%cQ(C|O1G0mO#'WQ(C|O1G0mO#*QQMlO'#ChO#+{QMlO1G0}O#-vQMlO'#IuOOQ(C[1G1T1G1TO#.ZQ(C|O,5>kOOQ(CW-E;}-E;}O#.zQ(C}O1G0mOOQ(C[1G0m1G0mO#1PQ(C|O1G1QO#1pQ!bO,5;sO#1uQ!bO,5;tO#1zQ!bO'#F[O#2`Q`O'#FZOOQO'#JW'#JWOOQO'#H}'#H}O#2eQ!bO1G1]OOQ(C[1G1]1G1]OOOO1G1f1G1fO#2sQMlO'#ItO#2}Q`O,5;}OLbQdO,5;}OOOO-E;|-E;|OOQ(C[1G1Y1G1YOOQ(C[,5<P,5<PO#3SQ!bO,5<POOQ(C],59a,59aOIWQ&jO'#C{OOOW'#Hs'#HsO#3XOWO,59eOOQ(C],59e,59eO){QdO1G1lO!)RQ`O'#IRO#3dQ`O,5<eOOQ(C],5<b,5<bOOQO'#GV'#GVOJjQ&jO,5<pOOQO'#GX'#GXOJjQ&jO,5<rOIWQ&jO,5<tOOQO1G1n1G1nO#3oQqO'#CpO#4SQqO,5<^O#4ZQ`O'#JZO5tQ`O'#JZO#4iQ`O,5<`OJjQ&jO,5<_O#4nQ`O'#FtO#4yQ`O,5<_O#5OQqO'#FqO#5]QqO'#J[O#5gQ`O'#J[OIWQ&jO'#J[O#5lQ`O,5<cOOQ(CW'#Dg'#DgO#5qQ!bO'#F|O!'VQ7[O'#F|O!'VQ7[O'#GOO#6SQ`O'#GPO!&WQ`O'#GSO#6XQ(ChO'#ITO#6dQ7[O,5<gOOQ(C],5<g,5<gO#6kQ7[O'#F|O#6yQ7[O'#F}O#7RQ7[O'#F}OOQ(C],5<u,5<uOJjQ&jO,5?[OJjQ&jO,5?[O#7WQ`O'#IUO#7cQ`O,5?ZO#7kQ`O,59]OOQ(C]'#Ch'#ChO#8[Q,VO,59jOOQ(C],59j,59jO#8}Q,VO,5<UO#9pQ,VO,5<WO#9zQ`O,5<YOOQ(C],5<Z,5<ZO#:PQ`O,5<aO#:UQ,VO,5<fOGWQdO1G1mO#:fQ`O1G1mOOQS1G3v1G3vOOQ(C[1G/p1G/pONbQ`O1G/pOOQS1G2b1G2bOIWQ&jO1G2bO){QdO1G2bOIWQ&jO1G2bO#:kQaO1G2bO#<QQ&jO'#EWOOQ(CW,5?W,5?WO#<[Q(ChO,5?WOOQS1G.s1G.sO:aQ`O1G.sO!-OQ!bO1G.sO!-WQ&jO1G.sO#<mQ`O1G0bO#<rQ`O'#ChO#<}Q`O'#JcO#=VQ`O,5=dO#=[Q`O'#JcO#=aQ`O'#JcO#=iQ`O'#I^O#=wQ`O,5?|O#>PQtO1G1VOOQ(C[1G1X1G1XO5tQ`O1G2}O#>WQ`O1G2}O#>]Q`O1G2}O#>bQ`O1G2}OOQS1G2}1G2}O#>gQ&kO1G2bO7YQ`O'#JQO7YQ`O'#EaO7YQ`O'#IWO#>xQ(ChO,5?yOOQS1G2f1G2fO!0VQ`O1G2lOIWQ&jO1G2iO#?TQ`O1G2iOOQS1G2j1G2jOIWQ&jO1G2jO#?YQaO1G2jO#?bQ7[O'#GhOOQS1G2l1G2lO!'VQ7[O'#IYO!0[QpO1G2oOOQS1G2o1G2oOOQS,5=Y,5=YO#?jQ&kO,5=[O5tQ`O,5=[O#6SQ`O,5=_O5bQ`O,5=_O!-OQ!bO,5=_O!-WQ&jO,5=_O5yQ&jO,5=_O#?{Q`O'#JaO#@WQ`O,5=`OOQS1G.j1G.jO#@]Q(ChO1G.jO#@hQ`O1G.jO#@mQ`O1G.jO5lQ(ChO1G.jO#@uQtO,5@OO#APQ`O,5@OO#A[QdO,5=gO#AcQ`O,5=gO7YQ`O,5@OOOQS1G3P1G3PO`QdO1G3POOQS1G3V1G3VOOQS1G3X1G3XO:[Q`O1G3ZO#AhQdO1G3]O#EcQdO'#H[OOQS1G3`1G3`O#EpQ`O'#HbO:aQ`O'#HdOOQS1G3f1G3fO#ExQdO1G3fO5lQ(ChO1G3lOOQS1G3n1G3nOOQ(CW'#Fx'#FxO5lQ(ChO1G3pO5lQ(ChO1G3rOOOW1G/^1G/^O#IvQpO,5<TO#JOQtO1G3{OOQO1G4Q1G4QO){QdO,5>aO#JYQ`O1G4|O#JbQ`O1G5WO#JjQ`O,5?dOLbQdO,5:{O7YQ`O,5:{O:aQ`O,59}OLbQdO,59}O!-OQ!bO,59}O#JoQMlO,59}OOQO,5:{,5:{O#JyQ7[O'#HvO#KaQ`O,5?cOOQ(C[1G/h1G/hO#KiQ7[O'#H{O#K}Q`O,5?nOOQ(CW1G0f1G0fO!;[Q7[O,59}O#LVQtO1G5XO7YQ`O,5>fOOQ(CW'#ES'#ESO#LaQ(DjO'#ETO!@XQ7[O'#D}OOQO'#Hy'#HyO#L{Q7[O,5:hOOQ(C[,5:h,5:hO#MSQ7[O'#D}O#MeQ7[O'#D}O#MlQ7[O'#EYO#MoQ7[O'#ETO#M|Q7[O'#ETO!@XQ7[O'#ETO#NaQ`O1G0PO#NfQqO1G0POOQ(C[1G0P1G0PO){QdO1G0POIWQ&jO1G0POOQ(C[1G0a1G0aO:aQ`O1G0aO!-OQ!bO1G0aO!-WQ&jO1G0aO#NmQ(C|O1G5UO){QdO1G5UO#N}Q(ChO1G5UO$ `Q`O1G5TO7YQ`O,5>hOOQO,5>h,5>hO$ hQ`O,5>hOOQO-E;z-E;zO$ `Q`O1G5TO$ vQ(C}O,59jO$#xQ(C}O,5<UO$%}Q(C}O,5<WO$(SQ(C}O,5<fOOQ(C[7+%|7+%|O$*_Q(C|O7+%|O$+OQ&jO'#HwO$+YQ`O,5?eOOQ(C]1G/r1G/rO$+bQdO'#HxO$+oQ`O,5?fO$+wQtO,5?fOOQ(C[1G/w1G/wOOQ(C[7+&V7+&VO$,RQMlO,5:^O){QdO7+&iO$,]QMlO,5:UOOQO1G1_1G1_OOQO1G1`1G1`O$,jQ!LQO,5;vOLbQdO,5;uOOQO-E;{-E;{OOQ(C[7+&w7+&wOOOO7+'Q7+'QOOOO1G1i1G1iO$,uQ`O1G1iOOQ(C[1G1k1G1kO$,zQqO,59gOOOW-E;q-E;qOOQ(C]1G/P1G/PO$-RQ(C|O7+'WOOQ(C],5>m,5>mO$-rQ`O,5>mOOQ(C]1G2P1G2PP$-wQ`O'#IRPOQ(C]-E<P-E<PO$.hQ,VO1G2[O$/ZQ,VO1G2^O$/eQqO1G2`OOQ(C]1G1x1G1xO$/lQ`O'#IQO$/zQ`O,5?uO$/zQ`O,5?uO$0SQ`O,5?uO$0_Q`O,5?uOOQO1G1z1G1zO$0mQ,VO1G1yOJjQ&jO1G1yO$0}Q&jO'#ISO$1_Q`O,5?vOIWQ&jO,5?vO$1gQqO,5?vOOQ(C]1G1}1G1}OOQ(CW,5<h,5<hOOQ(CW,5<i,5<iO$1qQ`O,5<iO#5}Q`O,5<iO!-OQ!bO,5<hO$1vQ`O,5<jOOQ(CW,5<k,5<kO$1qQ`O,5<nOOQO,5>o,5>oOOQO-E<R-E<ROOQ(C]1G2R1G2RO!'VQ7[O,5<hO$2OQ`O,5<iO!'VQ7[O,5<jO!'VQ7[O,5<iO$2ZQ,VO1G4vO$2eQ,VO1G4vOOQO,5>p,5>pOOQO-E<S-E<SOOQP1G.w1G.wO!.RQ7[O,59lO){QdO,59lO$2rQ`O1G1tOJjQ&jO1G1{O$2wQ(C|O7+'XOOQ(C[7+'X7+'XOGWQdO7+'XOOQ(C[7+%[7+%[O$3hQqO'#J]O#NaQ`O7+'|O$3rQ`O7+'|O$3zQqO7+'|OOQS7+'|7+'|OIWQ&jO7+'|O){QdO7+'|OIWQ&jO7+'|O$4UQ(CyO'#ChO$4iQ(CyO,5<lO$5ZQ`O,5<lOOQ(CW1G4r1G4rOOQS7+$_7+$_O:aQ`O7+$_O!-OQ!bO7+$_OGWQdO7+%|O$5`Q`O'#I]O$5qQ`O,5?}OOQO1G3O1G3OO5tQ`O,5?}O$5qQ`O,5?}O$5yQ`O,5?}OOQO,5>x,5>xOOQO-E<[-E<[OOQ(C[7+&q7+&qO$6OQ`O7+(iO5lQ(ChO7+(iO5tQ`O7+(iO$6TQ`O7+(iO$6YQaO7+'|OOQ(CW,5>r,5>rOOQ(CW-E<U-E<UOOQS7+(W7+(WO$6hQ(CyO7+(TOIWQ&jO7+(TO$6rQqO7+(UOOQS7+(U7+(UOIWQ&jO7+(UO$6yQ`O'#J`O$7UQ`O,5=SOOQO,5>t,5>tOOQO-E<W-E<WOOQS7+(Z7+(ZO$8OQ7[O'#GqOOQS1G2v1G2vOIWQ&jO1G2vO){QdO1G2vOIWQ&jO1G2vO$8VQaO1G2vO$8eQ&kO1G2vO5lQ(ChO1G2yO#6SQ`O1G2yO5bQ`O1G2yO!-OQ!bO1G2yO!-WQ&jO1G2yO$8vQ`O'#I[O$9RQ`O,5?{O$9ZQ7[O,5?{OOQ(CW1G2z1G2zOOQS7+$U7+$UO$9cQ`O7+$UO5lQ(ChO7+$UO$9hQ`O7+$UO){QdO1G5jO){QdO1G5kO$9mQdO1G3RO$9tQ`O1G3RO$9yQdO1G3RO$:QQ(ChO1G5jOOQS7+(k7+(kO5lQ(ChO7+(uO`QdO7+(wOOQS'#Jf'#JfOOQS'#I_'#I_O$:[QdO,5=vOOQS,5=v,5=vO){QdO'#H]O$:iQ`O'#H_OOQS,5=|,5=|O7YQ`O,5=|OOQS,5>O,5>OOOQS7+)Q7+)QOOQS7+)W7+)WOOQS7+)[7+)[OOQS7+)^7+)^OOQO1G5O1G5OO$:nQMlO1G0gO$:xQ`O1G0gOOQO1G/i1G/iO$;TQMlO1G/iO:aQ`O1G/iOLbQdO'#DcOOQO,5>b,5>bOOQO-E;t-E;tOOQO,5>g,5>gOOQO-E;y-E;yO!-OQ!bO1G/iO:aQ`O,5:iOOQO,5:o,5:oO){QdO,5:oO$;_Q(ChO,5:oO$;jQ(ChO,5:oO!-OQ!bO,5:iOOQO-E;w-E;wOOQ(C[1G0S1G0SO!@XQ7[O,5:iO$;xQ7[O,5:iO$<ZQ(DjO,5:oO$<uQ7[O,5:iO!@XQ7[O,5:oOOQO,5:t,5:tO$<|Q7[O,5:oO$=ZQ(ChO,5:oOOQ(C[7+%k7+%kO#NaQ`O7+%kO#NfQqO7+%kOOQ(C[7+%{7+%{O:aQ`O7+%{O!-OQ!bO7+%{O$=oQ(C|O7+*pO){QdO7+*pOOQO1G4S1G4SO7YQ`O1G4SO$>PQ`O7+*oO$>XQ(C}O1G2[O$@^Q(C}O1G2^O$BcQ(C}O1G1yO$DnQ,VO,5>cOOQO-E;u-E;uO$DxQtO,5>dO){QdO,5>dOOQO-E;v-E;vO$ESQ`O1G5QO$E[QMlO1G0bO$GcQMlO1G0mO$GjQMlO1G0mO$IkQMlO1G0mO$IrQMlO1G0mO$KgQMlO1G0mO$KzQMlO1G0mO$NXQMlO1G0mO$N`QMlO1G0mO%!aQMlO1G0mO%!hQMlO1G0mO%$]QMlO1G0mO%$pQ(C|O<<JTO%%rQMmO1G0mO%'|QMmO'#IqO%)iQMlO1G1QOLbQdO'#F^OOQO'#JX'#JXOOQO1G1b1G1bO%)vQ`O1G1aO%){QMlO,5>kOOOO7+'T7+'TOOOW1G/R1G/ROOQ(C]1G4X1G4XOJjQ&jO7+'zO%*VQ`O,5>lO5tQ`O,5>lOOQO-E<O-E<OO%*eQ`O1G5aO%*eQ`O1G5aO%*mQ`O1G5aO%*xQ,VO7+'eO%+YQqO,5>nO%+dQ`O,5>nOIWQ&jO,5>nOOQO-E<Q-E<QO%+iQqO1G5bO%+sQ`O1G5bOOQ(CW1G2T1G2TO$1qQ`O1G2TOOQ(CW1G2S1G2SO%+{Q`O1G2UOIWQ&jO1G2UOOQ(CW1G2Y1G2YO!-OQ!bO1G2SO#5}Q`O1G2TO%,QQ`O1G2UO%,YQ`O1G2TOJjQ&jO7+*bOOQ(C]1G/W1G/WO%,eQ`O1G/WOOQ(C]7+'`7+'`O%,jQ,VO7+'gO%,zQ(C|O<<JsOOQ(C[<<Js<<JsOIWQ&jO'#IVO%-kQ`O,5?wOOQS<<Kh<<KhOIWQ&jO<<KhO#NaQ`O<<KhO%-sQ`O<<KhO%-{QqO<<KhOIWQ&jO1G2WOOQS<<Gy<<GyO:aQ`O<<GyO%.VQ(C|O<<IhOOQ(C[<<Ih<<IhOOQO,5>w,5>wO%.vQ`O,5>wO%.{Q`O,5>wOOQO-E<Z-E<ZO%/TQ`O1G5iO%/TQ`O1G5iO5tQ`O1G5iO%/]Q`O<<LTOOQS<<LT<<LTO%/bQ`O<<LTO5lQ(ChO<<LTO){QdO<<KhOIWQ&jO<<KhOOQS<<Ko<<KoO$6hQ(CyO<<KoOOQS<<Kp<<KpO$6rQqO<<KpO%/gQ7[O'#IXO%/rQ`O,5?zOLbQdO,5?zOOQS1G2n1G2nO#LaQ(DjO'#ETO!@XQ7[O'#GrOOQO'#IZ'#IZO%/zQ7[O,5=]OOQS,5=],5=]O%0RQ7[O'#ETO%0^Q7[O'#ETO%0uQ7[O'#ETO%1PQ7[O'#GrO%1bQ`O7+(bO%1gQ`O7+(bO%1oQqO7+(bOOQS7+(b7+(bOIWQ&jO7+(bO){QdO7+(bOIWQ&jO7+(bO%1yQaO7+(bOOQS7+(e7+(eO5lQ(ChO7+(eO#6SQ`O7+(eO5bQ`O7+(eO!-OQ!bO7+(eO%2XQ`O,5>vOOQO-E<Y-E<YOOQO'#Gu'#GuO%2dQ`O1G5gO5lQ(ChO<<GpOOQS<<Gp<<GpO%2lQ`O<<GpO%2qQ`O7++UO%2vQ`O7++VOOQS7+(m7+(mO%2{Q`O7+(mO%3QQdO7+(mO%3XQ`O7+(mO){QdO7++UO){QdO7++VOOQS<<La<<LaOOQS<<Lc<<LcOOQS-E<]-E<]OOQS1G3b1G3bO%3^Q`O,5=wOOQS,5=y,5=yO%3cQ`O1G3hOLbQdO7+&ROOQO7+%T7+%TO%3hQMlO1G5XO:aQ`O7+%TOOQO1G0T1G0TO%3rQ(C|O1G0ZOOQO1G0Z1G0ZO){QdO1G0ZO%3|Q(ChO1G0ZO:aQ`O1G0TO!-OQ!bO1G0TO!@XQ7[O1G0TO%4XQ(ChO1G0ZO%4gQ7[O1G0TO%4xQ(ChO1G0ZO%5^Q(DjO1G0ZO%5hQ7[O1G0TO!@XQ7[O1G0ZOOQ(C[<<IV<<IVOOQ(C[<<Ig<<IgO:aQ`O<<IgO%5oQ(C|O<<N[OOQO7+)n7+)nO%6PQ(C}O7+'eO%8[Q(C}O7+'gO%:gQtO1G4OO%:qQMlO7+%|O%;gQMmO,59jO%=hQMmO,5<UO%?lQMmO,5<WO%A[QMmO,5<fO%B}QMlO7+'WO%C[QMlO7+'XO%CiQ`O,5;xOOQO7+&{7+&{O%CnQ,VO<<KfOOQO1G4W1G4WO%CuQ`O1G4WO%DQQ`O1G4WO%D`Q`O7+*{O%D`Q`O7+*{OIWQ&jO1G4YO%DhQqO1G4YO%DrQ`O7+*|OOQ(CW7+'o7+'oO$1qQ`O7+'pO%DzQqO7+'pOOQ(CW7+'n7+'nO$1qQ`O7+'oO%ERQ`O7+'pOIWQ&jO7+'pO#5}Q`O7+'oO%EWQ,VO<<M|OOQ(C]7+$r7+$rO%EbQqO,5>qOOQO-E<T-E<TO#NaQ`OANASOOQSANASANASOIWQ&jOANASO%ElQ(CyO7+'rOOQSAN=eAN=eO5tQ`O1G4cOOQO1G4c1G4cO%E|Q`O1G4cO%FRQ`O7++TO%FRQ`O7++TO5lQ(ChOANAoO%FZQ`OANAoOOQSANAoANAoO%F`Q`OANASO%FhQqOANASOOQSANAZANAZOOQSANA[ANA[O%FrQ`O,5>sOOQO-E<V-E<VO%F}QMlO1G5fO#6SQ`O,5=^O5bQ`O,5=^O!-OQ!bO,5=^OOQO-E<X-E<XOOQS1G2w1G2wO$<ZQ(DjO,5:oO!@XQ7[O,5=^O%GXQ7[O,5=^O%GjQ7[O,5:oOOQS<<K|<<K|OIWQ&jO<<K|O%1bQ`O<<K|O%GtQ`O<<K|O%G|QqO<<K|O){QdO<<K|OIWQ&jO<<K|OOQS<<LP<<LPO5lQ(ChO<<LPO#6SQ`O<<LPO5bQ`O<<LPO%HWQ7[O1G4bO%H`Q`O7++ROOQSAN=[AN=[O5lQ(ChOAN=[OOQS<<Np<<NpOOQS<<Nq<<NqOOQS<<LX<<LXO%HhQ`O<<LXO%HmQdO<<LXO%HtQ`O<<NpO%HyQ`O<<NqOOQS1G3c1G3cO:aQ`O7+)SO%IOQMlO<<ImOOQO<<Ho<<HoOOQO7+%u7+%uO%3rQ(C|O7+%uO){QdO7+%uOOQO7+%o7+%oO:aQ`O7+%oO!-OQ!bO7+%oO%IYQ(ChO7+%uO!@XQ7[O7+%oO%IeQ(ChO7+%uO%IsQ7[O7+%oO%JUQ(ChO7+%uOOQ(C[AN?RAN?RO%JjQMlO<<JTO%JwQMmO1G1yO%MOQMmO1G2[O& SQMmO1G2^O&!rQMlO<<JsO&#PQMlO<<IhOOQO1G1d1G1dOJjQ&jOANAQOOQO7+)r7+)rO&#^Q`O7+)rO&#iQ`O<<NgO&#qQqO7+)tOOQ(CW<<K[<<K[O$1qQ`O<<K[OOQ(CW<<KZ<<KZO&#{QqO<<K[O$1qQ`O<<KZOOQSG26nG26nO#NaQ`OG26nOOQO7+)}7+)}O5tQ`O7+)}O&$SQ`O<<NoOOQSG27ZG27ZO5lQ(ChOG27ZOIWQ&jOG26nOLbQdO1G4_O&$[Q`O7++QO5lQ(ChO1G2xO#6SQ`O1G2xO5bQ`O1G2xO!-OQ!bO1G2xO!@XQ7[O1G2xO%5^Q(DjO1G0ZO&$dQ7[O1G2xO%1bQ`OANAhOOQSANAhANAhOIWQ&jOANAhO&$uQ`OANAhO&$}QqOANAhOOQSANAkANAkO5lQ(ChOANAkO#6SQ`OANAkOOQO'#Gv'#GvOOQO7+)|7+)|OOQSG22vG22vOOQSANAsANAsO&%XQ`OANAsOOQSAND[AND[OOQSAND]AND]OOQS<<Ln<<LnOOQO<<Ia<<IaO%3rQ(C|O<<IaOOQO<<IZ<<IZO:aQ`O<<IZO){QdO<<IaO!-OQ!bO<<IZO&%^Q(ChO<<IaO!@XQ7[O<<IZO&%iQ(ChO<<IaO&%wQMmO7+'eO&'jQMmO7+'gO&)]Q,VOG26lOOQO<<M^<<M^OOQ(CWAN@vAN@vO$1qQ`OAN@vOOQ(CWAN@uAN@uOOQSLD,YLD,YOOQO<<Mi<<MiOOQSLD,uLD,uO#NaQ`OLD,YO&)mQMlO7+)yOOQO7+(d7+(dO5lQ(ChO7+(dO#6SQ`O7+(dO5bQ`O7+(dO!-OQ!bO7+(dO!@XQ7[O7+(dOOQSG27SG27SO%1bQ`OG27SOIWQ&jOG27SOOQSG27VG27VO5lQ(ChOG27VOOQSG27_G27_OOQOAN>{AN>{OOQOAN>uAN>uO%3rQ(C|OAN>{O:aQ`OAN>uO){QdOAN>{O!-OQ!bOAN>uO&)wQ(ChOAN>{O&*SQ(C}OG26lOOQ(CWG26bG26bOOQS!$( t!$( tOOQO<<LO<<LOO5lQ(ChO<<LOO#6SQ`O<<LOO5bQ`O<<LOO!-OQ!bO<<LOOOQSLD,nLD,nO%1bQ`OLD,nOOQSLD,qLD,qOOQOG24gG24gOOQOG24aG24aO%3rQ(C|OG24gO:aQ`OG24aO){QdOG24gO&,pQ!LRO,5:rO&-gQ$ITO'#IqOOQOANAjANAjO5lQ(ChOANAjO#6SQ`OANAjO5bQ`OANAjOOQS!$(!Y!$(!YOOQOLD*RLD*ROOQOLD){LD){O%3rQ(C|OLD*RO&.ZQMmOG26lO&/|Q!LRO,59jO&0pQ!LRO,5<UO&1dQ!LRO,5<WO&2WQ!LRO,5<fOOQOG27UG27UO5lQ(ChOG27UO#6SQ`OG27UOOQO!$'Mm!$'MmO&2}Q!LRO1G2[O&3qQ!LRO1G2^O&4eQ!LRO1G1yOOQOLD,pLD,pO5lQ(ChOLD,pO&5[Q!LRO7+'eO&6RQ!LRO7+'gOOQO!$(![!$(![O&6xQ!LROG26lOLbQdO'#DrO&7oQtO'#ItOLbQdO'#DjO&7vQ(C|O'#ChO&8aQtO'#ChO&8qQdO,5:vO&:qQ&jO'#EWOLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO'#IPO&<OQ`O,5<TO&=eQ&jO,5;ROLbQdO,5;fO!(wQ`O'#DOO!(wQ`O'#DOO!(wQ`O'#DOOIWQ&jO'#FjO&:qQ&jO'#FjO&<WQ&jO'#FjOIWQ&jO'#FlO&:qQ&jO'#FlO&<WQ&jO'#FlOIWQ&jO'#FzO&:qQ&jO'#FzO&<WQ&jO'#FzOLbQdO,5?mO&8qQdO1G0bO&=lQMlO'#ChOLbQdO1G1lOIWQ&jO,5<pO&:qQ&jO,5<pO&<WQ&jO,5<pOIWQ&jO,5<rO&:qQ&jO,5<rO&<WQ&jO,5<rOIWQ&jO,5<_O&:qQ&jO,5<_O&<WQ&jO,5<_O&8qQdO1G1mOLbQdO7+&iOIWQ&jO1G1yO&:qQ&jO1G1yO&<WQ&jO1G1yOIWQ&jO1G1{O&:qQ&jO1G1{O&<WQ&jO1G1{O&8qQdO7+'XO&8qQdO7+%|O&=vQ`O7+'pOIWQ&jOANAQO&:qQ&jOANAQO&<WQ&jOANAQO&=vQ`O<<K[O&=vQ`OAN@vO&={Q`O'#E[O&>QQ`O'#E[O&>YQ`O'#EzO&>_Q`O'#EgO&>dQ`O'#JRO&>oQ`O'#JPO&>zQ`O,5:vO&?PQ,VO,5<QO&?WQ`O'#FsO&?]Q`O'#FsO&?bQ`O'#FsO&?gQ`O,5<RO&?oQ`O,5:vO&?wQMlO1G0}O&@OQ`O,5<_O&@TQ`O,5<_O&@YQ`O,5<_O&@_Q`O,5<aO&@dQ`O,5<aO&@iQ`O,5<aO&@nQ`O1G1mO&@sQ`O1G0bO&@xQ`O1G2UO&@}Q,VO<<KfO&AUQ,VO<<KfO&A]Q,VO<<KfO&AdQqO7+'pO&AkQ`O7+'pO&ApQqO<<K[O4QQ&jO'#FhO5bQ`O'#FgOBzQ`O'#EZOLbQdO,5;cO!&WQ`O'#FsO!&WQ`O'#FsO!&WQ`O'#FsO!&WQ`O'#FuO!&WQ`O'#FuO!&WQ`O'#FuO&AwQ`O,5<jOJjQ&jO7+'zOJjQ&jO7+'zOJjQ&jO7+'zOIWQ&jO1G2UO&BPQ`O1G2UOIWQ&jO7+'pO!'VQ7[O'#GOO$/eQqO1G2`O$/eQqO1G2`O$/eQqO1G2`O!'VQ7[O,5<jOIWQ&jO,5<tOIWQ&jO,5<tOIWQ&jO,5<t",
  stateData: "&B}~O'YOS'ZOSTOSUOS~OQTORTOXyO]cO_hObnOcmOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!TSO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!nlO#dsO#tpO#x^O%PqO%RtO%TrO%UrO%XuO%ZvO%^wO%_wO%axO%nzO%t{O%v|O%x}O%z!OO%}!PO&T!QO&Z!RO&]!SO&_!TO&a!UO&c!VO']PO'fQO'oYO'|aO~OQ[XZ[X_[Xj[Xu[Xv[Xx[X!R[X!a[X!b[X!d[X!j[X!{[X#WdX#[[X#][X#^[X#_[X#`[X#a[X#b[X#c[X#e[X#g[X#i[X#j[X#o[X'W[X'f[X'p[X'w[X'x[X~O!]$lX~P$zOS!WO'U!XO'V!ZO~OQTORTO]cOb!kOc!jOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!T!bO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!n!iO#t!lO#x^O']![O'fQO'oYO'|aO~O!Q!`O!R!]O!O'jP!O'tP~P'dO!S!mO~P`OQTORTO]cOb!kOc!jOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!T!bO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!n!iO#t!lO#x^O']9aO'fQO'oYO'|aO~OQTORTO]cOb!kOc!jOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!T!bO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!n!iO#t!lO#x^O'fQO'oYO'|aO~O!Q!rO#U!uO#V!rO']9bO!c'qP~P+{O#W!vO~O!]!wO#W!vO~OQ#^OZ#dOj#ROu!{Ov!{Ox!|O!R#bO!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO#i#YO#j#ZO'fQO'p#[O'w!}O'x#OO~O_'hX'W'hX!c'hX!O'hX!T'hX%Q'hX!]'hX~P.jO!{#eO#o#eOQ'iXZ'iX_'iXj'iXu'iXv'iXx'iX!R'iX!a'iX!b'iX!d'iX!j'iX#['iX#]'iX#^'iX#_'iX#`'iX#a'iX#b'iX#e'iX#g'iX#i'iX#j'iX'f'iX'p'iX'w'iX'x'iX~O#c'iX'W'iX!O'iX!c'iXn'iX!T'iX%Q'iX!]'iX~P0zO!{#eO~O#z#fO$R#jO~O!T#kO#x^O$U#lO$W#nO~O]#qOh$QOj#rOk#qOl#qOq$ROs$SOx#yO!T#zO!_$XO!d#vO#V$YO#t$VO$_$TO$a$UO$d$WO']#pO'b$PO'f#sO'a'cP~O!d$ZO~O!]$]O~O_$^O'W$^O~O']$bO~O!d$ZO']$bO'^$dO'b$PO~Oc$jO!d$ZO']$bO~O#c#TO~O]$sOu$oO!T$lO!d$nO%R$rO']$bO'^$dO^(UP~O!n$tO~Ox$uO!T$vO']$bO~Ox$uO!T$vO%Z$zO']$bO~O']${O~O#dsO%RtO%TrO%UrO%XuO%ZvO%^wO%_wO~Ob%UOc%TO!n%RO%P%SO%c%QO~P7xOb%XOcmO!T%WO!nlO#dsO%PqO%TrO%UrO%XuO%ZvO%^wO%_wO%axO~O`%[O!{%_O%R%YO'^$dO~P8wO!d%`O!g%dO~O!d%eO~O!TSO~O_$^O'T%mO'W$^O~O_$^O'T%pO'W$^O~O_$^O'T%rO'W$^O~OS!WO'U!XO'V%vO~OQ[XZ[Xj[Xu[Xv[Xx[X!R[X!RdX!a[X!b[X!d[X!j[X!{[X!{dX#WdX#[[X#][X#^[X#_[X#`[X#a[X#b[X#c[X#e[X#g[X#i[X#j[X#o[X'f[X'p[X'w[X'x[X~O!O[X!OdX~P;dO!Q%xO!O&iX!O&nX!R&iX!R&nX~P'dO!R%zO!O'jX~OQ#^OZ#dOj#ROu!{Ov!{Ox!|O!R%zO!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO#i#YO#j#ZO'fQO'p#[O'w!}O'x#OO~O!O'jX~P>aO!O&PO~Ox&SO!W&^O!X&VO!Y&VO'^$dO~O]&TOk&TO!Q&WO'g&QO!S'kP!S'vP~P@dO!O'sX!R'sX!]'sX!c'sX'p'sX~O!{'sX#W#PX!S'sX~PA]O!{&_O!O'uX!R'uX~O!R&`O!O'tX~O!O&cO~O!{#eO~PA]OP&gO!T&dO!o&fO']$bO~Oc&lO!d$ZO']$bO~Ou$oO!d$nO~O!S&mO~P`Ou!{Ov!{Ox!|O!b!yO!d!zO'fQOQ!faZ!faj!fa!R!fa!a!fa!j!fa#[!fa#]!fa#^!fa#_!fa#`!fa#a!fa#b!fa#c!fa#e!fa#g!fa#i!fa#j!fa'p!fa'w!fa'x!fa~O_!fa'W!fa!O!fa!c!fan!fa!T!fa%Q!fa!]!fa~PCfO!c&nO~O!]!wO!{&pO'p&oO!R'rX_'rX'W'rX~O!c'rX~PFOO!R&tO!c'qX~O!c&vO~Ox$uO!T$vO#V&wO']$bO~OQTORTO]cOb!kOc!jOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!TSO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!n!iO#t!lO#x^O']9aO'fQO'oYO'|aO~O]#qOh$QOj#rOk#qOl#qOq$ROs9tOx#yO!T#zO!_;eO!d#vO#V9}O#t$VO$_9wO$a9zO$d$WO']&{O'b$PO'f#sO~O#W&}O~O]#qOh$QOj#rOk#qOl#qOq$ROs$SOx#yO!T#zO!_$XO!d#vO#V$YO#t$VO$_$TO$a$UO$d$WO']&{O'b$PO'f#sO~O'a'mP~PJjO!Q'RO!c'nP~P){O'g'TO'oYO~OQ9^OR9^O]cOb;`Oc!jOhcOj9^OkcOlcOq9^Os9^OxRO{cO|cO}cO!T!bO!_9`O!dUO!g9^O!h9^O!i9^O!j9^O!k9^O!n!iO#t!lO#x^O']'cO'fQO'oYO'|;^O~O!d!zO~O!R#bO_$]a'W$]a!c$]a!O$]a!T$]a%Q$]a!]$]a~O#d'jO~PIWO!]'lO!T'yX#w'yX#z'yX$R'yX~Ou'mO~P! YOu'mO!T'yX#w'yX#z'yX$R'yX~O!T'oO#w'sO#z'nO$R'tO~O!Q'wO~PLbO#z#fO$R'zO~OP$eXu$eXx$eX!b$eX'w$eX'x$eX~OPfX!RfX!{fX'afX'a$eX~P!!rOk'|O~OS'}O'U(OO'V(QO~OP(ZOu(SOx(TO'w(VO'x(XO~O'a(RO~P!#{O'a([O~O]#qOh$QOj#rOk#qOl#qOq$ROs9tOx#yO!T#zO!_;eO!d#vO#V9}O#t$VO$_9wO$a9zO$d$WO'b$PO'f#sO~O!Q(`O'](]O!c'}P~P!$jO#W(bO~O!d(cO~O!Q(hO'](eO!O(OP~P!$jOj(uOx(mO!W(sO!X(lO!Y(lO!d(cO!x(tO$w(oO'^$dO'g(jO~O!S(rO~P!&jO!b!yOP'eXu'eXx'eX'w'eX'x'eX!R'eX!{'eX~O'a'eX#m'eX~P!'cOP(xO!{(wO!R'dX'a'dX~O!R(yO'a'cX~O']${O'a'cP~O'](|O~O!d)RO~O']&{O~Ox$uO!Q!rO!T$vO#U!uO#V!rO']$bO!c'qP~O!]!wO#W)VO~OQ#^OZ#dOj#ROu!{Ov!{Ox!|O!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO#i#YO#j#ZO'fQO'p#[O'w!}O'x#OO~O_!^a!R!^a'W!^a!O!^a!c!^an!^a!T!^a%Q!^a!]!^a~P!)wOP)_O!T&dO!o)^O%Q)]O'b$PO~O!])aO!T'`X_'`X!R'`X'W'`X~O!d$ZO'b$PO~O!d$ZO']$bO'b$PO~O!]!wO#W&}O~O])lO%R)mO'])iO!S(VP~O!R)nO^(UX~O'g'TO~OZ)rO~O^)sO~O!T$lO']$bO'^$dO^(UP~Ox$uO!Q)xO!R&`O!T$vO']$bO!O'tP~O]&ZOk&ZO!Q)yO'g'TO!S'vP~O!R)zO_(RX'W(RX~O!{*OO'b$PO~OP*RO!T#zO'b$PO~O!T*TO~Ou*VO!TSO~O!n*[O~Oc*aO~O'](|O!S(TP~Oc$jO~O%RtO']${O~P8wOZ*gO^*fO~OQTORTO]cObnOcmOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!nlO#x^O%PqO'fQO'oYO'|aO~O!T!bO#t!lO']9aO~P!1_O^*fO_$^O'W$^O~O_*kO#d*mO%T*mO%U*mO~P){O!d%`O~O%t*rO~O!T*tO~O&V*vO&X*wOQ&SaR&SaX&Sa]&Sa_&Sab&Sac&Sah&Saj&Sak&Sal&Saq&Sas&Sax&Sa{&Sa|&Sa}&Sa!T&Sa!_&Sa!d&Sa!g&Sa!h&Sa!i&Sa!j&Sa!k&Sa!n&Sa#d&Sa#t&Sa#x&Sa%P&Sa%R&Sa%T&Sa%U&Sa%X&Sa%Z&Sa%^&Sa%_&Sa%a&Sa%n&Sa%t&Sa%v&Sa%x&Sa%z&Sa%}&Sa&T&Sa&Z&Sa&]&Sa&_&Sa&a&Sa&c&Sa'S&Sa']&Sa'f&Sa'o&Sa'|&Sa!S&Sa%{&Sa`&Sa&Q&Sa~O']*|O~On+PO~O!O&ia!R&ia~P!)wO!Q+TO!O&iX!R&iX~P){O!R%zO!O'ja~O!O'ja~P>aO!R&`O!O'ta~O!RwX!R!ZX!SwX!S!ZX!]wX!]!ZX!d!ZX!{wX'b!ZX~O!]+YO!{+XO!R#TX!R'lX!S#TX!S'lX!]'lX!d'lX'b'lX~O!]+[O!d$ZO'b$PO!R!VX!S!VX~O]&ROk&ROx&SO'g(jO~OQ9^OR9^O]cOb;`Oc!jOhcOj9^OkcOlcOq9^Os9^OxRO{cO|cO}cO!T!bO!_9`O!dUO!g9^O!h9^O!i9^O!j9^O!k9^O!n!iO#t!lO#x^O'fQO'oYO'|;^O~O']:SO~P!;jO!R+`O!S'kX~O!S+bO~O!]+YO!{+XO!R#TX!S#TX~O!R+cO!S'vX~O!S+eO~O]&ROk&ROx&SO'^$dO'g(jO~O!X+fO!Y+fO~P!>hOx$uO!Q+hO!T$vO']$bO!O&nX!R&nX~O_+lO!W+oO!X+kO!Y+kO!r+sO!s+qO!t+rO!u+pO!x+tO'^$dO'g(jO'o+iO~O!S+nO~P!?iOP+yO!T&dO!o+xO~O!{,PO!R'ra!c'ra_'ra'W'ra~O!]!wO~P!@sO!R&tO!c'qa~Ox$uO!Q,SO!T$vO#U,UO#V,SO']$bO!R&pX!c&pX~O_#Oi!R#Oi'W#Oi!O#Oi!c#Oin#Oi!T#Oi%Q#Oi!]#Oi~P!)wOP;tOu(SOx(TO'w(VO'x(XO~O#W!za!R!za!c!za!{!za!T!za_!za'W!za!O!za~P!BpO#W'eXQ'eXZ'eX_'eXj'eXv'eX!a'eX!d'eX!j'eX#['eX#]'eX#^'eX#_'eX#`'eX#a'eX#b'eX#c'eX#e'eX#g'eX#i'eX#j'eX'W'eX'f'eX'p'eX!c'eX!O'eX!T'eXn'eX%Q'eX!]'eX~P!'cO!R,_O'a'mX~P!#{O'a,aO~O!R,bO!c'nX~P!)wO!c,eO~O!O,fO~OQ#^Ou!{Ov!{Ox!|O!b!yO!d!zO!j#^O'fQOZ#Zi_#Zij#Zi!R#Zi!a#Zi#]#Zi#^#Zi#_#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi'W#Zi'p#Zi'w#Zi'x#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~O#[#Zi~P!FfO#[#PO~P!FfOQ#^Ou!{Ov!{Ox!|O!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO'fQOZ#Zi_#Zi!R#Zi!a#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi'W#Zi'p#Zi'w#Zi'x#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~Oj#Zi~P!IQOj#RO~P!IQOQ#^Oj#ROu!{Ov!{Ox!|O!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO'fQO_#Zi!R#Zi#e#Zi#g#Zi#i#Zi#j#Zi'W#Zi'p#Zi'w#Zi'x#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~OZ#Zi!a#Zi#a#Zi#b#Zi#c#Zi~P!KlOZ#dO!a#TO#a#TO#b#TO#c#TO~P!KlOQ#^OZ#dOj#ROu!{Ov!{Ox!|O!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO'fQO_#Zi!R#Zi#g#Zi#i#Zi#j#Zi'W#Zi'p#Zi'x#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~O'w#Zi~P!NdO'w!}O~P!NdOQ#^OZ#dOj#ROu!{Ov!{Ox!|O!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO'fQO'w!}O_#Zi!R#Zi#i#Zi#j#Zi'W#Zi'p#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~O'x#Zi~P##OO'x#OO~P##OOQ#^OZ#dOj#ROu!{Ov!{Ox!|O!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO#i#YO'fQO'w!}O'x#OO~O_#Zi!R#Zi#j#Zi'W#Zi'p#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~P#%jOQ[XZ[Xj[Xu[Xv[Xx[X!a[X!b[X!d[X!j[X!{[X#WdX#[[X#][X#^[X#_[X#`[X#a[X#b[X#c[X#e[X#g[X#i[X#j[X#o[X'f[X'p[X'w[X'x[X!R[X!S[X~O#m[X~P#'}OQ#^OZ9rOj9gOu!{Ov!{Ox!|O!a9iO!b!yO!d!zO!j#^O#[9eO#]9fO#^9fO#_9fO#`9hO#a9iO#b9iO#c9iO#e9jO#g9lO#i9nO#j9oO'fQO'p#[O'w!}O'x#OO~O#m,hO~P#*XOQ'iXZ'iXj'iXu'iXv'iXx'iX!a'iX!b'iX!d'iX!j'iX#['iX#]'iX#^'iX#_'iX#`'iX#a'iX#b'iX#e'iX#g'iX#i'iX#j'iX'f'iX'p'iX'w'iX'x'iX!R'iX~O!{9sO#o9sO#c'iX#m'iX!S'iX~P#,SO_&sa!R&sa'W&sa!c&san&sa!O&sa!T&sa%Q&sa!]&sa~P!)wOQ#ZiZ#Zi_#Zij#Ziv#Zi!R#Zi!a#Zi!b#Zi!d#Zi!j#Zi#[#Zi#]#Zi#^#Zi#_#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi'W#Zi'f#Zi'p#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~P!BpO_#ni!R#ni'W#ni!O#ni!c#nin#ni!T#ni%Q#ni!]#ni~P!)wO#z,jO~O#z,kO~O!]'lO!{,lO!T$OX#w$OX#z$OX$R$OX~O!Q,mO~O!T'oO#w,oO#z'nO$R,pO~O!R9pO!S'hX~P#*XO!S,qO~O$R,sO~OS'}O'U(OO'V,vO~O],yOk,yO!O,zO~O!RdX!]dX!cdX!c$eX'pdX~P!!rO!c-QO~P!BpO!R-RO!]!wO'p&oO!c'}X~O!c-WO~O!Q(`O']$bO!c'}P~O#W-YO~O!O$eX!R$eX!]$lX~P!!rO!R-ZO!O(OX~P!BpO!]-]O~O!O-_O~Oj-cO!]!wO!d$ZO'b$PO'p&oO~O!])aO~O_$^O!R-hO'W$^O~O!S-jO~P!&jO!X-kO!Y-kO'^$dO'g(jO~Ox-mO'g(jO~O!x-nO~O']${O!R&xX'a&xX~O!R(yO'a'ca~O'a-sO~Ou-tOv-tOx-uOPra'wra'xra!Rra!{ra~O'ara#mra~P#7pOu(SOx(TOP$^a'w$^a'x$^a!R$^a!{$^a~O'a$^a#m$^a~P#8fOu(SOx(TOP$`a'w$`a'x$`a!R$`a!{$`a~O'a$`a#m$`a~P#9XO]-vO~O#W-wO~O'a$na!R$na!{$na#m$na~P!#{O#W-zO~OP.TO!T&dO!o.SO%Q.RO~O]#qOj#rOk#qOl#qOq$ROs9tOx#yO!T#zO!_;eO!d#vO#V9}O#t$VO$_9wO$a9zO$d$WO'b$PO'f#sO~Oh.VO'].UO~P#:yO!])aO!T'`a_'`a!R'`a'W'`a~O#W.]O~OZ[X!RdX!SdX~O!R.^O!S(VX~O!S.`O~OZ.aO~O].cO'])iO~O!T$lO']$bO^'QX!R'QX~O!R)nO^(Ua~O!c.fO~P!)wO].hO~OZ.iO~O^.jO~OP.TO!T&dO!o.SO%Q.RO'b$PO~O!R)zO_(Ra'W(Ra~O!{.pO~OP.sO!T#zO~O'g'TO!S(SP~OP.}O!T.yO!o.|O%Q.{O'b$PO~OZ/XO!R/VO!S(TX~O!S/YO~O^/[O_$^O'W$^O~O]/]O~O]/^O'](|O~O#c/_O%r/`O~P0zO!{#eO#c/_O%r/`O~O_/aO~P){O_/cO~O%{/gOQ%yiR%yiX%yi]%yi_%yib%yic%yih%yij%yik%yil%yiq%yis%yix%yi{%yi|%yi}%yi!T%yi!_%yi!d%yi!g%yi!h%yi!i%yi!j%yi!k%yi!n%yi#d%yi#t%yi#x%yi%P%yi%R%yi%T%yi%U%yi%X%yi%Z%yi%^%yi%_%yi%a%yi%n%yi%t%yi%v%yi%x%yi%z%yi%}%yi&T%yi&Z%yi&]%yi&_%yi&a%yi&c%yi'S%yi']%yi'f%yi'o%yi'|%yi!S%yi`%yi&Q%yi~O`/mO!S/kO&Q/lO~P`O!TSO!d/oO~O&X*wOQ&SiR&SiX&Si]&Si_&Sib&Sic&Sih&Sij&Sik&Sil&Siq&Sis&Six&Si{&Si|&Si}&Si!T&Si!_&Si!d&Si!g&Si!h&Si!i&Si!j&Si!k&Si!n&Si#d&Si#t&Si#x&Si%P&Si%R&Si%T&Si%U&Si%X&Si%Z&Si%^&Si%_&Si%a&Si%n&Si%t&Si%v&Si%x&Si%z&Si%}&Si&T&Si&Z&Si&]&Si&_&Si&a&Si&c&Si'S&Si']&Si'f&Si'o&Si'|&Si!S&Si%{&Si`&Si&Q&Si~O!R#bOn$]a~O!O&ii!R&ii~P!)wO!R%zO!O'ji~O!R&`O!O'ti~O!O/uO~O!R!Va!S!Va~P#*XO]&ROk&RO!Q/{O'g(jO!R&jX!S&jX~P@dO!R+`O!S'ka~O]&ZOk&ZO!Q)yO'g'TO!R&oX!S&oX~O!R+cO!S'va~O!O'ui!R'ui~P!)wO_$^O!]!wO!d$ZO!j0VO!{0TO'W$^O'b$PO'p&oO~O!S0YO~P!?iO!X0ZO!Y0ZO'^$dO'g(jO'o+iO~O!W0[O~P#MSO!TSO!W0[O!u0^O!x0_O~P#MSO!W0[O!s0aO!t0aO!u0^O!x0_O~P#MSO!T&dO~O!T&dO~P!BpO!R'ri!c'ri_'ri'W'ri~P!)wO!{0jO!R'ri!c'ri_'ri'W'ri~O!R&tO!c'qi~Ox$uO!T$vO#V0lO']$bO~O#WraQraZra_rajra!ara!bra!dra!jra#[ra#]ra#^ra#_ra#`ra#ara#bra#cra#era#gra#ira#jra'Wra'fra'pra!cra!Ora!Tranra%Qra!]ra~P#7pO#W$^aQ$^aZ$^a_$^aj$^av$^a!a$^a!b$^a!d$^a!j$^a#[$^a#]$^a#^$^a#_$^a#`$^a#a$^a#b$^a#c$^a#e$^a#g$^a#i$^a#j$^a'W$^a'f$^a'p$^a!c$^a!O$^a!T$^an$^a%Q$^a!]$^a~P#8fO#W$`aQ$`aZ$`a_$`aj$`av$`a!a$`a!b$`a!d$`a!j$`a#[$`a#]$`a#^$`a#_$`a#`$`a#a$`a#b$`a#c$`a#e$`a#g$`a#i$`a#j$`a'W$`a'f$`a'p$`a!c$`a!O$`a!T$`an$`a%Q$`a!]$`a~P#9XO#W$naQ$naZ$na_$naj$nav$na!R$na!a$na!b$na!d$na!j$na#[$na#]$na#^$na#_$na#`$na#a$na#b$na#c$na#e$na#g$na#i$na#j$na'W$na'f$na'p$na!c$na!O$na!T$na!{$nan$na%Q$na!]$na~P!BpO_#Oq!R#Oq'W#Oq!O#Oq!c#Oqn#Oq!T#Oq%Q#Oq!]#Oq~P!)wO!R&kX'a&kX~PJjO!R,_O'a'ma~O!Q0tO!R&lX!c&lX~P){O!R,bO!c'na~O!R,bO!c'na~P!)wO#m!fa!S!fa~PCfO#m!^a!R!^a!S!^a~P#*XO!T1XO#x^O$P1YO~O!S1^O~On1_O~P!BpO_$Yq!R$Yq'W$Yq!O$Yq!c$Yqn$Yq!T$Yq%Q$Yq!]$Yq~P!)wO!O1`O~O],yOk,yO~Ou(SOx(TO'x(XOP$xi'w$xi!R$xi!{$xi~O'a$xi#m$xi~P$.POu(SOx(TOP$zi'w$zi'x$zi!R$zi!{$zi~O'a$zi#m$zi~P$.rO'p#[O~P!BpO!Q1cO']$bO!R&tX!c&tX~O!R-RO!c'}a~O!R-RO!]!wO!c'}a~O!R-RO!]!wO'p&oO!c'}a~O'a$gi!R$gi!{$gi#m$gi~P!#{O!Q1kO'](eO!O&vX!R&vX~P!$jO!R-ZO!O(Oa~O!R-ZO!O(Oa~P!BpO!]!wO~O!]!wO#c1sO~Oj1vO!]!wO'p&oO~O!R'di'a'di~P!#{O!{1yO!R'di'a'di~P!#{O!c1|O~O_$Zq!R$Zq'W$Zq!O$Zq!c$Zqn$Zq!T$Zq%Q$Zq!]$Zq~P!)wO!R2QO!T(PX~P!BpO!T&dO%Q2TO~O!T&dO%Q2TO~P!BpO!T$eX$u[X_$eX!R$eX'W$eX~P!!rO$u2XOPgXugXxgX!TgX'wgX'xgX_gX!RgX'WgX~O$u2XO~O]2_O%R2`O'])iO!R'PX!S'PX~O!R.^O!S(Va~OZ2dO~O^2eO~O]2hO~OP2jO!T&dO!o2iO%Q2TO~O_$^O'W$^O~P!BpO!T#zO~P!BpO!R2oO!{2qO!S(SX~O!S2rO~Ox;oO!W2{O!X2tO!Y2tO!r2zO!s2yO!t2yO!x2xO'^$dO'g(jO'o+iO~O!S2wO~P$7ZOP3SO!T.yO!o3RO%Q3QO~OP3SO!T.yO!o3RO%Q3QO'b$PO~O'](|O!R'OX!S'OX~O!R/VO!S(Ta~O]3^O'g3]O~O]3_O~O^3aO~O!c3dO~P){O_3fO~O_3fO~P){O#c3hO%r3iO~PFOO`/mO!S3mO&Q/lO~P`O!]3oO~O!R#Ti!S#Ti~P#*XO!{3qO!R#Ti!S#Ti~O!R!Vi!S!Vi~P#*XO_$^O!{3xO'W$^O~O_$^O!]!wO!{3xO'W$^O~O!X3|O!Y3|O'^$dO'g(jO'o+iO~O_$^O!]!wO!d$ZO!j3}O!{3xO'W$^O'b$PO'p&oO~O!W4OO~P$;xO!W4OO!u4RO!x4SO~P$;xO_$^O!]!wO!j3}O!{3xO'W$^O'p&oO~O!R'rq!c'rq_'rq'W'rq~P!)wO!R&tO!c'qq~O#W$xiQ$xiZ$xi_$xij$xiv$xi!a$xi!b$xi!d$xi!j$xi#[$xi#]$xi#^$xi#_$xi#`$xi#a$xi#b$xi#c$xi#e$xi#g$xi#i$xi#j$xi'W$xi'f$xi'p$xi!c$xi!O$xi!T$xin$xi%Q$xi!]$xi~P$.PO#W$ziQ$ziZ$zi_$zij$ziv$zi!a$zi!b$zi!d$zi!j$zi#[$zi#]$zi#^$zi#_$zi#`$zi#a$zi#b$zi#c$zi#e$zi#g$zi#i$zi#j$zi'W$zi'f$zi'p$zi!c$zi!O$zi!T$zin$zi%Q$zi!]$zi~P$.rO#W$giQ$giZ$gi_$gij$giv$gi!R$gi!a$gi!b$gi!d$gi!j$gi#[$gi#]$gi#^$gi#_$gi#`$gi#a$gi#b$gi#c$gi#e$gi#g$gi#i$gi#j$gi'W$gi'f$gi'p$gi!c$gi!O$gi!T$gi!{$gin$gi%Q$gi!]$gi~P!BpO!R&ka'a&ka~P!#{O!R&la!c&la~P!)wO!R,bO!c'ni~O#m#Oi!R#Oi!S#Oi~P#*XOQ#^Ou!{Ov!{Ox!|O!b!yO!d!zO!j#^O'fQOZ#Zij#Zi!a#Zi#]#Zi#^#Zi#_#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi#m#Zi'p#Zi'w#Zi'x#Zi!R#Zi!S#Zi~O#[#Zi~P$EiO#[9eO~P$EiOQ#^Ou!{Ov!{Ox!|O!b!yO!d!zO!j#^O#[9eO#]9fO#^9fO#_9fO'fQOZ#Zi!a#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi#m#Zi'p#Zi'w#Zi'x#Zi!R#Zi!S#Zi~Oj#Zi~P$GqOj9gO~P$GqOQ#^Oj9gOu!{Ov!{Ox!|O!b!yO!d!zO!j#^O#[9eO#]9fO#^9fO#_9fO#`9hO'fQO#e#Zi#g#Zi#i#Zi#j#Zi#m#Zi'p#Zi'w#Zi'x#Zi!R#Zi!S#Zi~OZ#Zi!a#Zi#a#Zi#b#Zi#c#Zi~P$IyOZ9rO!a9iO#a9iO#b9iO#c9iO~P$IyOQ#^OZ9rOj9gOu!{Ov!{Ox!|O!a9iO!b!yO!d!zO!j#^O#[9eO#]9fO#^9fO#_9fO#`9hO#a9iO#b9iO#c9iO#e9jO'fQO#g#Zi#i#Zi#j#Zi#m#Zi'p#Zi'x#Zi!R#Zi!S#Zi~O'w#Zi~P$L_O'w!}O~P$L_OQ#^OZ9rOj9gOu!{Ov!{Ox!|O!a9iO!b!yO!d!zO!j#^O#[9eO#]9fO#^9fO#_9fO#`9hO#a9iO#b9iO#c9iO#e9jO#g9lO'fQO'w!}O#i#Zi#j#Zi#m#Zi'p#Zi!R#Zi!S#Zi~O'x#Zi~P$NgO'x#OO~P$NgOQ#^OZ9rOj9gOu!{Ov!{Ox!|O!a9iO!b!yO!d!zO!j#^O#[9eO#]9fO#^9fO#_9fO#`9hO#a9iO#b9iO#c9iO#e9jO#g9lO#i9nO'fQO'w!}O'x#OO~O#j#Zi#m#Zi'p#Zi!R#Zi!S#Zi~P%!oO_#ky!R#ky'W#ky!O#ky!c#kyn#ky!T#ky%Q#ky!]#ky~P!)wOP;vOu(SOx(TO'w(VO'x(XO~OQ#ZiZ#Zij#Ziv#Zi!a#Zi!b#Zi!d#Zi!j#Zi#[#Zi#]#Zi#^#Zi#_#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi#m#Zi'f#Zi'p#Zi!R#Zi!S#Zi~P%%aO!b!yOP'eXu'eXx'eX'w'eX'x'eX!S'eX~OQ'eXZ'eXj'eXv'eX!a'eX!d'eX!j'eX#['eX#]'eX#^'eX#_'eX#`'eX#a'eX#b'eX#c'eX#e'eX#g'eX#i'eX#j'eX#m'eX'f'eX'p'eX!R'eX~P%'eO#m#ni!R#ni!S#ni~P#*XO!S4eO~O!R&sa!S&sa~P#*XO!]!wO'p&oO!R&ta!c&ta~O!R-RO!c'}i~O!R-RO!]!wO!c'}i~O'a$gq!R$gq!{$gq#m$gq~P!#{O!O&va!R&va~P!BpO!]4lO~O!R-ZO!O(Oi~P!BpO!R-ZO!O(Oi~O!O4pO~O!]!wO#c4uO~Oj4vO!]!wO'p&oO~O!O4xO~O'a$iq!R$iq!{$iq#m$iq~P!#{O_$Zy!R$Zy'W$Zy!O$Zy!c$Zyn$Zy!T$Zy%Q$Zy!]$Zy~P!)wO!R2QO!T(Pa~O!T&dO%Q4}O~O!T&dO%Q4}O~P!BpO_#Oy!R#Oy'W#Oy!O#Oy!c#Oyn#Oy!T#Oy%Q#Oy!]#Oy~P!)wOZ5QO~O]5SO'])iO~O!R.^O!S(Vi~O]5VO~O^5WO~O'g'TO!R&{X!S&{X~O!R2oO!S(Sa~O!S5eO~P$7ZOx;sO'g(jO'o+iO~O!W5hO!X5gO!Y5gO!x0_O'^$dO'g(jO'o+iO~O!s5iO!t5iO~P%0^O!X5gO!Y5gO'^$dO'g(jO'o+iO~O!T.yO~O!T.yO%Q5kO~O!T.yO%Q5kO~P!BpOP5pO!T.yO!o5oO%Q5kO~OZ5uO!R'Oa!S'Oa~O!R/VO!S(Ti~O]5xO~O!c5yO~O!c5zO~O!c5{O~O!c5{O~P){O_5}O~O!]6QO~O!c6RO~O!R'ui!S'ui~P#*XO_$^O'W$^O~P!)wO_$^O!{6WO'W$^O~O_$^O!]!wO!{6WO'W$^O~O!X6]O!Y6]O'^$dO'g(jO'o+iO~O_$^O!]!wO!j6^O!{6WO'W$^O'p&oO~O!d$ZO'b$PO~P%4xO!W6_O~P%4gO!R'ry!c'ry_'ry'W'ry~P!)wO#W$gqQ$gqZ$gq_$gqj$gqv$gq!R$gq!a$gq!b$gq!d$gq!j$gq#[$gq#]$gq#^$gq#_$gq#`$gq#a$gq#b$gq#c$gq#e$gq#g$gq#i$gq#j$gq'W$gq'f$gq'p$gq!c$gq!O$gq!T$gq!{$gqn$gq%Q$gq!]$gq~P!BpO#W$iqQ$iqZ$iq_$iqj$iqv$iq!R$iq!a$iq!b$iq!d$iq!j$iq#[$iq#]$iq#^$iq#_$iq#`$iq#a$iq#b$iq#c$iq#e$iq#g$iq#i$iq#j$iq'W$iq'f$iq'p$iq!c$iq!O$iq!T$iq!{$iqn$iq%Q$iq!]$iq~P!BpO!R&li!c&li~P!)wO#m#Oq!R#Oq!S#Oq~P#*XOu-tOv-tOx-uOPra'wra'xra!Sra~OQraZrajra!ara!bra!dra!jra#[ra#]ra#^ra#_ra#`ra#ara#bra#cra#era#gra#ira#jra#mra'fra'pra!Rra~P%;OOu(SOx(TOP$^a'w$^a'x$^a!S$^a~OQ$^aZ$^aj$^av$^a!a$^a!b$^a!d$^a!j$^a#[$^a#]$^a#^$^a#_$^a#`$^a#a$^a#b$^a#c$^a#e$^a#g$^a#i$^a#j$^a#m$^a'f$^a'p$^a!R$^a~P%=SOu(SOx(TOP$`a'w$`a'x$`a!S$`a~OQ$`aZ$`aj$`av$`a!a$`a!b$`a!d$`a!j$`a#[$`a#]$`a#^$`a#_$`a#`$`a#a$`a#b$`a#c$`a#e$`a#g$`a#i$`a#j$`a#m$`a'f$`a'p$`a!R$`a~P%?WOQ$naZ$naj$nav$na!a$na!b$na!d$na!j$na#[$na#]$na#^$na#_$na#`$na#a$na#b$na#c$na#e$na#g$na#i$na#j$na#m$na'f$na'p$na!R$na!S$na~P%%aO#m$Yq!R$Yq!S$Yq~P#*XO#m$Zq!R$Zq!S$Zq~P#*XO!S6hO~O#m6iO~P!#{O!]!wO!R&ti!c&ti~O!]!wO'p&oO!R&ti!c&ti~O!R-RO!c'}q~O!O&vi!R&vi~P!BpO!R-ZO!O(Oq~O!O6oO~P!BpO!O6oO~O!R'dy'a'dy~P!#{O!R&ya!T&ya~P!BpO!T$tq_$tq!R$tq'W$tq~P!BpOZ6vO~O!R.^O!S(Vq~O]6yO~O!T&dO%Q6zO~O!T&dO%Q6zO~P!BpO!{6{O!R&{a!S&{a~O!R2oO!S(Si~P#*XO!X7RO!Y7RO'^$dO'g(jO'o+iO~O!W7TO!x4SO~P%GXO!T.yO%Q7WO~O!T.yO%Q7WO~P!BpO]7_O'g7^O~O!R/VO!S(Tq~O!c7aO~O!c7aO~P){O!c7cO~O!c7dO~O!R#Ty!S#Ty~P#*XO_$^O!{7jO'W$^O~O_$^O!]!wO!{7jO'W$^O~O!X7mO!Y7mO'^$dO'g(jO'o+iO~O_$^O!]!wO!j7nO!{7jO'W$^O'p&oO~O#m#ky!R#ky!S#ky~P#*XOQ$giZ$gij$giv$gi!a$gi!b$gi!d$gi!j$gi#[$gi#]$gi#^$gi#_$gi#`$gi#a$gi#b$gi#c$gi#e$gi#g$gi#i$gi#j$gi#m$gi'f$gi'p$gi!R$gi!S$gi~P%%aOu(SOx(TO'x(XOP$xi'w$xi!S$xi~OQ$xiZ$xij$xiv$xi!a$xi!b$xi!d$xi!j$xi#[$xi#]$xi#^$xi#_$xi#`$xi#a$xi#b$xi#c$xi#e$xi#g$xi#i$xi#j$xi#m$xi'f$xi'p$xi!R$xi~P%LjOu(SOx(TOP$zi'w$zi'x$zi!S$zi~OQ$ziZ$zij$ziv$zi!a$zi!b$zi!d$zi!j$zi#[$zi#]$zi#^$zi#_$zi#`$zi#a$zi#b$zi#c$zi#e$zi#g$zi#i$zi#j$zi#m$zi'f$zi'p$zi!R$zi~P%NnO#m$Zy!R$Zy!S$Zy~P#*XO#m#Oy!R#Oy!S#Oy~P#*XO!]!wO!R&tq!c&tq~O!R-RO!c'}y~O!O&vq!R&vq~P!BpO!O7tO~P!BpO!R.^O!S(Vy~O!R2oO!S(Sq~O!X8QO!Y8QO'^$dO'g(jO'o+iO~O!T.yO%Q8TO~O!T.yO%Q8TO~P!BpO!c8WO~O_$^O!{8]O'W$^O~O_$^O!]!wO!{8]O'W$^O~OQ$gqZ$gqj$gqv$gq!a$gq!b$gq!d$gq!j$gq#[$gq#]$gq#^$gq#_$gq#`$gq#a$gq#b$gq#c$gq#e$gq#g$gq#i$gq#j$gq#m$gq'f$gq'p$gq!R$gq!S$gq~P%%aOQ$iqZ$iqj$iqv$iq!a$iq!b$iq!d$iq!j$iq#[$iq#]$iq#^$iq#_$iq#`$iq#a$iq#b$iq#c$iq#e$iq#g$iq#i$iq#j$iq#m$iq'f$iq'p$iq!R$iq!S$iq~P%%aO'a$|!Z!R$|!Z!{$|!Z#m$|!Z~P!#{O!R&{q!S&{q~P#*XO_$^O!{8oO'W$^O~O#W$|!ZQ$|!ZZ$|!Z_$|!Zj$|!Zv$|!Z!R$|!Z!a$|!Z!b$|!Z!d$|!Z!j$|!Z#[$|!Z#]$|!Z#^$|!Z#_$|!Z#`$|!Z#a$|!Z#b$|!Z#c$|!Z#e$|!Z#g$|!Z#i$|!Z#j$|!Z'W$|!Z'f$|!Z'p$|!Z!c$|!Z!O$|!Z!T$|!Z!{$|!Zn$|!Z%Q$|!Z!]$|!Z~P!BpOP;uOu(SOx(TO'w(VO'x(XO~O!S!za!W!za!X!za!Y!za!r!za!s!za!t!za!x!za'^!za'g!za'o!za~P&,_O!W'eX!X'eX!Y'eX!r'eX!s'eX!t'eX!x'eX'^'eX'g'eX'o'eX~P%'eOQ$|!ZZ$|!Zj$|!Zv$|!Z!a$|!Z!b$|!Z!d$|!Z!j$|!Z#[$|!Z#]$|!Z#^$|!Z#_$|!Z#`$|!Z#a$|!Z#b$|!Z#c$|!Z#e$|!Z#g$|!Z#i$|!Z#j$|!Z#m$|!Z'f$|!Z'p$|!Z!R$|!Z!S$|!Z~P%%aO!Wra!Xra!Yra!rra!sra!tra!xra'^ra'gra'ora~P%;OO!W$^a!X$^a!Y$^a!r$^a!s$^a!t$^a!x$^a'^$^a'g$^a'o$^a~P%=SO!W$`a!X$`a!Y$`a!r$`a!s$`a!t$`a!x$`a'^$`a'g$`a'o$`a~P%?WO!S$na!W$na!X$na!Y$na!r$na!s$na!t$na!x$na'^$na'g$na'o$na~P&,_O!W$xi!X$xi!Y$xi!r$xi!s$xi!t$xi!x$xi'^$xi'g$xi'o$xi~P%LjO!W$zi!X$zi!Y$zi!r$zi!s$zi!t$zi!x$zi'^$zi'g$zi'o$zi~P%NnO!S$gi!W$gi!X$gi!Y$gi!r$gi!s$gi!t$gi!x$gi'^$gi'g$gi'o$gi~P&,_O!S$gq!W$gq!X$gq!Y$gq!r$gq!s$gq!t$gq!x$gq'^$gq'g$gq'o$gq~P&,_O!S$iq!W$iq!X$iq!Y$iq!r$iq!s$iq!t$iq!x$iq'^$iq'g$iq'o$iq~P&,_O!S$|!Z!W$|!Z!X$|!Z!Y$|!Z!r$|!Z!s$|!Z!t$|!Z!x$|!Z'^$|!Z'g$|!Z'o$|!Z~P&,_On'hX~P.jOn[X!O[X!c[X%r[X!T[X%Q[X!][X~P$zO!]dX!c[X!cdX'pdX~P;dOQ9^OR9^O]cOb;`Oc!jOhcOj9^OkcOlcOq9^Os9^OxRO{cO|cO}cO!TSO!_9`O!dUO!g9^O!h9^O!i9^O!j9^O!k9^O!n!iO#t!lO#x^O']'cO'fQO'oYO'|;^O~O]#qOh$QOj#rOk#qOl#qOq$ROs9uOx#yO!T#zO!_;fO!d#vO#V:OO#t$VO$_9xO$a9{O$d$WO']&{O'b$PO'f#sO~O!R9pO!S$]a~O]#qOh$QOj#rOk#qOl#qOq$ROs9vOx#yO!T#zO!_;gO!d#vO#V:PO#t$VO$_9yO$a9|O$d$WO']&{O'b$PO'f#sO~O#d'jO~P&<WO!S[X!SdX~P;dO!]9dO~O#W9cO~O!]!wO#W9cO~O!{9sO~O#c9iO~O!{:QO!R'uX!S'uX~O!{9sO!R'sX!S'sX~O#W:RO~O'a:TO~P!#{O#W:[O~O#W:]O~O#W:^O~O!]!wO#W:_O~O!]!wO#W:RO~O#m:`O~P#*XO#W:aO~O#W:bO~O#W:cO~O#W:dO~O#W:eO~O#W:fO~O#W:gO~O#W:hO~O!O:iO~O#m:jO~P!#{O#m:kO~P!#{O#m:lO~P!#{O!O:mO~P!BpO!O:mO~O!O:nO~P!BpO!]!wO#c;lO~O!]!wO#c;nO~O#x~!b!r!t!u#U#V'|$_$a$d$u%P%Q%R%X%Z%^%_%a%c~UT#x'|#]}'Y'Z#z'Y']'g~",
  goto: "#Kk(ZPPPPPPPP([P(lP*`PPPP-zPP.a3s7o8SP8SPPP8SP:U8SP8SP:YPP:`P:t?VPPPP?ZPPPP?ZA{PPPBRDdP?ZPFwPPPPHp?ZPPPPPJi?ZPPMjNgPPPPNk!!TP!!]!#^PNg?Z?Z!&n!)i!.[!.[!1kPPP!1r!4h?ZPPPPPPPPPP!7_P!8pPP?Z!9}P?ZP?Z?Z?Z?ZP?Z!;dPP!>]P!AQ!AY!A^!A^P!>YP!Ab!AbP!DVP!DZ?Z?Z!Da!GT8SP8SP8S8SP!HW8S8S!Jf8S!M_8S# g8S8S#!T#$c#$c#$g#$c#$oP#$cP8S#%k8S#'X8S8S-zPPP#(yPP#)c#)cP#)cP#)x#)cPP#*OP#)uP#)u#*b!!X#)u#+P#+V#+Y([#+]([P#+d#+d#+dP([P([P([P([PP([P#+j#+mP#+m([P#+qP#+tP([P([P([P([P([P([([#+z#,U#,[#,b#,p#,v#,|#-W#-^#-m#-s#.R#.X#._#.m#/S#0z#1Y#1`#1f#1l#1r#1|#2S#2Y#2d#2v#2|PPPPPPPP#3SPP#3v#7OPP#8f#8m#8uPP#>a#@t#Fp#Fs#Fv#GR#GUPP#GX#G]#Gz#Hq#Hu#IZPP#I_#Ie#IiP#Il#Ip#Is#Jc#Jy#KO#KR#KU#K[#K_#Kc#KgmhOSj}!n$]%c%f%g%i*o*t/g/jQ$imQ$ppQ%ZyS&V!b+`Q&k!jS(l#z(qQ)g$jQ)t$rQ*`%TQ+f&^S+k&d+mQ+}&lQ-k(sQ/U*aY0Z+o+p+q+r+sS2t.y2vU3|0[0^0aU5g2y2z2{S6]4O4RS7R5h5iQ7m6_R8Q7T$p[ORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$]$n%[%_%c%e%f%g%i%m%x%z&S&_&f&p&}'R(R)V)^*k*o*t+T+x,P,b,h-u-z.S.].|/_/`/a/c/g/j/l0T0j0t2i3R3f3h3i3x5o5}6W7j8]8o!j'e#]#k&W'w+X+[,m/{1X2q3q6{9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aQ(}$SQ)l$lQ*b%WQ*i%`Q,X9tQ.W)aQ.c)mQ/^*gQ2_.^Q3Z/VQ4^9vQ5S2`R8{9upeOSjy}!n$]%Y%c%f%g%i*o*t/g/jR*d%[&WVOSTjkn}!S!W!k!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$]$n%[%_%`%c%e%f%g%i%m%z&S&_&f&p&}'R'w(R)V)^*k*o*t+T+X+[+x,P,b,h,m-u-z.S.].|/_/`/a/c/g/j/l/{0T0j0t1X2i2q3R3f3h3i3q3x5o5}6W6{7j8]8o9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;`;a[!cRU!]!`%x&WQ$clQ$hmS$mp$rv$wrs!r!u$Z$u&`&t&w)x)y)z*m+Y+h,S,U/o0lQ%PwQ&h!iQ&j!jS(_#v(cS)f$i$jQ)j$lQ)w$tQ*Z%RQ*_%TS+|&k&lQ-V(`Q.[)gQ.b)mQ.d)nQ.g)rQ/P*[S/T*`*aQ0h+}Q1b-RQ2^.^Q2b.aQ2g.iQ3Y/UQ4i1cQ5R2`Q5U2dQ6u5QR7w6vx#xa!y$T$U$Y(W(Y(b(w(x,_-Y-w1a1y6i;^;i;j;k!Y$fm!j$h$i$j&U&j&k&l(k)f)g+]+j+|+}-d.[0Q0W0]0h1u3{4Q6Z7k8^Q)`$cQ*P$|Q*S$}Q*^%TQ.k)wQ/O*ZU/S*_*`*aQ3T/PS3X/T/UQ5b2sQ5t3YS7P5c5fS8O7Q7SQ8f8PQ8u8g#[;b!w#d#v#y&g'}(Z(h)])_)a*O*R+y-Z-].R.T.p.s.{.}1k1s2Q2T2X2j3Q3S4l4u4}5k5p6z7W8T9w9z9}:U:X:[:a:d:j;l;n;t;u;vd;c9d9x9{:O:V:Y:]:b:e:ke;d9r9y9|:P:W:Z:^:c:f:lW#}a$P(y;^S$|t%YQ$}uQ%OvR)}$z%P#|a!w!y#d#v#y$T$U$Y&g'}(W(Y(Z(b(h(w(x)])_)a*O*R+y,_-Y-Z-]-w.R.T.p.s.{.}1a1k1s1y2Q2T2X2j3Q3S4l4u4}5k5p6i6z7W8T9d9r9w9x9y9z9{9|9}:O:P:U:V:W:X:Y:Z:[:]:^:a:b:c:d:e:f:j:k:l;^;i;j;k;l;n;t;u;vT(O#s(PX)O$S9t9u9vU&Z!b$v+cQ'U!{Q)q$oQ.t*TQ1z-tR5^2o&^cORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$]$n%[%_%`%c%e%f%g%i%m%x%z&S&W&_&f&p&}'R'w(R)V)^*k*o*t+T+X+[+x,P,b,h,m-u-z.S.].|/_/`/a/c/g/j/l/{0T0j0t1X2i2q3R3f3h3i3q3x5o5}6W6{7j8]8o9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;a$]#aZ!_!o$a%w%}&y'Q'W'X'Y'Z'[']'^'_'`'a'b'd'g'k'u)p+R+^+g,O,^,d,g,i,w-x/v/y0i0s0w0x0y0z0{0|0}1O1P1Q1R1S1T1W1]2O2[3s3v4W4[4]4b4c5`6S6V6b6f6g7g7z8Z8m8y9_:|T!XQ!Y&_cORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$]$n%[%_%`%c%e%f%g%i%m%x%z&S&W&_&f&p&}'R'w(R)V)^*k*o*t+T+X+[+x,P,b,h,m-u-z.S.].|/_/`/a/c/g/j/l/{0T0j0t1X2i2q3R3f3h3i3q3x5o5}6W6{7j8]8o9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aQ&X!bR/|+`Y&R!b&V&^+`+fS(k#z(qS+j&d+mS-d(l(sQ-e(mQ-l(tQ.v*VU0W+k+o+pU0]+q+r+sS0b+t2xQ1u-kQ1w-mQ1x-nS2s.y2vU3{0Z0[0^Q4P0_Q4Q0aS5c2t2{S5f2y2zU6Z3|4O4RQ6`4SS7Q5g5hQ7S5iS7k6]6_S8P7R7TQ8^7mQ8g8QQ;h;oR;m;slhOSj}!n$]%c%f%g%i*o*t/g/jQ%k!QS&x!v9cQ)d$gQ*X%PQ*Y%QQ+z&iS,]&}:RS-y)V:_Q.Y)eQ.x*WQ/n*vQ/p*wQ/x+ZQ0`+qQ0f+{S2P-z:gQ2Y.ZS2].]:hQ3r/zQ3u0RQ4U0gQ5P2ZQ6T3tQ6X3zQ6a4VQ7e6RQ7h6YQ8Y7iQ8l8[R8x8n$W#`Z!_!o%w%}&y'Q'W'X'Y'Z'[']'^'_'`'a'b'd'g'k'u)p+R+^+g,O,^,d,g,w-x/v/y0i0s0w0x0y0z0{0|0}1O1P1Q1R1S1T1W1]2O2[3s3v4W4[4]4b4c5`6S6V6b6f6g7g7z8Z8m8y9_:|W(v#{&|1V8qT)Z$a,i$W#_Z!_!o%w%}&y'Q'W'X'Y'Z'[']'^'_'`'a'b'd'g'k'u)p+R+^+g,O,^,d,g,w-x/v/y0i0s0w0x0y0z0{0|0}1O1P1Q1R1S1T1W1]2O2[3s3v4W4[4]4b4c5`6S6V6b6f6g7g7z8Z8m8y9_:|Q'f#`S)Y$a,iR-{)Z&^cORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$]$n%[%_%`%c%e%f%g%i%m%x%z&S&W&_&f&p&}'R'w(R)V)^*k*o*t+T+X+[+x,P,b,h,m-u-z.S.].|/_/`/a/c/g/j/l/{0T0j0t1X2i2q3R3f3h3i3q3x5o5}6W6{7j8]8o9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aQ%f{Q%g|Q%i!OQ%j!PR/f*rQ&e!iQ)[$cQ+w&hS.Q)`)wS0c+u+vW2S-}.O.P.kS4T0d0eU4|2U2V2WU6s4{5Y5ZQ7v6tR8b7yT+l&d+mS+j&d+mU0W+k+o+pU0]+q+r+sS0b+t2xS2s.y2vU3{0Z0[0^Q4P0_Q4Q0aS5c2t2{S5f2y2zU6Z3|4O4RQ6`4SS7Q5g5hQ7S5iS7k6]6_S8P7R7TQ8^7mR8g8QS+l&d+mT2u.y2vS&r!q/dQ-U(_Q-b(kS0V+j2sQ1g-VS1p-c-lU3}0]0b5fQ4h1bS4s1v1xU6^4P4Q7SQ6k4iQ6r4vR7n6`Q!xXS&q!q/dQ)W$[Q)b$eQ)h$kQ,Q&rQ-T(_Q-a(kQ-f(nQ.X)cQ/Q*]S0U+j2sS1f-U-VS1o-b-lQ1r-eQ1t-gQ3V/RW3y0V0]0b5fQ4g1bQ4k1gS4o1p1xQ4t1wQ5r3WW6[3}4P4Q7SS6j4h4iS6n4p:iQ6p4sQ6}5aQ7[5sS7l6^6`Q7r6kS7s6o:mQ7u6rQ7|7OQ8V7]Q8_7nS8a7t:nQ8d7}Q8s8eQ9Q8tQ9X9RQ:u:pQ;T:zQ;U:{Q;V;hR;[;m$rWORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$]$n%[%_%`%c%e%f%g%i%m%x%z&S&_&f&p&}'R(R)V)^*k*o*t+T+x,P,b,h-u-z.S.].|/_/`/a/c/g/j/l0T0j0t2i3R3f3h3i3x5o5}6W7j8]8oS!xn!k!j:o#]#k&W'w+X+[,m/{1X2q3q6{9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aR:u;`$rXORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$]$n%[%_%`%c%e%f%g%i%m%x%z&S&_&f&p&}'R(R)V)^*k*o*t+T+x,P,b,h-u-z.S.].|/_/`/a/c/g/j/l0T0j0t2i3R3f3h3i3x5o5}6W7j8]8oQ$[b!Y$em!j$h$i$j&U&j&k&l(k)f)g+]+j+|+}-d.[0Q0W0]0h1u3{4Q6Z7k8^S$kn!kQ)c$fQ*]%TW/R*^*_*`*aU3W/S/T/UQ5a2sS5s3X3YU7O5b5c5fQ7]5tU7}7P7Q7SS8e8O8PS8t8f8gQ9R8u!j:p#]#k&W'w+X+[,m/{1X2q3q6{9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aQ:z;_R:{;`$f]OSTjk}!S!W!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$]$n%[%_%c%e%f%g%i%m%z&S&_&f&p&}'R(R)V)^*k*o*t+T+x,P,b,h-u-z.S.].|/_/`/a/c/g/j/l0T0j0t2i3R3f3h3i3x5o5}6W7j8]8oY!hRU!]!`%xv$wrs!r!u$Z$u&`&t&w)x)y)z*m+Y+h,S,U/o0lQ*j%`!h:q#]#k'w+X+[,m/{1X2q3q6{9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aR:t&WS&[!b$vR0O+c$p[ORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$]$n%[%_%c%e%f%g%i%m%x%z&S&_&f&p&}'R(R)V)^*k*o*t+T+x,P,b,h-u-z.S.].|/_/`/a/c/g/j/l0T0j0t2i3R3f3h3i3x5o5}6W7j8]8o!j'e#]#k&W'w+X+[,m/{1X2q3q6{9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aR*i%`$roORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$]$n%[%_%`%c%e%f%g%i%m%x%z&S&_&f&p&}'R(R)V)^*k*o*t+T+x,P,b,h-u-z.S.].|/_/`/a/c/g/j/l0T0j0t2i3R3f3h3i3x5o5}6W7j8]8oQ'U!{!k:r#]#k&W'w+X+[,m/{1X2q3q6{9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;a!h#VZ!_$a%w%}&y'Q'_'`'a'b'g'k)p+R+g,O,^,d,w-x0i0s1T2O2[3v4W4[6V7g8Z8m8y9_!R9k'd'u+^,i/v/y0w1P1Q1R1S1W1]3s4]4b4c5`6S6b6f6g7z:|!d#XZ!_$a%w%}&y'Q'a'b'g'k)p+R+g,O,^,d,w-x0i0s1T2O2[3v4W4[6V7g8Z8m8y9_}9m'd'u+^,i/v/y0w1R1S1W1]3s4]4b4c5`6S6b6f6g7z:|!`#]Z!_$a%w%}&y'Q'g'k)p+R+g,O,^,d,w-x0i0s1T2O2[3v4W4[6V7g8Z8m8y9_Q1a-Px;a'd'u+^,i/v/y0w1W1]3s4]4b4c5`6S6b6f6g7z:|Q;i;pQ;j;qR;k;r&^cORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$]$n%[%_%`%c%e%f%g%i%m%x%z&S&W&_&f&p&}'R'w(R)V)^*k*o*t+T+X+[+x,P,b,h,m-u-z.S.].|/_/`/a/c/g/j/l/{0T0j0t1X2i2q3R3f3h3i3q3x5o5}6W6{7j8]8o9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aS#l`#mR1Y,l&e_ORSTU`jk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k#m$]$n%[%_%`%c%e%f%g%i%m%x%z&S&W&_&f&p&}'R'w(R)V)^*k*o*t+T+X+[+x,P,b,h,l,m-u-z.S.].|/_/`/a/c/g/j/l/{0T0j0t1X2i2q3R3f3h3i3q3x5o5}6W6{7j8]8o9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aS#g^#nT'n#i'rT#h^#nT'p#i'r&e`ORSTU`jk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k#m$]$n%[%_%`%c%e%f%g%i%m%x%z&S&W&_&f&p&}'R'w(R)V)^*k*o*t+T+X+[+x,P,b,h,l,m-u-z.S.].|/_/`/a/c/g/j/l/{0T0j0t1X2i2q3R3f3h3i3q3x5o5}6W6{7j8]8o9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aT#l`#mQ#o`R'y#m$rbORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$]$n%[%_%`%c%e%f%g%i%m%x%z&S&_&f&p&}'R(R)V)^*k*o*t+T+x,P,b,h-u-z.S.].|/_/`/a/c/g/j/l0T0j0t2i3R3f3h3i3x5o5}6W7j8]8o!k;_#]#k&W'w+X+[,m/{1X2q3q6{9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;a#RdOSUj}!S!W!n!|#k$]%[%_%`%c%e%f%g%i%m&S&f'w)^*k*o*t+x,m-u.S.|/_/`/a/c/g/j/l1X2i3R3f3h3i5o5}x#{a!y$T$U$Y(W(Y(b(w(x,_-Y-w1a1y6i;^;i;j;k#[&|!w#d#v#y&g'}(Z(h)])_)a*O*R+y-Z-].R.T.p.s.{.}1k1s2Q2T2X2j3Q3S4l4u4}5k5p6z7W8T9w9z9}:U:X:[:a:d:j;l;n;t;u;vQ)S$WQ,x(Sd1V9r9y9|:P:W:Z:^:c:f:le8q9d9x9{:O:V:Y:]:b:e:kx#wa!y$T$U$Y(W(Y(b(w(x,_-Y-w1a1y6i;^;i;j;kQ(d#xS(n#z(qQ)T$XQ-g(o#[:w!w#d#v#y&g'}(Z(h)])_)a*O*R+y-Z-].R.T.p.s.{.}1k1s2Q2T2X2j3Q3S4l4u4}5k5p6z7W8T9w9z9}:U:X:[:a:d:j;l;n;t;u;vd:x9d9x9{:O:V:Y:]:b:e:kd:y9r9y9|:P:W:Z:^:c:f:lQ:};bQ;O;cQ;P;dQ;Q;eQ;R;fR;S;gx#{a!y$T$U$Y(W(Y(b(w(x,_-Y-w1a1y6i;^;i;j;k#[&|!w#d#v#y&g'}(Z(h)])_)a*O*R+y-Z-].R.T.p.s.{.}1k1s2Q2T2X2j3Q3S4l4u4}5k5p6z7W8T9w9z9}:U:X:[:a:d:j;l;n;t;u;vd1V9r9y9|:P:W:Z:^:c:f:le8q9d9x9{:O:V:Y:]:b:e:klfOSj}!n$]%c%f%g%i*o*t/g/jQ(g#yQ*}%pQ+O%rR1j-Z%O#|a!w!y#d#v#y$T$U$Y&g'}(W(Y(Z(b(h(w(x)])_)a*O*R+y,_-Y-Z-]-w.R.T.p.s.{.}1a1k1s1y2Q2T2X2j3Q3S4l4u4}5k5p6i6z7W8T9d9r9w9x9y9z9{9|9}:O:P:U:V:W:X:Y:Z:[:]:^:a:b:c:d:e:f:j:k:l;^;i;j;k;l;n;t;u;vQ*Q$}Q.r*SQ2m.qR5]2nT(p#z(qS(p#z(qT2u.y2vQ)b$eQ-f(nQ.X)cQ/Q*]Q3V/RQ5r3WQ6}5aQ7[5sQ7|7OQ8V7]Q8d7}Q8s8eQ9Q8tR9X9Rp(W#t'O)U-X-o-p0q1h1}4f4w7q:v;W;X;Y!n:U&z'i(^(f+v,[,t-P-^-|.P.o.q0e0p1i1m2W2l2n3O4Y4Z4m4q4y5O5Z5n6m6q7Y8`;Z;];p;q;r[:V8p9O9V9Y9Z9]]:W1U4a6c7o7p8zr(Y#t'O)U,}-X-o-p0q1h1}4f4w7q:v;W;X;Y!p:X&z'i(^(f+v,[,t-P-^-|.P.o.q0e0n0p1i1m2W2l2n3O4Y4Z4m4q4y5O5Z5n6m6q7Y8`;Z;];p;q;r^:Y8p9O9T9V9Y9Z9]_:Z1U4a6c6d7o7p8zpeOSjy}!n$]%Y%c%f%g%i*o*t/g/jQ%VxR*k%`peOSjy}!n$]%Y%c%f%g%i*o*t/g/jR%VxQ*U%OR.n)}qeOSjy}!n$]%Y%c%f%g%i*o*t/g/jQ.z*ZS3P/O/PW5j2|2}3O3TU7V5l5m5nU8R7U7X7YQ8h8SR8v8iQ%^yR*e%YR3^/XR7_5uS$mp$rR.d)nQ%czR*o%dR*u%jT/h*t/jR*y%kQ*x%kR/q*yQjOQ!nST$`j!nQ(P#sR,u(PQ!YQR%u!YQ!^RU%{!^%|+UQ%|!_R+U%}Q+a&XR/}+aQ,`'OR0r,`Q,c'QS0u,c0vR0v,dQ+m&dR0X+mS!eR$uU&a!e&b+VQ&b!fR+V&OQ+d&[R0P+dQ&u!sQ,R&sU,V&u,R0mR0m,WQ'r#iR,n'rQ#m`R'x#mQ#cZU'h#c+Q9qQ+Q9_R9q'uQ-S(_W1d-S1e4j6lU1e-T-U-VS4j1f1gR6l4k$k(U#t&z'O'i(^(f)P)Q)U+v,Y,Z,[,t,}-O-P-X-^-o-p-|.P.o.q0e0n0o0p0q1U1h1i1m1}2W2l2n3O4Y4Z4_4`4a4f4m4q4w4y5O5Z5n6c6d6e6m6q7Y7o7p7q8`8p8z8|8}9O9T9U9V9Y9Z9]:v;W;X;Y;Z;];p;q;rQ-[(fU1l-[1n4nQ1n-^R4n1mQ(q#zR-i(qQ(z$OR-r(zQ2R-|R4z2RQ){$xR.m){Q2p.tS5_2p6|R6|5`Q*W%PR.w*WQ2v.yR5d2vQ/W*bS3[/W5vR5v3^Q._)jW2a._2c5T6wQ2c.bQ5T2bR6w5UQ)o$mR.e)oQ/j*tR3l/jWiOSj!nQ%h}Q)X$]Q*n%cQ*p%fQ*q%gQ*s%iQ/e*oS/h*t/jR3k/gQ$_gQ%l!RQ%o!TQ%q!UQ%s!VQ)v$sQ)|$yQ*d%^Q*{%nQ-h(pS/Z*e*hQ/r*zQ/s*}Q/t+OS0S+j2sQ2f.hQ2k.oQ3U/QQ3`/]Q3j/fY3w0U0V0]0b5fQ5X2hQ5[2lQ5q3VQ5w3_[6U3v3y3}4P4Q7SQ6x5VQ7Z5rQ7`5xW7f6V6[6^6`Q7x6yQ7{6}Q8U7[U8X7g7l7nQ8c7|Q8j8VS8k8Z8_Q8r8dQ8w8mQ9P8sQ9S8yQ9W9QR9[9XQ$gmQ&i!jU)e$h$i$jQ+Z&UU+{&j&k&lQ-`(kS.Z)f)gQ/z+]Q0R+jS0g+|+}Q1q-dQ2Z.[Q3t0QS3z0W0]Q4V0hQ4r1uS6Y3{4QQ7i6ZQ8[7kR8n8^S#ua;^R({$PU$Oa$P;^R-q(yQ#taS&z!w)aQ'O!yQ'i#dQ(^#vQ(f#yQ)P$TQ)Q$UQ)U$YQ+v&gQ,Y9wQ,Z9zQ,[9}Q,t'}Q,}(WQ-O(YQ-P(ZQ-X(bQ-^(hQ-o(wQ-p(xd-|)].R.{2T3Q4}5k6z7W8TQ.P)_Q.o*OQ.q*RQ0e+yQ0n:UQ0o:XQ0p:[Q0q,_Q1U9rQ1h-YQ1i-ZQ1m-]Q1}-wQ2W.TQ2l.pQ2n.sQ3O.}Q4Y:aQ4Z:dQ4_9yQ4`9|Q4a:PQ4f1aQ4m1kQ4q1sQ4w1yQ4y2QQ5O2XQ5Z2jQ5n3SQ6c:^Q6d:WQ6e:ZQ6m4lQ6q4uQ7Y5pQ7o:cQ7p:fQ7q6iQ8`:jQ8p9dQ8z:lQ8|9xQ8}9{Q9O:OQ9T:VQ9U:YQ9V:]Q9Y:bQ9Z:eQ9]:kQ:v;^Q;W;iQ;X;jQ;Y;kQ;Z;lQ;];nQ;p;tQ;q;uR;r;vlgOSj}!n$]%c%f%g%i*o*t/g/jS!pU%eQ%n!SQ%t!WQ'V!|Q'v#kS*h%[%_Q*l%`Q*z%mQ+W&SQ+u&fQ,r'wQ.O)^Q/b*kQ0d+xQ1[,mQ1{-uQ2V.SQ2}.|Q3b/_Q3c/`Q3e/aQ3g/cQ3n/lQ4d1XQ5Y2iQ5m3RQ5|3fQ6O3hQ6P3iQ7X5oR7b5}!vZOSUj}!S!n!|$]%[%_%`%c%e%f%g%i%m&S&f)^*k*o*t+x-u.S.|/_/`/a/c/g/j/l2i3R3f3h3i5o5}Q!_RQ!oTQ$akS%w!]%zQ%}!`Q&y!vQ'Q!zQ'W#PQ'X#QQ'Y#RQ'Z#SQ'[#TQ']#UQ'^#VQ'_#WQ'`#XQ'a#YQ'b#ZQ'd#]Q'g#bQ'k#eW'u#k'w,m1XQ)p$nS+R%x+TS+^&W/{Q+g&_Q,O&pQ,^&}Q,d'RQ,g9^Q,i9`Q,w(RQ-x)VQ/v+XQ/y+[Q0i,PQ0s,bQ0w9cQ0x9eQ0y9fQ0z9gQ0{9hQ0|9iQ0}9jQ1O9kQ1P9lQ1Q9mQ1R9nQ1S9oQ1T,hQ1W9sQ1]9pQ2O-zQ2[.]Q3s:QQ3v0TQ4W0jQ4[0tQ4]:RQ4b:TQ4c:_Q5`2qQ6S3qQ6V3xQ6b:`Q6f:gQ6g:hQ7g6WQ7z6{Q8Z7jQ8m8]Q8y8oQ9_!WR:|;aR!aRR&Y!bS&U!b+`S+]&V&^R0Q+fR'P!yR'S!zT!tU$ZS!sU$ZU$xrs*mS&s!r!uQ,T&tQ,W&wQ.l)zS0k,S,UR4X0l`!dR!]!`$u%x&`)x+hh!qUrs!r!u$Z&t&w)z,S,U0lQ/d*mQ/w+YQ3p/oT:s&W)yT!gR$uS!fR$uS%y!]&`S&O!`)xS+S%x+hT+_&W)yT&]!b$vQ#i^R'{#nT'q#i'rR1Z,lT(a#v(cR(i#yQ-})]Q2U.RQ2|.{Q4{2TQ5l3QQ6t4}Q7U5kQ7y6zQ8S7WR8i8TlhOSj}!n$]%c%f%g%i*o*t/g/jQ%]yR*d%YV$yrs*mR.u*TR*c%WQ$qpR)u$rR)k$lT%az%dT%bz%dT/i*t/j",
  nodeNames: "\u26A0 extends ArithOp ArithOp InterpolationStart LineComment BlockComment Script ExportDeclaration export Star as VariableName String from ; default FunctionDeclaration async function VariableDefinition TypeParamList TypeDefinition ThisType this LiteralType ArithOp Number BooleanLiteral TemplateType InterpolationEnd Interpolation VoidType void TypeofType typeof MemberExpression . ?. PropertyName [ TemplateString Interpolation null super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyDefinition Block : NewExpression new TypeArgList CompareOp < ) ( ArgList UnaryExpression await yield delete LogicOp BitOp ParenthesizedExpression ClassExpression class extends ClassBody MethodDeclaration Privacy static abstract override PrivatePropertyDefinition PropertyDeclaration readonly Optional TypeAnnotation Equals StaticBlock FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty Privacy readonly Arrow MemberExpression PrivatePropertyName BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp instanceof in const CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression TaggedTemplateExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXStartTag JSXSelfClosingTag JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast ArrowFunction TypeParamList SequenceExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature CallSignature TypePredicate is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody MethodDeclaration AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try CatchClause catch FinallyClause finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement",
  maxTerm: 332,
  context: e0,
  nodeProps: [
    ["closedBy", 4, "InterpolationEnd", 40, "]", 51, "}", 66, ")", 132, "JSXSelfCloseEndTag JSXEndTag", 146, "JSXEndTag"],
    ["group", -26, 8, 15, 17, 58, 184, 188, 191, 192, 194, 197, 200, 211, 213, 219, 221, 223, 225, 228, 234, 240, 242, 244, 246, 248, 250, 251, "Statement", -30, 12, 13, 24, 27, 28, 41, 43, 44, 45, 47, 52, 60, 68, 74, 75, 91, 92, 101, 103, 119, 122, 124, 125, 126, 127, 129, 130, 148, 149, 151, "Expression", -22, 23, 25, 29, 32, 34, 152, 154, 156, 157, 159, 160, 161, 163, 164, 165, 167, 168, 169, 178, 180, 182, 183, "Type", -3, 79, 85, 90, "ClassItem"],
    ["openedBy", 30, "InterpolationStart", 46, "[", 50, "{", 65, "(", 131, "JSXStartTag", 141, "JSXStartTag JSXStartCloseTag"]
  ],
  propSources: [o0],
  skippedNodes: [0, 5, 6],
  repeatNodeCount: 28,
  tokenData: "!C}~R!`OX%TXY%cYZ'RZ[%c[]%T]^'R^p%Tpq%cqr'crs(kst0htu2`uv4pvw5ewx6cxy<yyz=Zz{=k{|>k|}?O}!O>k!O!P?`!P!QCl!Q!R!0[!R![!1q![!]!7s!]!^!8V!^!_!8g!_!`!9d!`!a!:[!a!b!<R!b!c%T!c!}2`!}#O!=d#O#P%T#P#Q!=t#Q#R!>U#R#S2`#S#T!>i#T#o2`#o#p!>y#p#q!?O#q#r!?f#r#s!?x#s$f%T$f$g%c$g#BY2`#BY#BZ!@Y#BZ$IS2`$IS$I_!@Y$I_$I|2`$I|$I}!Bq$I}$JO!Bq$JO$JT2`$JT$JU!@Y$JU$KV2`$KV$KW!@Y$KW&FU2`&FU&FV!@Y&FV?HT2`?HT?HU!@Y?HU~2`W%YR$UWO!^%T!_#o%T#p~%T7Z%jg$UW'Y7ROX%TXY%cYZ%TZ[%c[p%Tpq%cq!^%T!_#o%T#p$f%T$f$g%c$g#BY%T#BY#BZ%c#BZ$IS%T$IS$I_%c$I_$JT%T$JT$JU%c$JU$KV%T$KV$KW%c$KW&FU%T&FU&FV%c&FV?HT%T?HT?HU%c?HU~%T7Z'YR$UW'Z7RO!^%T!_#o%T#p~%T$T'jS$UW!j#{O!^%T!_!`'v!`#o%T#p~%T$O'}S#e#v$UWO!^%T!_!`(Z!`#o%T#p~%T$O(bR#e#v$UWO!^%T!_#o%T#p~%T)X(rZ$UW]#eOY(kYZ)eZr(krs*rs!^(k!^!_+U!_#O(k#O#P-b#P#o(k#o#p+U#p~(k&r)jV$UWOr)ers*Ps!^)e!^!_*a!_#o)e#o#p*a#p~)e&r*WR$P&j$UWO!^%T!_#o%T#p~%T&j*dROr*ars*ms~*a&j*rO$P&j)X*{R$P&j$UW]#eO!^%T!_#o%T#p~%T)P+ZV]#eOY+UYZ*aZr+Urs+ps#O+U#O#P+w#P~+U)P+wO$P&j]#e)P+zROr+Urs,Ts~+U)P,[U$P&j]#eOY,nZr,nrs-Vs#O,n#O#P-[#P~,n#e,sU]#eOY,nZr,nrs-Vs#O,n#O#P-[#P~,n#e-[O]#e#e-_PO~,n)X-gV$UWOr(krs-|s!^(k!^!_+U!_#o(k#o#p+U#p~(k)X.VZ$P&j$UW]#eOY.xYZ%TZr.xrs/rs!^.x!^!_,n!_#O.x#O#P0S#P#o.x#o#p,n#p~.x#m/PZ$UW]#eOY.xYZ%TZr.xrs/rs!^.x!^!_,n!_#O.x#O#P0S#P#o.x#o#p,n#p~.x#m/yR$UW]#eO!^%T!_#o%T#p~%T#m0XT$UWO!^.x!^!_,n!_#o.x#o#p,n#p~.x3]0mZ$UWOt%Ttu1`u!^%T!_!c%T!c!}1`!}#R%T#R#S1`#S#T%T#T#o1`#p$g%T$g~1`3]1g]$UW'o3TOt%Ttu1`u!Q%T!Q![1`![!^%T!_!c%T!c!}1`!}#R%T#R#S1`#S#T%T#T#o1`#p$g%T$g~1`7Z2k_$UW#zS']$y'g3SOt%Ttu2`u}%T}!O3j!O!Q%T!Q![2`![!^%T!_!c%T!c!}2`!}#R%T#R#S2`#S#T%T#T#o2`#p$g%T$g~2`[3q_$UW#zSOt%Ttu3ju}%T}!O3j!O!Q%T!Q![3j![!^%T!_!c%T!c!}3j!}#R%T#R#S3j#S#T%T#T#o3j#p$g%T$g~3j$O4wS#^#v$UWO!^%T!_!`5T!`#o%T#p~%T$O5[R$UW#o#vO!^%T!_#o%T#p~%T5b5lU'x5Y$UWOv%Tvw6Ow!^%T!_!`5T!`#o%T#p~%T$O6VS$UW#i#vO!^%T!_!`5T!`#o%T#p~%T)X6jZ$UW]#eOY6cYZ7]Zw6cwx*rx!^6c!^!_8T!_#O6c#O#P:T#P#o6c#o#p8T#p~6c&r7bV$UWOw7]wx*Px!^7]!^!_7w!_#o7]#o#p7w#p~7]&j7zROw7wwx*mx~7w)P8YV]#eOY8TYZ7wZw8Twx+px#O8T#O#P8o#P~8T)P8rROw8Twx8{x~8T)P9SU$P&j]#eOY9fZw9fwx-Vx#O9f#O#P9}#P~9f#e9kU]#eOY9fZw9fwx-Vx#O9f#O#P9}#P~9f#e:QPO~9f)X:YV$UWOw6cwx:ox!^6c!^!_8T!_#o6c#o#p8T#p~6c)X:xZ$P&j$UW]#eOY;kYZ%TZw;kwx/rx!^;k!^!_9f!_#O;k#O#P<e#P#o;k#o#p9f#p~;k#m;rZ$UW]#eOY;kYZ%TZw;kwx/rx!^;k!^!_9f!_#O;k#O#P<e#P#o;k#o#p9f#p~;k#m<jT$UWO!^;k!^!_9f!_#o;k#o#p9f#p~;k&i=QR!d&a$UWO!^%T!_#o%T#p~%Tk=bR!cc$UWO!^%T!_#o%T#p~%T7V=tU'^4V#_#v$UWOz%Tz{>W{!^%T!_!`5T!`#o%T#p~%T$O>_S#[#v$UWO!^%T!_!`5T!`#o%T#p~%T%w>rSj%o$UWO!^%T!_!`5T!`#o%T#p~%T&i?VR!R&a$UWO!^%T!_#o%T#p~%T7Z?gVu5^$UWO!O%T!O!P?|!P!Q%T!Q![@r![!^%T!_#o%T#p~%T!{@RT$UWO!O%T!O!P@b!P!^%T!_#o%T#p~%T!{@iR!Q!s$UWO!^%T!_#o%T#p~%T!{@yZ$UWk!sO!Q%T!Q![@r![!^%T!_!g%T!g!hAl!h#R%T#R#S@r#S#X%T#X#YAl#Y#o%T#p~%T!{AqZ$UWO{%T{|Bd|}%T}!OBd!O!Q%T!Q![CO![!^%T!_#R%T#R#SCO#S#o%T#p~%T!{BiV$UWO!Q%T!Q![CO![!^%T!_#R%T#R#SCO#S#o%T#p~%T!{CVV$UWk!sO!Q%T!Q![CO![!^%T!_#R%T#R#SCO#S#o%T#p~%T7ZCs`$UW#]#vOYDuYZ%TZzDuz{Jl{!PDu!P!Q!-e!Q!^Du!^!_Fx!_!`!.^!`!a!/]!a!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~DuXD|[$UW}POYDuYZ%TZ!PDu!P!QEr!Q!^Du!^!_Fx!_!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~DuXEy_$UW}PO!^%T!_#Z%T#Z#[Er#[#]%T#]#^Er#^#a%T#a#bEr#b#g%T#g#hEr#h#i%T#i#jEr#j#m%T#m#nEr#n#o%T#p~%TPF}V}POYFxZ!PFx!P!QGd!Q!}Fx!}#OG{#O#PHh#P~FxPGiU}P#Z#[Gd#]#^Gd#a#bGd#g#hGd#i#jGd#m#nGdPHOTOYG{Z#OG{#O#PH_#P#QFx#Q~G{PHbQOYG{Z~G{PHkQOYFxZ~FxXHvY$UWOYHqYZ%TZ!^Hq!^!_G{!_#OHq#O#PIf#P#QDu#Q#oHq#o#pG{#p~HqXIkV$UWOYHqYZ%TZ!^Hq!^!_G{!_#oHq#o#pG{#p~HqXJVV$UWOYDuYZ%TZ!^Du!^!_Fx!_#oDu#o#pFx#p~Du7ZJs^$UW}POYJlYZKoZzJlz{NQ{!PJl!P!Q!,R!Q!^Jl!^!_!!]!_!}Jl!}#O!'|#O#P!+a#P#oJl#o#p!!]#p~Jl7ZKtV$UWOzKoz{LZ{!^Ko!^!_M]!_#oKo#o#pM]#p~Ko7ZL`X$UWOzKoz{LZ{!PKo!P!QL{!Q!^Ko!^!_M]!_#oKo#o#pM]#p~Ko7ZMSR$UWU7RO!^%T!_#o%T#p~%T7RM`ROzM]z{Mi{~M]7RMlTOzM]z{Mi{!PM]!P!QM{!Q~M]7RNQOU7R7ZNX^$UW}POYJlYZKoZzJlz{NQ{!PJl!P!Q! T!Q!^Jl!^!_!!]!_!}Jl!}#O!'|#O#P!+a#P#oJl#o#p!!]#p~Jl7Z! ^_$UWU7R}PO!^%T!_#Z%T#Z#[Er#[#]%T#]#^Er#^#a%T#a#bEr#b#g%T#g#hEr#h#i%T#i#jEr#j#m%T#m#nEr#n#o%T#p~%T7R!!bY}POY!!]YZM]Zz!!]z{!#Q{!P!!]!P!Q!&x!Q!}!!]!}#O!$`#O#P!&f#P~!!]7R!#VY}POY!!]YZM]Zz!!]z{!#Q{!P!!]!P!Q!#u!Q!}!!]!}#O!$`#O#P!&f#P~!!]7R!#|UU7R}P#Z#[Gd#]#^Gd#a#bGd#g#hGd#i#jGd#m#nGd7R!$cWOY!$`YZM]Zz!$`z{!${{#O!$`#O#P!&S#P#Q!!]#Q~!$`7R!%OYOY!$`YZM]Zz!$`z{!${{!P!$`!P!Q!%n!Q#O!$`#O#P!&S#P#Q!!]#Q~!$`7R!%sTU7ROYG{Z#OG{#O#PH_#P#QFx#Q~G{7R!&VTOY!$`YZM]Zz!$`z{!${{~!$`7R!&iTOY!!]YZM]Zz!!]z{!#Q{~!!]7R!&}_}POzM]z{Mi{#ZM]#Z#[!&x#[#]M]#]#^!&x#^#aM]#a#b!&x#b#gM]#g#h!&x#h#iM]#i#j!&x#j#mM]#m#n!&x#n~M]7Z!(R[$UWOY!'|YZKoZz!'|z{!(w{!^!'|!^!_!$`!_#O!'|#O#P!*o#P#QJl#Q#o!'|#o#p!$`#p~!'|7Z!(|^$UWOY!'|YZKoZz!'|z{!(w{!P!'|!P!Q!)x!Q!^!'|!^!_!$`!_#O!'|#O#P!*o#P#QJl#Q#o!'|#o#p!$`#p~!'|7Z!*PY$UWU7ROYHqYZ%TZ!^Hq!^!_G{!_#OHq#O#PIf#P#QDu#Q#oHq#o#pG{#p~Hq7Z!*tX$UWOY!'|YZKoZz!'|z{!(w{!^!'|!^!_!$`!_#o!'|#o#p!$`#p~!'|7Z!+fX$UWOYJlYZKoZzJlz{NQ{!^Jl!^!_!!]!_#oJl#o#p!!]#p~Jl7Z!,Yc$UW}POzKoz{LZ{!^Ko!^!_M]!_#ZKo#Z#[!,R#[#]Ko#]#^!,R#^#aKo#a#b!,R#b#gKo#g#h!,R#h#iKo#i#j!,R#j#mKo#m#n!,R#n#oKo#o#pM]#p~Ko7Z!-lV$UWT7ROY!-eYZ%TZ!^!-e!^!_!.R!_#o!-e#o#p!.R#p~!-e7R!.WQT7ROY!.RZ~!.R$P!.g[$UW#o#v}POYDuYZ%TZ!PDu!P!QEr!Q!^Du!^!_Fx!_!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~Du]!/f[#wS$UW}POYDuYZ%TZ!PDu!P!QEr!Q!^Du!^!_Fx!_!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~Du!{!0cd$UWk!sO!O%T!O!P@r!P!Q%T!Q![!1q![!^%T!_!g%T!g!hAl!h#R%T#R#S!1q#S#U%T#U#V!3X#V#X%T#X#YAl#Y#b%T#b#c!2w#c#d!4m#d#l%T#l#m!5{#m#o%T#p~%T!{!1x_$UWk!sO!O%T!O!P@r!P!Q%T!Q![!1q![!^%T!_!g%T!g!hAl!h#R%T#R#S!1q#S#X%T#X#YAl#Y#b%T#b#c!2w#c#o%T#p~%T!{!3OR$UWk!sO!^%T!_#o%T#p~%T!{!3^W$UWO!Q%T!Q!R!3v!R!S!3v!S!^%T!_#R%T#R#S!3v#S#o%T#p~%T!{!3}Y$UWk!sO!Q%T!Q!R!3v!R!S!3v!S!^%T!_#R%T#R#S!3v#S#b%T#b#c!2w#c#o%T#p~%T!{!4rV$UWO!Q%T!Q!Y!5X!Y!^%T!_#R%T#R#S!5X#S#o%T#p~%T!{!5`X$UWk!sO!Q%T!Q!Y!5X!Y!^%T!_#R%T#R#S!5X#S#b%T#b#c!2w#c#o%T#p~%T!{!6QZ$UWO!Q%T!Q![!6s![!^%T!_!c%T!c!i!6s!i#R%T#R#S!6s#S#T%T#T#Z!6s#Z#o%T#p~%T!{!6z]$UWk!sO!Q%T!Q![!6s![!^%T!_!c%T!c!i!6s!i#R%T#R#S!6s#S#T%T#T#Z!6s#Z#b%T#b#c!2w#c#o%T#p~%T$u!7|R!]V$UW#m$fO!^%T!_#o%T#p~%T!q!8^R_!i$UWO!^%T!_#o%T#p~%T5w!8rR'bd!a/n#x&s'|P!P!Q!8{!^!_!9Q!_!`!9_W!9QO$WW#v!9VP#`#v!_!`!9Y#v!9_O#o#v#v!9dO#a#v$u!9kT!{$m$UWO!^%T!_!`'v!`!a!9z!a#o%T#p~%T$P!:RR#W#w$UWO!^%T!_#o%T#p~%T%V!:gT'a!R#a#v$RS$UWO!^%T!_!`!:v!`!a!;W!a#o%T#p~%T$O!:}R#a#v$UWO!^%T!_#o%T#p~%T$O!;_T#`#v$UWO!^%T!_!`5T!`!a!;n!a#o%T#p~%T$O!;uS#`#v$UWO!^%T!_!`5T!`#o%T#p~%T*a!<YV'p#{$UWO!O%T!O!P!<o!P!^%T!_!a%T!a!b!=P!b#o%T#p~%T*[!<vRv*S$UWO!^%T!_#o%T#p~%T$O!=WS$UW#j#vO!^%T!_!`5T!`#o%T#p~%T7V!=kRx6}$UWO!^%T!_#o%T#p~%Tk!={R!Oc$UWO!^%T!_#o%T#p~%T$O!>]S#g#v$UWO!^%T!_!`5T!`#o%T#p~%T$a!>pR$UW'f$XO!^%T!_#o%T#p~%T~!?OO!T~5b!?VT'w5Y$UWO!^%T!_!`5T!`#o%T#p#q!=P#q~%T6X!?oR!S5}nQ$UWO!^%T!_#o%T#p~%TX!@PR!kP$UWO!^%T!_#o%T#p~%T7Z!@gr$UW'Y7R#zS']$y'g3SOX%TXY%cYZ%TZ[%c[p%Tpq%cqt%Ttu2`u}%T}!O3j!O!Q%T!Q![2`![!^%T!_!c%T!c!}2`!}#R%T#R#S2`#S#T%T#T#o2`#p$f%T$f$g%c$g#BY2`#BY#BZ!@Y#BZ$IS2`$IS$I_!@Y$I_$JT2`$JT$JU!@Y$JU$KV2`$KV$KW!@Y$KW&FU2`&FU&FV!@Y&FV?HT2`?HT?HU!@Y?HU~2`7Z!CO_$UW'Z7R#zS']$y'g3SOt%Ttu2`u}%T}!O3j!O!Q%T!Q![2`![!^%T!_!c%T!c!}2`!}#R%T#R#S2`#S#T%T#T#o2`#p$g%T$g~2`",
  tokenizers: [s0, i0, n0, r0, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, t0],
  topRules: { Script: [0, 7] },
  dialects: { jsx: 12107, ts: 12109 },
  dynamicPrecedences: { 149: 1, 176: 1 },
  specialized: [{ term: 289, get: (n) => l0[n] || -1 }, { term: 299, get: (n) => a0[n] || -1 }, { term: 63, get: (n) => h0[n] || -1 }],
  tokenPrec: 12130
}), f0 = [
  /* @__PURE__ */ Xe("function ${name}(${params}) {\n	${}\n}", {
    label: "function",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ Xe("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n	${}\n}", {
    label: "for",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ Xe("for (let ${name} of ${collection}) {\n	${}\n}", {
    label: "for",
    detail: "of loop",
    type: "keyword"
  }),
  /* @__PURE__ */ Xe("do {\n	${}\n} while (${})", {
    label: "do",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ Xe("while (${}) {\n	${}\n}", {
    label: "while",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ Xe(`try {
	\${}
} catch (\${error}) {
	\${}
}`, {
    label: "try",
    detail: "/ catch block",
    type: "keyword"
  }),
  /* @__PURE__ */ Xe("if (${}) {\n	${}\n}", {
    label: "if",
    detail: "block",
    type: "keyword"
  }),
  /* @__PURE__ */ Xe(`if (\${}) {
	\${}
} else {
	\${}
}`, {
    label: "if",
    detail: "/ else block",
    type: "keyword"
  }),
  /* @__PURE__ */ Xe(`class \${name} {
	constructor(\${params}) {
		\${}
	}
}`, {
    label: "class",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ Xe('import {${names}} from "${module}"\n${}', {
    label: "import",
    detail: "named",
    type: "keyword"
  }),
  /* @__PURE__ */ Xe('import ${name} from "${module}"\n${}', {
    label: "import",
    detail: "default",
    type: "keyword"
  })
], ha = /* @__PURE__ */ new rO(), Of = /* @__PURE__ */ new Set([
  "Script",
  "Block",
  "FunctionExpression",
  "FunctionDeclaration",
  "ArrowFunction",
  "MethodDeclaration",
  "ForStatement"
]);
function oi(n) {
  return (e, t) => {
    let i = e.node.getChild("VariableDefinition");
    return i && t(i, n), !0;
  };
}
const u0 = ["FunctionDeclaration"], d0 = {
  FunctionDeclaration: /* @__PURE__ */ oi("function"),
  ClassDeclaration: /* @__PURE__ */ oi("class"),
  ClassExpression: () => !0,
  EnumDeclaration: /* @__PURE__ */ oi("constant"),
  TypeAliasDeclaration: /* @__PURE__ */ oi("type"),
  NamespaceDeclaration: /* @__PURE__ */ oi("namespace"),
  VariableDefinition(n, e) {
    n.matchContext(u0) || e(n, "variable");
  },
  TypeDefinition(n, e) {
    e(n, "type");
  },
  __proto__: null
};
function pf(n, e) {
  let t = ha.get(e);
  if (t)
    return t;
  let i = [], r = !0;
  function s(o, l) {
    let a = n.sliceString(o.from, o.to);
    i.push({ label: a, type: l });
  }
  return e.cursor(I.IncludeAnonymous).iterate((o) => {
    if (r)
      r = !1;
    else if (o.name) {
      let l = d0[o.name];
      if (l && l(o, s) || Of.has(o.name))
        return !1;
    } else if (o.to - o.from > 8192) {
      for (let l of pf(n, o.node))
        i.push(l);
      return !1;
    }
  }), ha.set(e, i), i;
}
const ca = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/, gf = [
  "TemplateString",
  "String",
  "RegExp",
  "LineComment",
  "BlockComment",
  "VariableDefinition",
  "TypeDefinition",
  "Label",
  "PropertyDefinition",
  "PropertyName",
  "PrivatePropertyDefinition",
  "PrivatePropertyName"
];
function O0(n) {
  let e = Y(n.state).resolveInner(n.pos, -1);
  if (gf.indexOf(e.name) > -1)
    return null;
  let t = e.to - e.from < 20 && ca.test(n.state.sliceDoc(e.from, e.to));
  if (!t && !n.explicit)
    return null;
  let i = [];
  for (let r = e; r; r = r.parent)
    Of.has(r.name) && (i = i.concat(pf(n.state.doc, r)));
  return {
    options: i,
    from: t ? e.from : n.pos,
    validFor: ca
  };
}
const Ot = /* @__PURE__ */ Ut.define({
  parser: /* @__PURE__ */ c0.configure({
    props: [
      /* @__PURE__ */ Yn.add({
        IfStatement: /* @__PURE__ */ ln({ except: /^\s*({|else\b)/ }),
        TryStatement: /* @__PURE__ */ ln({ except: /^\s*({|catch\b|finally\b)/ }),
        LabeledStatement: AO,
        SwitchBody: (n) => {
          let e = n.textAfter, t = /^\s*\}/.test(e), i = /^\s*(case|default)\b/.test(e);
          return n.baseIndent + (t ? 0 : i ? 1 : 2) * n.unit;
        },
        Block: /* @__PURE__ */ CO({ closing: "}" }),
        ArrowFunction: (n) => n.baseIndent + n.unit,
        "TemplateString BlockComment": () => null,
        "Statement Property": /* @__PURE__ */ ln({ except: /^{/ }),
        JSXElement(n) {
          let e = /^\s*<\//.test(n.textAfter);
          return n.lineIndent(n.node.from) + (e ? 0 : n.unit);
        },
        JSXEscape(n) {
          let e = /\s*\}/.test(n.textAfter);
          return n.lineIndent(n.node.from) + (e ? 0 : n.unit);
        },
        "JSXOpenTag JSXSelfClosingTag"(n) {
          return n.column(n.node.from) + n.unit;
        }
      }),
      /* @__PURE__ */ Fn.add({
        "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression": Jh,
        BlockComment(n) {
          return { from: n.from + 2, to: n.to - 2 };
        }
      })
    ]
  }),
  languageData: {
    closeBrackets: { brackets: ["(", "[", "{", "'", '"', "`"] },
    commentTokens: { line: "//", block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*(?:case |default:|\{|\}|<\/)$/,
    wordChars: "$"
  }
}), p0 = /* @__PURE__ */ Ot.configure({ dialect: "ts" }), g0 = /* @__PURE__ */ Ot.configure({ dialect: "jsx" }), m0 = /* @__PURE__ */ Ot.configure({ dialect: "jsx ts" }), Q0 = /* @__PURE__ */ "break case const continue default delete export extends false finally in instanceof let new return static super switch this throw true typeof var yield".split(" ").map((n) => ({ label: n, type: "keyword" }));
function mf(n = {}) {
  let e = n.jsx ? n.typescript ? m0 : g0 : n.typescript ? p0 : Ot;
  return new Vs(e, [
    Ot.data.of({
      autocomplete: jg(gf, Jc(f0.concat(Q0)))
    }),
    Ot.data.of({
      autocomplete: O0
    }),
    n.jsx ? y0 : []
  ]);
}
function fa(n, e, t = n.length) {
  if (!e)
    return "";
  let i = e.getChild("JSXIdentifier");
  return i ? n.sliceString(i.from, Math.min(i.to, t)) : "";
}
const b0 = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent), y0 = /* @__PURE__ */ P.inputHandler.of((n, e, t, i) => {
  if ((b0 ? n.composing : n.compositionStarted) || n.state.readOnly || e != t || i != ">" && i != "/" || !Ot.isActiveAt(n.state, e, -1))
    return !1;
  let { state: r } = n, s = r.changeByRange((o) => {
    var l, a, h;
    let { head: c } = o, f = Y(r).resolveInner(c, -1), u;
    if (f.name == "JSXStartTag" && (f = f.parent), i == ">" && f.name == "JSXFragmentTag")
      return { range: m.cursor(c + 1), changes: { from: c, insert: "><>" } };
    if (i == ">" && f.name == "JSXIdentifier") {
      if (((a = (l = f.parent) === null || l === void 0 ? void 0 : l.lastChild) === null || a === void 0 ? void 0 : a.name) != "JSXEndTag" && (u = fa(r.doc, f.parent, c)))
        return { range: m.cursor(c + 1), changes: { from: c, insert: `></${u}>` } };
    } else if (i == "/" && f.name == "JSXFragmentTag") {
      let d = f.parent, O = d == null ? void 0 : d.parent;
      if (d.from == c - 1 && ((h = O.lastChild) === null || h === void 0 ? void 0 : h.name) != "JSXEndTag" && (u = fa(r.doc, O == null ? void 0 : O.firstChild, c))) {
        let g = `/${u}>`;
        return { range: m.cursor(c + g.length), changes: { from: c, insert: g } };
      }
    }
    return { range: o };
  });
  return s.changes.empty ? !1 : (n.dispatch(s, { userEvent: "input.type", scrollIntoView: !0 }), !0);
}), S0 = 53, x0 = 1, $0 = 54, k0 = 2, w0 = 55, T0 = 3, jn = 4, Qf = 5, bf = 6, yf = 7, Sf = 8, v0 = 9, P0 = 10, R0 = 11, Xr = 56, C0 = 12, ua = 57, A0 = 18, W0 = 27, X0 = 30, Z0 = 33, D0 = 35, M0 = 0, j0 = {
  area: !0,
  base: !0,
  br: !0,
  col: !0,
  command: !0,
  embed: !0,
  frame: !0,
  hr: !0,
  img: !0,
  input: !0,
  keygen: !0,
  link: !0,
  meta: !0,
  param: !0,
  source: !0,
  track: !0,
  wbr: !0,
  menuitem: !0
}, z0 = {
  dd: !0,
  li: !0,
  optgroup: !0,
  option: !0,
  p: !0,
  rp: !0,
  rt: !0,
  tbody: !0,
  td: !0,
  tfoot: !0,
  th: !0,
  tr: !0
}, da = {
  dd: { dd: !0, dt: !0 },
  dt: { dd: !0, dt: !0 },
  li: { li: !0 },
  option: { option: !0, optgroup: !0 },
  optgroup: { optgroup: !0 },
  p: {
    address: !0,
    article: !0,
    aside: !0,
    blockquote: !0,
    dir: !0,
    div: !0,
    dl: !0,
    fieldset: !0,
    footer: !0,
    form: !0,
    h1: !0,
    h2: !0,
    h3: !0,
    h4: !0,
    h5: !0,
    h6: !0,
    header: !0,
    hgroup: !0,
    hr: !0,
    menu: !0,
    nav: !0,
    ol: !0,
    p: !0,
    pre: !0,
    section: !0,
    table: !0,
    ul: !0
  },
  rp: { rp: !0, rt: !0 },
  rt: { rp: !0, rt: !0 },
  tbody: { tbody: !0, tfoot: !0 },
  td: { td: !0, th: !0 },
  tfoot: { tbody: !0 },
  th: { td: !0, th: !0 },
  thead: { tbody: !0, tfoot: !0 },
  tr: { tr: !0 }
};
function q0(n) {
  return n == 45 || n == 46 || n == 58 || n >= 65 && n <= 90 || n == 95 || n >= 97 && n <= 122 || n >= 161;
}
function xf(n) {
  return n == 9 || n == 10 || n == 13 || n == 32;
}
let Oa = null, pa = null, ga = 0;
function Ps(n, e) {
  let t = n.pos + e;
  if (ga == t && pa == n)
    return Oa;
  let i = n.peek(e);
  for (; xf(i); )
    i = n.peek(++e);
  let r = "";
  for (; q0(i); )
    r += String.fromCharCode(i), i = n.peek(++e);
  return pa = n, ga = t, Oa = r ? r.toLowerCase() : i == E0 || i == _0 ? void 0 : null;
}
const $f = 60, kf = 62, wf = 47, E0 = 63, _0 = 33, I0 = 45;
function ma(n, e) {
  this.name = n, this.parent = e, this.hash = e ? e.hash : 0;
  for (let t = 0; t < n.length; t++)
    this.hash += (this.hash << 4) + n.charCodeAt(t) + (n.charCodeAt(t) << 8);
}
const G0 = [jn, Sf, Qf, bf, yf], V0 = new uf({
  start: null,
  shift(n, e, t, i) {
    return G0.indexOf(e) > -1 ? new ma(Ps(i, 1) || "", n) : n;
  },
  reduce(n, e) {
    return e == A0 && n ? n.parent : n;
  },
  reuse(n, e, t, i) {
    let r = e.type.id;
    return r == jn || r == D0 ? new ma(Ps(i, 1) || "", n) : n;
  },
  hash(n) {
    return n ? n.hash : 0;
  },
  strict: !1
}), N0 = new je((n, e) => {
  if (n.next != $f) {
    n.next < 0 && e.context && n.acceptToken(Xr);
    return;
  }
  n.advance();
  let t = n.next == wf;
  t && n.advance();
  let i = Ps(n, 0);
  if (i === void 0)
    return;
  if (!i)
    return n.acceptToken(t ? C0 : jn);
  let r = e.context ? e.context.name : null;
  if (t) {
    if (i == r)
      return n.acceptToken(v0);
    if (r && z0[r])
      return n.acceptToken(Xr, -2);
    if (e.dialectEnabled(M0))
      return n.acceptToken(P0);
    for (let s = e.context; s; s = s.parent)
      if (s.name == i)
        return;
    n.acceptToken(R0);
  } else {
    if (i == "script")
      return n.acceptToken(Qf);
    if (i == "style")
      return n.acceptToken(bf);
    if (i == "textarea")
      return n.acceptToken(yf);
    if (j0.hasOwnProperty(i))
      return n.acceptToken(Sf);
    r && da[r] && da[r][i] ? n.acceptToken(Xr, -1) : n.acceptToken(jn);
  }
}, { contextual: !0 }), B0 = new je((n) => {
  for (let e = 0, t = 0; ; t++) {
    if (n.next < 0) {
      t && n.acceptToken(ua);
      break;
    }
    if (n.next == I0)
      e++;
    else if (n.next == kf && e >= 2) {
      t > 3 && n.acceptToken(ua, -2);
      break;
    } else
      e = 0;
    n.advance();
  }
});
function lo(n, e, t) {
  let i = 2 + n.length;
  return new je((r) => {
    for (let s = 0, o = 0, l = 0; ; l++) {
      if (r.next < 0) {
        l && r.acceptToken(e);
        break;
      }
      if (s == 0 && r.next == $f || s == 1 && r.next == wf || s >= 2 && s < i && r.next == n.charCodeAt(s - 2))
        s++, o++;
      else if ((s == 2 || s == i) && xf(r.next))
        o++;
      else if (s == i && r.next == kf) {
        l > o ? r.acceptToken(e, -o) : r.acceptToken(t, -(o - 2));
        break;
      } else if ((r.next == 10 || r.next == 13) && l) {
        r.acceptToken(e, 1);
        break;
      } else
        s = o = 0;
      r.advance();
    }
  });
}
const L0 = lo("script", S0, x0), U0 = lo("style", $0, k0), Y0 = lo("textarea", w0, T0), F0 = Ln({
  "Text RawText": p.content,
  "StartTag StartCloseTag SelfCloserEndTag EndTag SelfCloseEndTag": p.angleBracket,
  TagName: p.tagName,
  "MismatchedCloseTag/TagName": [p.tagName, p.invalid],
  AttributeName: p.attributeName,
  "AttributeValue UnquotedAttributeValue": p.attributeValue,
  Is: p.definitionOperator,
  "EntityReference CharacterReference": p.character,
  Comment: p.blockComment,
  ProcessingInst: p.processingInstruction,
  DoctypeDecl: p.documentMeta
}), H0 = Ht.deserialize({
  version: 14,
  states: ",xOVOxOOO!WQ!bO'#CoO!]Q!bO'#CyO!bQ!bO'#C|O!gQ!bO'#DPO!lQ!bO'#DRO!qOXO'#CnO!|OYO'#CnO#XO[O'#CnO$eOxO'#CnOOOW'#Cn'#CnO$lO!rO'#DSO$tQ!bO'#DUO$yQ!bO'#DVOOOW'#Dj'#DjOOOW'#DX'#DXQVOxOOO%OQ#tO,59ZO%WQ#tO,59eO%`Q#tO,59hO%hQ#tO,59kO%pQ#tO,59mOOOX'#D]'#D]O%xOXO'#CwO&TOXO,59YOOOY'#D^'#D^O&]OYO'#CzO&hOYO,59YOOO['#D_'#D_O&pO[O'#C}O&{O[O,59YOOOW'#D`'#D`O'TOxO,59YO'[Q!bO'#DQOOOW,59Y,59YOOO`'#Da'#DaO'aO!rO,59nOOOW,59n,59nO'iQ!bO,59pO'nQ!bO,59qOOOW-E7V-E7VO'sQ#tO'#CqOOQO'#DY'#DYO(OQ#tO1G.uOOOX1G.u1G.uO(WQ#tO1G/POOOY1G/P1G/PO(`Q#tO1G/SOOO[1G/S1G/SO(hQ#tO1G/VOOOW1G/V1G/VO(pQ#tO1G/XOOOW1G/X1G/XOOOX-E7Z-E7ZO(xQ!bO'#CxOOOW1G.t1G.tOOOY-E7[-E7[O(}Q!bO'#C{OOO[-E7]-E7]O)SQ!bO'#DOOOOW-E7^-E7^O)XQ!bO,59lOOO`-E7_-E7_OOOW1G/Y1G/YOOOW1G/[1G/[OOOW1G/]1G/]O)^Q&jO,59]OOQO-E7W-E7WOOOX7+$a7+$aOOOY7+$k7+$kOOO[7+$n7+$nOOOW7+$q7+$qOOOW7+$s7+$sO)iQ!bO,59dO)nQ!bO,59gO)sQ!bO,59jOOOW1G/W1G/WO)xO,UO'#CtO*ZO7[O'#CtOOQO1G.w1G.wOOOW1G/O1G/OOOOW1G/R1G/ROOOW1G/U1G/UOOOO'#DZ'#DZO*lO,UO,59`OOQO,59`,59`OOOO'#D['#D[O*}O7[O,59`OOOO-E7X-E7XOOQO1G.z1G.zOOOO-E7Y-E7Y",
  stateData: "+h~O!]OS~OSSOTPOUQOVROWTOY]OZ[O[^O^^O_^O`^Oa^Ow^Oz_O!cZO~OdaO~OdbO~OdcO~OddO~OdeO~O!VfOPkP!YkP~O!WiOQnP!YnP~O!XlORqP!YqP~OSSOTPOUQOVROWTOXqOY]OZ[O[^O^^O_^O`^Oa^Ow^O!cZO~O!YrO~P#dO!ZsO!duO~OdvO~OdwO~OfyOj|O~OfyOj!OO~OfyOj!QO~OfyOj!SO~OfyOj!UO~O!VfOPkX!YkX~OP!WO!Y!XO~O!WiOQnX!YnX~OQ!ZO!Y!XO~O!XlORqX!YqX~OR!]O!Y!XO~O!Y!XO~P#dOd!_O~O!ZsO!d!aO~Oj!bO~Oj!cO~Og!dOfeXjeX~OfyOj!fO~OfyOj!gO~OfyOj!hO~OfyOj!iO~OfyOj!jO~Od!kO~Od!lO~Od!mO~Oj!nO~Oi!qO!_!oO!a!pO~Oj!rO~Oj!sO~Oj!tO~O_!uO`!uOa!uO!_!wO!`!uO~O_!xO`!xOa!xO!a!wO!b!xO~O_!uO`!uOa!uO!_!{O!`!uO~O_!xO`!xOa!xO!a!{O!b!xO~O`_a!cwz!c~",
  goto: "%o!_PPPPPPPPPPPPPPPPPP!`!fP!lPP!xPP!{#O#R#X#[#_#e#h#k#q#w!`P!`!`P#}$T$k$q$w$}%T%Z%aPPPPPPPP%gX^OX`pXUOX`pezabcde{}!P!R!TR!q!dRhUR!XhXVOX`pRkVR!XkXWOX`pRnWR!XnXXOX`pQrXR!XpXYOX`pQ`ORx`Q{aQ}bQ!PcQ!RdQ!TeZ!e{}!P!R!TQ!v!oR!z!vQ!y!pR!|!yQgUR!VgQjVR!YjQmWR![mQpXR!^pQtZR!`tS_O`ToXp",
  nodeNames: "\u26A0 StartCloseTag StartCloseTag StartCloseTag StartTag StartTag StartTag StartTag StartTag StartCloseTag StartCloseTag StartCloseTag IncompleteCloseTag Document Text EntityReference CharacterReference InvalidEntity Element OpenTag TagName Attribute AttributeName Is AttributeValue UnquotedAttributeValue EndTag ScriptText CloseTag OpenTag StyleText CloseTag OpenTag TextareaText CloseTag OpenTag CloseTag SelfClosingTag Comment ProcessingInst MismatchedCloseTag CloseTag DoctypeDecl",
  maxTerm: 66,
  context: V0,
  nodeProps: [
    ["closedBy", -11, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, "EndTag", -4, 19, 29, 32, 35, "CloseTag"],
    ["group", -9, 12, 15, 16, 17, 18, 38, 39, 40, 41, "Entity", 14, "Entity TextContent", -3, 27, 30, 33, "TextContent Entity"],
    ["openedBy", 26, "StartTag StartCloseTag", -4, 28, 31, 34, 36, "OpenTag"]
  ],
  propSources: [F0],
  skippedNodes: [0],
  repeatNodeCount: 9,
  tokenData: "!#b!aR!WOX$kXY)sYZ)sZ]$k]^)s^p$kpq)sqr$krs*zsv$kvw+dwx2yx}$k}!O3f!O!P$k!P!Q7_!Q![$k![!]8u!]!^$k!^!_>b!_!`!!p!`!a8T!a!c$k!c!}8u!}#R$k#R#S8u#S#T$k#T#o8u#o$f$k$f$g&R$g%W$k%W%o8u%o%p$k%p&a8u&a&b$k&b1p8u1p4U$k4U4d8u4d4e$k4e$IS8u$IS$I`$k$I`$Ib8u$Ib$Kh$k$Kh%#t8u%#t&/x$k&/x&Et8u&Et&FV$k&FV;'S8u;'S;:j<t;:j?&r$k?&r?Ah8u?Ah?BY$k?BY?Mn8u?Mn~$k!Z$vc^PiW!``!bpOX$kXZ&RZ]$k]^&R^p$kpq&Rqr$krs&qsv$kvw)Rwx'rx!P$k!P!Q&R!Q!^$k!^!_(k!_!a&R!a$f$k$f$g&R$g~$k!R&[V^P!``!bpOr&Rrs&qsv&Rwx'rx!^&R!^!_(k!_~&Rq&xT^P!bpOv&qwx'Xx!^&q!^!_'g!_~&qP'^R^POv'Xw!^'X!_~'Xp'lQ!bpOv'gx~'ga'yU^P!``Or'rrs'Xsv'rw!^'r!^!_(]!_~'r`(bR!``Or(]sv(]w~(]!Q(rT!``!bpOr(krs'gsv(kwx(]x~(kW)WXiWOX)RZ])R^p)Rqr)Rsw)Rx!P)R!Q!^)R!a$f)R$g~)R!a*O^^P!``!bp!]^OX&RXY)sYZ)sZ]&R]^)s^p&Rpq)sqr&Rrs&qsv&Rwx'rx!^&R!^!_(k!_~&R!Z+TT!_h^P!bpOv&qwx'Xx!^&q!^!_'g!_~&q!Z+kbiWa!ROX,sXZ.QZ],s]^.Q^p,sqr,srs.Qst/]tw,swx.Qx!P,s!P!Q.Q!Q!],s!]!^)R!^!a.Q!a$f,s$f$g.Q$g~,s!Z,xbiWOX,sXZ.QZ],s]^.Q^p,sqr,srs.Qst)Rtw,swx.Qx!P,s!P!Q.Q!Q!],s!]!^.i!^!a.Q!a$f,s$f$g.Q$g~,s!R.TTOp.Qqs.Qt!].Q!]!^.d!^~.Q!R.iO_!R!Z.pXiW_!ROX)RZ])R^p)Rqr)Rsw)Rx!P)R!Q!^)R!a$f)R$g~)R!Z/baiWOX0gXZ1qZ]0g]^1q^p0gqr0grs1qsw0gwx1qx!P0g!P!Q1q!Q!]0g!]!^)R!^!a1q!a$f0g$f$g1q$g~0g!Z0laiWOX0gXZ1qZ]0g]^1q^p0gqr0grs1qsw0gwx1qx!P0g!P!Q1q!Q!]0g!]!^2V!^!a1q!a$f0g$f$g1q$g~0g!R1tSOp1qq!]1q!]!^2Q!^~1q!R2VO`!R!Z2^XiW`!ROX)RZ])R^p)Rqr)Rsw)Rx!P)R!Q!^)R!a$f)R$g~)R!Z3SU!ax^P!``Or'rrs'Xsv'rw!^'r!^!_(]!_~'r!]3qe^PiW!``!bpOX$kXZ&RZ]$k]^&R^p$kpq&Rqr$krs&qsv$kvw)Rwx'rx}$k}!O5S!O!P$k!P!Q&R!Q!^$k!^!_(k!_!a&R!a$f$k$f$g&R$g~$k!]5_d^PiW!``!bpOX$kXZ&RZ]$k]^&R^p$kpq&Rqr$krs&qsv$kvw)Rwx'rx!P$k!P!Q&R!Q!^$k!^!_(k!_!`&R!`!a6m!a$f$k$f$g&R$g~$k!T6xV^P!``!bp!dQOr&Rrs&qsv&Rwx'rx!^&R!^!_(k!_~&R!X7hX^P!``!bpOr&Rrs&qsv&Rwx'rx!^&R!^!_(k!_!`&R!`!a8T!a~&R!X8`VjU^P!``!bpOr&Rrs&qsv&Rwx'rx!^&R!^!_(k!_~&R!a9U!YfSdQ^PiW!``!bpOX$kXZ&RZ]$k]^&R^p$kpq&Rqr$krs&qsv$kvw)Rwx'rx}$k}!O8u!O!P8u!P!Q&R!Q![8u![!]8u!]!^$k!^!_(k!_!a&R!a!c$k!c!}8u!}#R$k#R#S8u#S#T$k#T#o8u#o$f$k$f$g&R$g$}$k$}%O8u%O%W$k%W%o8u%o%p$k%p&a8u&a&b$k&b1p8u1p4U8u4U4d8u4d4e$k4e$IS8u$IS$I`$k$I`$Ib8u$Ib$Je$k$Je$Jg8u$Jg$Kh$k$Kh%#t8u%#t&/x$k&/x&Et8u&Et&FV$k&FV;'S8u;'S;:j<t;:j?&r$k?&r?Ah8u?Ah?BY$k?BY?Mn8u?Mn~$k!a=Pe^PiW!``!bpOX$kXZ&RZ]$k]^&R^p$kpq&Rqr$krs&qsv$kvw)Rwx'rx!P$k!P!Q&R!Q!^$k!^!_(k!_!a&R!a$f$k$f$g&R$g;=`$k;=`<%l8u<%l~$k!R>iW!``!bpOq(kqr?Rrs'gsv(kwx(]x!a(k!a!bKj!b~(k!R?YZ!``!bpOr(krs'gsv(kwx(]x}(k}!O?{!O!f(k!f!gAR!g#W(k#W#XGz#X~(k!R@SV!``!bpOr(krs'gsv(kwx(]x}(k}!O@i!O~(k!R@rT!``!bp!cPOr(krs'gsv(kwx(]x~(k!RAYV!``!bpOr(krs'gsv(kwx(]x!q(k!q!rAo!r~(k!RAvV!``!bpOr(krs'gsv(kwx(]x!e(k!e!fB]!f~(k!RBdV!``!bpOr(krs'gsv(kwx(]x!v(k!v!wBy!w~(k!RCQV!``!bpOr(krs'gsv(kwx(]x!{(k!{!|Cg!|~(k!RCnV!``!bpOr(krs'gsv(kwx(]x!r(k!r!sDT!s~(k!RD[V!``!bpOr(krs'gsv(kwx(]x!g(k!g!hDq!h~(k!RDxW!``!bpOrDqrsEbsvDqvwEvwxFfx!`Dq!`!aGb!a~DqqEgT!bpOvEbvxEvx!`Eb!`!aFX!a~EbPEyRO!`Ev!`!aFS!a~EvPFXOzPqF`Q!bpzPOv'gx~'gaFkV!``OrFfrsEvsvFfvwEvw!`Ff!`!aGQ!a~FfaGXR!``zPOr(]sv(]w~(]!RGkT!``!bpzPOr(krs'gsv(kwx(]x~(k!RHRV!``!bpOr(krs'gsv(kwx(]x#c(k#c#dHh#d~(k!RHoV!``!bpOr(krs'gsv(kwx(]x#V(k#V#WIU#W~(k!RI]V!``!bpOr(krs'gsv(kwx(]x#h(k#h#iIr#i~(k!RIyV!``!bpOr(krs'gsv(kwx(]x#m(k#m#nJ`#n~(k!RJgV!``!bpOr(krs'gsv(kwx(]x#d(k#d#eJ|#e~(k!RKTV!``!bpOr(krs'gsv(kwx(]x#X(k#X#YDq#Y~(k!RKqW!``!bpOrKjrsLZsvKjvwLowxNPx!aKj!a!b! g!b~KjqL`T!bpOvLZvxLox!aLZ!a!bM^!b~LZPLrRO!aLo!a!bL{!b~LoPMORO!`Lo!`!aMX!a~LoPM^OwPqMcT!bpOvLZvxLox!`LZ!`!aMr!a~LZqMyQ!bpwPOv'gx~'gaNUV!``OrNPrsLosvNPvwLow!aNP!a!bNk!b~NPaNpV!``OrNPrsLosvNPvwLow!`NP!`!a! V!a~NPa! ^R!``wPOr(]sv(]w~(]!R! nW!``!bpOrKjrsLZsvKjvwLowxNPx!`Kj!`!a!!W!a~Kj!R!!aT!``!bpwPOr(krs'gsv(kwx(]x~(k!V!!{VgS^P!``!bpOr&Rrs&qsv&Rwx'rx!^&R!^!_(k!_~&R",
  tokenizers: [L0, U0, Y0, N0, B0, 0, 1, 2, 3, 4, 5],
  topRules: { Document: [0, 13] },
  dialects: { noMatch: 0 },
  tokenPrec: 476
});
function J0(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let i of n.firstChild.getChildren("Attribute")) {
    let r = i.getChild("AttributeName"), s = i.getChild("AttributeValue") || i.getChild("UnquotedAttributeValue");
    r && (t[e.read(r.from, r.to)] = s ? s.name == "AttributeValue" ? e.read(s.from + 1, s.to - 1) : e.read(s.from, s.to) : "");
  }
  return t;
}
function Zr(n, e, t) {
  let i;
  for (let r of t)
    if (!r.attrs || r.attrs(i || (i = J0(n.node.parent, e))))
      return { parser: r.parser };
  return null;
}
function K0(n) {
  let e = [], t = [], i = [];
  for (let r of n) {
    let s = r.tag == "script" ? e : r.tag == "style" ? t : r.tag == "textarea" ? i : null;
    if (!s)
      throw new RangeError("Only script, style, and textarea tags can host nested parsers");
    s.push(r);
  }
  return oO((r, s) => {
    let o = r.type.id;
    return o == W0 ? Zr(r, s, e) : o == X0 ? Zr(r, s, t) : o == Z0 ? Zr(r, s, i) : null;
  });
}
const eQ = 93, Qa = 1, tQ = 94, iQ = 95, ba = 2, Tf = [
  9,
  10,
  11,
  12,
  13,
  32,
  133,
  160,
  5760,
  8192,
  8193,
  8194,
  8195,
  8196,
  8197,
  8198,
  8199,
  8200,
  8201,
  8202,
  8232,
  8233,
  8239,
  8287,
  12288
], nQ = 58, rQ = 40, vf = 95, sQ = 91, cn = 45, oQ = 46, lQ = 35, aQ = 37;
function zn(n) {
  return n >= 65 && n <= 90 || n >= 97 && n <= 122 || n >= 161;
}
function hQ(n) {
  return n >= 48 && n <= 57;
}
const cQ = new je((n, e) => {
  for (let t = !1, i = 0, r = 0; ; r++) {
    let { next: s } = n;
    if (zn(s) || s == cn || s == vf || t && hQ(s))
      !t && (s != cn || r > 0) && (t = !0), i === r && s == cn && i++, n.advance();
    else {
      t && n.acceptToken(s == rQ ? tQ : i == 2 && e.canShift(ba) ? ba : iQ);
      break;
    }
  }
}), fQ = new je((n) => {
  if (Tf.includes(n.peek(-1))) {
    let { next: e } = n;
    (zn(e) || e == vf || e == lQ || e == oQ || e == sQ || e == nQ || e == cn) && n.acceptToken(eQ);
  }
}), uQ = new je((n) => {
  if (!Tf.includes(n.peek(-1))) {
    let { next: e } = n;
    if (e == aQ && (n.advance(), n.acceptToken(Qa)), zn(e)) {
      do
        n.advance();
      while (zn(n.next));
      n.acceptToken(Qa);
    }
  }
}), dQ = Ln({
  "import charset namespace keyframes": p.definitionKeyword,
  "media supports": p.controlKeyword,
  "from to selector": p.keyword,
  NamespaceName: p.namespace,
  KeyframeName: p.labelName,
  TagName: p.tagName,
  ClassName: p.className,
  PseudoClassName: p.constant(p.className),
  IdName: p.labelName,
  "FeatureName PropertyName": p.propertyName,
  AttributeName: p.attributeName,
  NumberLiteral: p.number,
  KeywordQuery: p.keyword,
  UnaryQueryOp: p.operatorKeyword,
  "CallTag ValueName": p.atom,
  VariableName: p.variableName,
  Callee: p.operatorKeyword,
  Unit: p.unit,
  "UniversalSelector NestingSelector": p.definitionOperator,
  AtKeyword: p.keyword,
  MatchOp: p.compareOperator,
  "ChildOp SiblingOp, LogicOp": p.logicOperator,
  BinOp: p.arithmeticOperator,
  Important: p.modifier,
  Comment: p.blockComment,
  ParenthesizedContent: p.special(p.name),
  ColorLiteral: p.color,
  StringLiteral: p.string,
  ":": p.punctuation,
  "PseudoOp #": p.derefOperator,
  "; ,": p.separator,
  "( )": p.paren,
  "[ ]": p.squareBracket,
  "{ }": p.brace
}), OQ = { __proto__: null, lang: 32, "nth-child": 32, "nth-last-child": 32, "nth-of-type": 32, dir: 32, url: 60, "url-prefix": 60, domain: 60, regexp: 60, selector: 134 }, pQ = { __proto__: null, "@import": 114, "@media": 138, "@charset": 142, "@namespace": 146, "@keyframes": 152, "@supports": 164 }, gQ = { __proto__: null, not: 128, only: 128, from: 158, to: 160 }, mQ = Ht.deserialize({
  version: 14,
  states: "7WOYQ[OOOOQP'#Cd'#CdOOQP'#Cc'#CcO!ZQ[O'#CfO!}QXO'#CaO#UQ[O'#ChO#aQ[O'#DPO#fQ[O'#DTOOQP'#Ec'#EcO#kQdO'#DeO$VQ[O'#DrO#kQdO'#DtO$hQ[O'#DvO$sQ[O'#DyO$xQ[O'#EPO%WQ[O'#EROOQS'#Eb'#EbOOQS'#ES'#ESQYQ[OOOOQP'#Cg'#CgOOQP,59Q,59QO!ZQ[O,59QO%_Q[O'#EVO%yQWO,58{O&RQ[O,59SO#aQ[O,59kO#fQ[O,59oO%_Q[O,59sO%_Q[O,59uO%_Q[O,59vO'bQ[O'#D`OOQS,58{,58{OOQP'#Ck'#CkOOQO'#C}'#C}OOQP,59S,59SO'iQWO,59SO'nQWO,59SOOQP'#DR'#DROOQP,59k,59kOOQO'#DV'#DVO'sQ`O,59oOOQS'#Cp'#CpO#kQdO'#CqO'{QvO'#CsO)VQtO,5:POOQO'#Cx'#CxO'iQWO'#CwO)kQWO'#CyOOQS'#Ef'#EfOOQO'#Dh'#DhO)pQ[O'#DoO*OQWO'#EiO$xQ[O'#DmO*^QWO'#DpOOQO'#Ej'#EjO%|QWO,5:^O*cQpO,5:`OOQS'#Dx'#DxO*kQWO,5:bO*pQ[O,5:bOOQO'#D{'#D{O*xQWO,5:eO*}QWO,5:kO+VQWO,5:mOOQS-E8Q-E8QOOQP1G.l1G.lO+yQXO,5:qOOQO-E8T-E8TOOQS1G.g1G.gOOQP1G.n1G.nO'iQWO1G.nO'nQWO1G.nOOQP1G/V1G/VO,WQ`O1G/ZO,qQXO1G/_O-XQXO1G/aO-oQXO1G/bO.VQXO'#CdO.zQWO'#DaOOQS,59z,59zO/PQWO,59zO/XQ[O,59zO/`QdO'#CoO/gQ[O'#DOOOQP1G/Z1G/ZO#kQdO1G/ZO/nQpO,59]OOQS,59_,59_O#kQdO,59aO/vQWO1G/kOOQS,59c,59cO/{Q!bO,59eO0TQWO'#DhO0`QWO,5:TO0eQWO,5:ZO$xQ[O,5:VO$xQ[O'#EYO0mQWO,5;TO0xQWO,5:XO%_Q[O,5:[OOQS1G/x1G/xOOQS1G/z1G/zOOQS1G/|1G/|O1ZQWO1G/|O1`QdO'#D|OOQS1G0P1G0POOQS1G0V1G0VOOQS1G0X1G0XOOQP7+$Y7+$YOOQP7+$u7+$uO#kQdO7+$uO#kQdO,59{O1nQ[O'#EXO1xQWO1G/fOOQS1G/f1G/fO1xQWO1G/fO2QQtO'#ETO2uQdO'#EeO3PQWO,59ZO3UQXO'#EhO3]QWO,59jO3bQpO7+$uOOQS1G.w1G.wOOQS1G.{1G.{OOQS7+%V7+%VO3jQWO1G/PO#kQdO1G/oOOQO1G/u1G/uOOQO1G/q1G/qO3oQWO,5:tOOQO-E8W-E8WO3}QXO1G/vOOQS7+%h7+%hO4UQYO'#CsO%|QWO'#EZO4^QdO,5:hOOQS,5:h,5:hO4lQpO<<HaO4tQtO1G/gOOQO,5:s,5:sO5XQ[O,5:sOOQO-E8V-E8VOOQS7+%Q7+%QO5cQWO7+%QOOQS-E8R-E8RO#kQdO'#EUO5kQWO,5;POOQT1G.u1G.uO5sQWO,5;SOOQP1G/U1G/UOOQP<<Ha<<HaOOQS7+$k7+$kO5{QdO7+%ZOOQO7+%b7+%bOOQS,5:u,5:uOOQS-E8X-E8XOOQS1G0S1G0SOOQPAN={AN={O6SQtO'#EWO#kQdO'#EWO6}QdO7+%ROOQO7+%R7+%ROOQO1G0_1G0_OOQS<<Hl<<HlO7_QdO,5:pOOQO-E8S-E8SOOQO<<Hu<<HuO7iQtO,5:rOOQS-E8U-E8UOOQO<<Hm<<Hm",
  stateData: "8j~O#TOSROS~OUWOXWO]TO^TOtUOxVO!Y_O!ZXO!gYO!iZO!k[O!n]O!t^O#RPO#WRO~O#RcO~O]hO^hOpfOtiOxjO|kO!PmO#PlO#WeO~O!RnO~P!`O`sO#QqO#RpO~O#RuO~O#RwO~OQ!QObzOf!QOh!QOn!PO#Q}O#RyO#Z{O~Ob!SO!b!UO!e!VO#R!RO!R#]P~Oh![On!PO#R!ZO~O#R!^O~Ob!SO!b!UO!e!VO#R!RO~O!W#]P~P$VOUWOXWO]TO^TOtUOxVO#RPO#WRO~OpfO!RnO~O`!hO#QqO#RpO~OQ!pOUWOXWO]TO^TOtUOxVO!Y_O!ZXO!gYO!iZO!k[O!n]O!t^O#R!oO#WRO~O!Q!qO~P&^Ob!tO~Ob!uO~Ov!vOz!wO~OP!yObgXjgX!WgX!bgX!egX#RgXagXQgXfgXhgXngXpgX#QgX#ZgXvgX!QgX!VgX~Ob!SOj!zO!b!UO!e!VO#R!RO!W#]P~Ob!}O~Ob!SO!b!UO!e!VO#R#OO~Op#SO!`#RO!R#]X!W#]X~Ob#VO~Oj!zO!W#XO~O!W#YO~Oh#ZOn!PO~O!R#[O~O!RnO!`#RO~O!RnO!W#_O~O]hO^hOtiOxjO|kO!PmO#PlO#WeO~Op!ya!R!yaa!ya~P+_Ov#aOz#bO~O]hO^hOtiOxjO#WeO~Op{i|{i!P{i!R{i#P{ia{i~P,`Op}i|}i!P}i!R}i#P}ia}i~P,`Op!Oi|!Oi!P!Oi!R!Oi#P!Oia!Oi~P,`O]WX]!UX^WXpWXtWXxWX|WX!PWX!RWX#PWX#WWX~O]#cO~O!Q#fO!W#dO~O!Q#fO~P&^Oa#XP~P#kOa#[P~P%_Oa#nOj!zO~O!W#pO~Oh#qOo#qO~O]!^Xa![X!`![X~O]#rO~Oa#sO!`#RO~Op#SO!R#]a!W#]a~O!`#ROp!aa!R!aa!W!aaa!aa~O!W#xO~O!Q#|O!q#zO!r#zO#Z#yO~O!Q!{X!W!{X~P&^O!Q$SO!W#dO~Oj!zOQ!wXa!wXb!wXf!wXh!wXn!wXp!wX#Q!wX#R!wX#Z!wX~Op$VOa#XX~P#kOa$XO~Oa#[X~P!`Oa$ZO~Oj!zOv$[O~Oa$]O~O!`#ROp!|a!R!|a!W!|a~Oa$_O~P+_OP!yO!RgX~O!Q$bO!q#zO!r#zO#Z#yO~Oj!zOv$cO~Oj!zOp$eO!V$gO!Q!Ti!W!Ti~P#kO!Q!{a!W!{a~P&^O!Q$iO!W#dO~Op$VOa#Xa~OpfOa#[a~Oa$lO~P#kOj!zOQ!zXb!zXf!zXh!zXn!zXp!zX!Q!zX!V!zX!W!zX#Q!zX#R!zX#Z!zX~Op$eO!V$oO!Q!Tq!W!Tq~P#kOa!xap!xa~P#kOj!zOQ!zab!zaf!zah!zan!zap!za!Q!za!V!za!W!za#Q!za#R!za#Z!za~Oo#Zj!Pj~",
  goto: ",O#_PPPPP#`P#h#vP#h$U#hPP$[PPP$b$k$kP$}P$kP$k%e%wPPP&a&g#hP&mP#hP&sP#hP#h#hPPP&y']'iPP#`PP'o'o'y'oP'oP'o'oP#`P#`P#`P'|#`P(P(SPP#`P#`(V(e(s(y)T)Z)e)kPPPPPP)q)yP*e*hP+^+a+j]`Obn!s#d$QiWObfklmn!s!u#V#d$QiQObfklmn!s!u#V#d$QQdRR!ceQrTR!ghQ!gsQ!|!OR#`!hq!QXZz!t!w!z#b#c#i#r$O$V$^$e$f$jp!QXZz!t!w!z#b#c#i#r$O$V$^$e$f$jT#z#[#{q!OXZz!t!w!z#b#c#i#r$O$V$^$e$f$jp!QXZz!t!w!z#b#c#i#r$O$V$^$e$f$jQ![[R#Z!]QtTR!ihQ!gtR#`!iQvUR!jiQxVR!kjQoSQ!fgQ#W!XQ#^!`Q#_!aR$`#zQ!rnQ#g!sQ$P#dR$h$QX!pn!s#d$Qa!WY^_|!S!U#R#SR#P!SR!][R!_]R#]!_QbOU!bb!s$QQ!snR$Q#dQ#i!tU$U#i$^$jQ$^#rR$j$VQ$W#iR$k$WQgSS!eg$YR$Y#kQ$f$OR$n$fQ#e!rS$R#e$TR$T#gQ#T!TR#v#TQ#{#[R$a#{]aObn!s#d$Q[SObn!s#d$QQ!dfQ!lkQ!mlQ!nmQ#k!uR#w#VR#j!tQ|XQ!YZQ!xz[#h!t#i#r$V$^$jQ#m!wQ#o!zQ#}#bQ$O#cS$d$O$fR$m$eR#l!uQ!XYQ!a_R!{|U!TY_|Q!`^Q#Q!SQ#U!UQ#t#RR#u#S",
  nodeNames: "\u26A0 Unit VariableName Comment StyleSheet RuleSet UniversalSelector TagSelector TagName NestingSelector ClassSelector ClassName PseudoClassSelector : :: PseudoClassName PseudoClassName ) ( ArgList ValueName ParenthesizedValue ColorLiteral NumberLiteral StringLiteral BinaryExpression BinOp CallExpression Callee CallLiteral CallTag ParenthesizedContent , PseudoClassName ArgList IdSelector # IdName ] AttributeSelector [ AttributeName MatchOp ChildSelector ChildOp DescendantSelector SiblingSelector SiblingOp } { Block Declaration PropertyName Important ; ImportStatement AtKeyword import KeywordQuery FeatureQuery FeatureName BinaryQuery LogicOp UnaryQuery UnaryQueryOp ParenthesizedQuery SelectorQuery selector MediaStatement media CharsetStatement charset NamespaceStatement namespace NamespaceName KeyframesStatement keyframes KeyframeName KeyframeList from to SupportsStatement supports AtRule",
  maxTerm: 106,
  nodeProps: [
    ["openedBy", 17, "(", 48, "{"],
    ["closedBy", 18, ")", 49, "}"]
  ],
  propSources: [dQ],
  skippedNodes: [0, 3],
  repeatNodeCount: 8,
  tokenData: "Ay~R![OX$wX^%]^p$wpq%]qr(crs+}st,otu2Uuv$wvw2rwx2}xy3jyz3uz{3z{|4_|}8U}!O8a!O!P8x!P!Q9Z!Q![;e![!]<Y!]!^<x!^!_$w!_!`=T!`!a=`!a!b$w!b!c>O!c!}$w!}#O?[#O#P$w#P#Q?g#Q#R2U#R#T$w#T#U?r#U#c$w#c#d@q#d#o$w#o#pAQ#p#q2U#q#rA]#r#sAh#s#y$w#y#z%]#z$f$w$f$g%]$g#BY$w#BY#BZ%]#BZ$IS$w$IS$I_%]$I_$I|$w$I|$JO%]$JO$JT$w$JT$JU%]$JU$KV$w$KV$KW%]$KW&FU$w&FU&FV%]&FV~$wW$zQOy%Qz~%QW%VQoWOy%Qz~%Q~%bf#T~OX%QX^&v^p%Qpq&vqy%Qz#y%Q#y#z&v#z$f%Q$f$g&v$g#BY%Q#BY#BZ&v#BZ$IS%Q$IS$I_&v$I_$I|%Q$I|$JO&v$JO$JT%Q$JT$JU&v$JU$KV%Q$KV$KW&v$KW&FU%Q&FU&FV&v&FV~%Q~&}f#T~oWOX%QX^&v^p%Qpq&vqy%Qz#y%Q#y#z&v#z$f%Q$f$g&v$g#BY%Q#BY#BZ&v#BZ$IS%Q$IS$I_&v$I_$I|%Q$I|$JO&v$JO$JT%Q$JT$JU&v$JU$KV%Q$KV$KW&v$KW&FU%Q&FU&FV&v&FV~%Q^(fSOy%Qz#]%Q#]#^(r#^~%Q^(wSoWOy%Qz#a%Q#a#b)T#b~%Q^)YSoWOy%Qz#d%Q#d#e)f#e~%Q^)kSoWOy%Qz#c%Q#c#d)w#d~%Q^)|SoWOy%Qz#f%Q#f#g*Y#g~%Q^*_SoWOy%Qz#h%Q#h#i*k#i~%Q^*pSoWOy%Qz#T%Q#T#U*|#U~%Q^+RSoWOy%Qz#b%Q#b#c+_#c~%Q^+dSoWOy%Qz#h%Q#h#i+p#i~%Q^+wQ!VUoWOy%Qz~%Q~,QUOY+}Zr+}rs,ds#O+}#O#P,i#P~+}~,iOh~~,lPO~+}_,tWtPOy%Qz!Q%Q!Q![-^![!c%Q!c!i-^!i#T%Q#T#Z-^#Z~%Q^-cWoWOy%Qz!Q%Q!Q![-{![!c%Q!c!i-{!i#T%Q#T#Z-{#Z~%Q^.QWoWOy%Qz!Q%Q!Q![.j![!c%Q!c!i.j!i#T%Q#T#Z.j#Z~%Q^.qWfUoWOy%Qz!Q%Q!Q![/Z![!c%Q!c!i/Z!i#T%Q#T#Z/Z#Z~%Q^/bWfUoWOy%Qz!Q%Q!Q![/z![!c%Q!c!i/z!i#T%Q#T#Z/z#Z~%Q^0PWoWOy%Qz!Q%Q!Q![0i![!c%Q!c!i0i!i#T%Q#T#Z0i#Z~%Q^0pWfUoWOy%Qz!Q%Q!Q![1Y![!c%Q!c!i1Y!i#T%Q#T#Z1Y#Z~%Q^1_WoWOy%Qz!Q%Q!Q![1w![!c%Q!c!i1w!i#T%Q#T#Z1w#Z~%Q^2OQfUoWOy%Qz~%QY2XSOy%Qz!_%Q!_!`2e!`~%QY2lQzQoWOy%Qz~%QX2wQXPOy%Qz~%Q~3QUOY2}Zw2}wx,dx#O2}#O#P3d#P~2}~3gPO~2}_3oQbVOy%Qz~%Q~3zOa~_4RSUPjSOy%Qz!_%Q!_!`2e!`~%Q_4fUjS!PPOy%Qz!O%Q!O!P4x!P!Q%Q!Q![7_![~%Q^4}SoWOy%Qz!Q%Q!Q![5Z![~%Q^5bWoW#ZUOy%Qz!Q%Q!Q![5Z![!g%Q!g!h5z!h#X%Q#X#Y5z#Y~%Q^6PWoWOy%Qz{%Q{|6i|}%Q}!O6i!O!Q%Q!Q![6z![~%Q^6nSoWOy%Qz!Q%Q!Q![6z![~%Q^7RSoW#ZUOy%Qz!Q%Q!Q![6z![~%Q^7fYoW#ZUOy%Qz!O%Q!O!P5Z!P!Q%Q!Q![7_![!g%Q!g!h5z!h#X%Q#X#Y5z#Y~%Q_8ZQpVOy%Qz~%Q^8fUjSOy%Qz!O%Q!O!P4x!P!Q%Q!Q![7_![~%Q_8}S#WPOy%Qz!Q%Q!Q![5Z![~%Q~9`RjSOy%Qz{9i{~%Q~9nSoWOy9iyz9zz{:o{~9i~9}ROz9zz{:W{~9z~:ZTOz9zz{:W{!P9z!P!Q:j!Q~9z~:oOR~~:tUoWOy9iyz9zz{:o{!P9i!P!Q;W!Q~9i~;_QoWR~Oy%Qz~%Q^;jY#ZUOy%Qz!O%Q!O!P5Z!P!Q%Q!Q![7_![!g%Q!g!h5z!h#X%Q#X#Y5z#Y~%QX<_S]POy%Qz![%Q![!]<k!]~%QX<rQ^PoWOy%Qz~%Q_<}Q!WVOy%Qz~%QY=YQzQOy%Qz~%QX=eS|POy%Qz!`%Q!`!a=q!a~%QX=xQ|PoWOy%Qz~%QX>RUOy%Qz!c%Q!c!}>e!}#T%Q#T#o>e#o~%QX>lY!YPoWOy%Qz}%Q}!O>e!O!Q%Q!Q![>e![!c%Q!c!}>e!}#T%Q#T#o>e#o~%QX?aQxPOy%Qz~%Q^?lQvUOy%Qz~%QX?uSOy%Qz#b%Q#b#c@R#c~%QX@WSoWOy%Qz#W%Q#W#X@d#X~%QX@kQ!`PoWOy%Qz~%QX@tSOy%Qz#f%Q#f#g@d#g~%QXAVQ!RPOy%Qz~%Q_AbQ!QVOy%Qz~%QZAmS!PPOy%Qz!_%Q!_!`2e!`~%Q",
  tokenizers: [fQ, uQ, cQ, 0, 1, 2, 3],
  topRules: { StyleSheet: [0, 4] },
  specialized: [{ term: 94, get: (n) => OQ[n] || -1 }, { term: 56, get: (n) => pQ[n] || -1 }, { term: 95, get: (n) => gQ[n] || -1 }],
  tokenPrec: 1078
});
let Dr = null;
function Mr() {
  if (!Dr && typeof document == "object" && document.body) {
    let n = [];
    for (let e in document.body.style)
      /[A-Z]|^-|^(item|length)$/.test(e) || n.push(e);
    Dr = n.sort().map((e) => ({ type: "property", label: e }));
  }
  return Dr || [];
}
const ya = /* @__PURE__ */ [
  "active",
  "after",
  "before",
  "checked",
  "default",
  "disabled",
  "empty",
  "enabled",
  "first-child",
  "first-letter",
  "first-line",
  "first-of-type",
  "focus",
  "hover",
  "in-range",
  "indeterminate",
  "invalid",
  "lang",
  "last-child",
  "last-of-type",
  "link",
  "not",
  "nth-child",
  "nth-last-child",
  "nth-last-of-type",
  "nth-of-type",
  "only-of-type",
  "only-child",
  "optional",
  "out-of-range",
  "placeholder",
  "read-only",
  "read-write",
  "required",
  "root",
  "selection",
  "target",
  "valid",
  "visited"
].map((n) => ({ type: "class", label: n })), Sa = /* @__PURE__ */ [
  "above",
  "absolute",
  "activeborder",
  "additive",
  "activecaption",
  "after-white-space",
  "ahead",
  "alias",
  "all",
  "all-scroll",
  "alphabetic",
  "alternate",
  "always",
  "antialiased",
  "appworkspace",
  "asterisks",
  "attr",
  "auto",
  "auto-flow",
  "avoid",
  "avoid-column",
  "avoid-page",
  "avoid-region",
  "axis-pan",
  "background",
  "backwards",
  "baseline",
  "below",
  "bidi-override",
  "blink",
  "block",
  "block-axis",
  "bold",
  "bolder",
  "border",
  "border-box",
  "both",
  "bottom",
  "break",
  "break-all",
  "break-word",
  "bullets",
  "button",
  "button-bevel",
  "buttonface",
  "buttonhighlight",
  "buttonshadow",
  "buttontext",
  "calc",
  "capitalize",
  "caps-lock-indicator",
  "caption",
  "captiontext",
  "caret",
  "cell",
  "center",
  "checkbox",
  "circle",
  "cjk-decimal",
  "clear",
  "clip",
  "close-quote",
  "col-resize",
  "collapse",
  "color",
  "color-burn",
  "color-dodge",
  "column",
  "column-reverse",
  "compact",
  "condensed",
  "contain",
  "content",
  "contents",
  "content-box",
  "context-menu",
  "continuous",
  "copy",
  "counter",
  "counters",
  "cover",
  "crop",
  "cross",
  "crosshair",
  "currentcolor",
  "cursive",
  "cyclic",
  "darken",
  "dashed",
  "decimal",
  "decimal-leading-zero",
  "default",
  "default-button",
  "dense",
  "destination-atop",
  "destination-in",
  "destination-out",
  "destination-over",
  "difference",
  "disc",
  "discard",
  "disclosure-closed",
  "disclosure-open",
  "document",
  "dot-dash",
  "dot-dot-dash",
  "dotted",
  "double",
  "down",
  "e-resize",
  "ease",
  "ease-in",
  "ease-in-out",
  "ease-out",
  "element",
  "ellipse",
  "ellipsis",
  "embed",
  "end",
  "ethiopic-abegede-gez",
  "ethiopic-halehame-aa-er",
  "ethiopic-halehame-gez",
  "ew-resize",
  "exclusion",
  "expanded",
  "extends",
  "extra-condensed",
  "extra-expanded",
  "fantasy",
  "fast",
  "fill",
  "fill-box",
  "fixed",
  "flat",
  "flex",
  "flex-end",
  "flex-start",
  "footnotes",
  "forwards",
  "from",
  "geometricPrecision",
  "graytext",
  "grid",
  "groove",
  "hand",
  "hard-light",
  "help",
  "hidden",
  "hide",
  "higher",
  "highlight",
  "highlighttext",
  "horizontal",
  "hsl",
  "hsla",
  "hue",
  "icon",
  "ignore",
  "inactiveborder",
  "inactivecaption",
  "inactivecaptiontext",
  "infinite",
  "infobackground",
  "infotext",
  "inherit",
  "initial",
  "inline",
  "inline-axis",
  "inline-block",
  "inline-flex",
  "inline-grid",
  "inline-table",
  "inset",
  "inside",
  "intrinsic",
  "invert",
  "italic",
  "justify",
  "keep-all",
  "landscape",
  "large",
  "larger",
  "left",
  "level",
  "lighter",
  "lighten",
  "line-through",
  "linear",
  "linear-gradient",
  "lines",
  "list-item",
  "listbox",
  "listitem",
  "local",
  "logical",
  "loud",
  "lower",
  "lower-hexadecimal",
  "lower-latin",
  "lower-norwegian",
  "lowercase",
  "ltr",
  "luminosity",
  "manipulation",
  "match",
  "matrix",
  "matrix3d",
  "medium",
  "menu",
  "menutext",
  "message-box",
  "middle",
  "min-intrinsic",
  "mix",
  "monospace",
  "move",
  "multiple",
  "multiple_mask_images",
  "multiply",
  "n-resize",
  "narrower",
  "ne-resize",
  "nesw-resize",
  "no-close-quote",
  "no-drop",
  "no-open-quote",
  "no-repeat",
  "none",
  "normal",
  "not-allowed",
  "nowrap",
  "ns-resize",
  "numbers",
  "numeric",
  "nw-resize",
  "nwse-resize",
  "oblique",
  "opacity",
  "open-quote",
  "optimizeLegibility",
  "optimizeSpeed",
  "outset",
  "outside",
  "outside-shape",
  "overlay",
  "overline",
  "padding",
  "padding-box",
  "painted",
  "page",
  "paused",
  "perspective",
  "pinch-zoom",
  "plus-darker",
  "plus-lighter",
  "pointer",
  "polygon",
  "portrait",
  "pre",
  "pre-line",
  "pre-wrap",
  "preserve-3d",
  "progress",
  "push-button",
  "radial-gradient",
  "radio",
  "read-only",
  "read-write",
  "read-write-plaintext-only",
  "rectangle",
  "region",
  "relative",
  "repeat",
  "repeating-linear-gradient",
  "repeating-radial-gradient",
  "repeat-x",
  "repeat-y",
  "reset",
  "reverse",
  "rgb",
  "rgba",
  "ridge",
  "right",
  "rotate",
  "rotate3d",
  "rotateX",
  "rotateY",
  "rotateZ",
  "round",
  "row",
  "row-resize",
  "row-reverse",
  "rtl",
  "run-in",
  "running",
  "s-resize",
  "sans-serif",
  "saturation",
  "scale",
  "scale3d",
  "scaleX",
  "scaleY",
  "scaleZ",
  "screen",
  "scroll",
  "scrollbar",
  "scroll-position",
  "se-resize",
  "self-start",
  "self-end",
  "semi-condensed",
  "semi-expanded",
  "separate",
  "serif",
  "show",
  "single",
  "skew",
  "skewX",
  "skewY",
  "skip-white-space",
  "slide",
  "slider-horizontal",
  "slider-vertical",
  "sliderthumb-horizontal",
  "sliderthumb-vertical",
  "slow",
  "small",
  "small-caps",
  "small-caption",
  "smaller",
  "soft-light",
  "solid",
  "source-atop",
  "source-in",
  "source-out",
  "source-over",
  "space",
  "space-around",
  "space-between",
  "space-evenly",
  "spell-out",
  "square",
  "start",
  "static",
  "status-bar",
  "stretch",
  "stroke",
  "stroke-box",
  "sub",
  "subpixel-antialiased",
  "svg_masks",
  "super",
  "sw-resize",
  "symbolic",
  "symbols",
  "system-ui",
  "table",
  "table-caption",
  "table-cell",
  "table-column",
  "table-column-group",
  "table-footer-group",
  "table-header-group",
  "table-row",
  "table-row-group",
  "text",
  "text-bottom",
  "text-top",
  "textarea",
  "textfield",
  "thick",
  "thin",
  "threeddarkshadow",
  "threedface",
  "threedhighlight",
  "threedlightshadow",
  "threedshadow",
  "to",
  "top",
  "transform",
  "translate",
  "translate3d",
  "translateX",
  "translateY",
  "translateZ",
  "transparent",
  "ultra-condensed",
  "ultra-expanded",
  "underline",
  "unidirectional-pan",
  "unset",
  "up",
  "upper-latin",
  "uppercase",
  "url",
  "var",
  "vertical",
  "vertical-text",
  "view-box",
  "visible",
  "visibleFill",
  "visiblePainted",
  "visibleStroke",
  "visual",
  "w-resize",
  "wait",
  "wave",
  "wider",
  "window",
  "windowframe",
  "windowtext",
  "words",
  "wrap",
  "wrap-reverse",
  "x-large",
  "x-small",
  "xor",
  "xx-large",
  "xx-small"
].map((n) => ({ type: "keyword", label: n })).concat(/* @__PURE__ */ [
  "aliceblue",
  "antiquewhite",
  "aqua",
  "aquamarine",
  "azure",
  "beige",
  "bisque",
  "black",
  "blanchedalmond",
  "blue",
  "blueviolet",
  "brown",
  "burlywood",
  "cadetblue",
  "chartreuse",
  "chocolate",
  "coral",
  "cornflowerblue",
  "cornsilk",
  "crimson",
  "cyan",
  "darkblue",
  "darkcyan",
  "darkgoldenrod",
  "darkgray",
  "darkgreen",
  "darkkhaki",
  "darkmagenta",
  "darkolivegreen",
  "darkorange",
  "darkorchid",
  "darkred",
  "darksalmon",
  "darkseagreen",
  "darkslateblue",
  "darkslategray",
  "darkturquoise",
  "darkviolet",
  "deeppink",
  "deepskyblue",
  "dimgray",
  "dodgerblue",
  "firebrick",
  "floralwhite",
  "forestgreen",
  "fuchsia",
  "gainsboro",
  "ghostwhite",
  "gold",
  "goldenrod",
  "gray",
  "grey",
  "green",
  "greenyellow",
  "honeydew",
  "hotpink",
  "indianred",
  "indigo",
  "ivory",
  "khaki",
  "lavender",
  "lavenderblush",
  "lawngreen",
  "lemonchiffon",
  "lightblue",
  "lightcoral",
  "lightcyan",
  "lightgoldenrodyellow",
  "lightgray",
  "lightgreen",
  "lightpink",
  "lightsalmon",
  "lightseagreen",
  "lightskyblue",
  "lightslategray",
  "lightsteelblue",
  "lightyellow",
  "lime",
  "limegreen",
  "linen",
  "magenta",
  "maroon",
  "mediumaquamarine",
  "mediumblue",
  "mediumorchid",
  "mediumpurple",
  "mediumseagreen",
  "mediumslateblue",
  "mediumspringgreen",
  "mediumturquoise",
  "mediumvioletred",
  "midnightblue",
  "mintcream",
  "mistyrose",
  "moccasin",
  "navajowhite",
  "navy",
  "oldlace",
  "olive",
  "olivedrab",
  "orange",
  "orangered",
  "orchid",
  "palegoldenrod",
  "palegreen",
  "paleturquoise",
  "palevioletred",
  "papayawhip",
  "peachpuff",
  "peru",
  "pink",
  "plum",
  "powderblue",
  "purple",
  "rebeccapurple",
  "red",
  "rosybrown",
  "royalblue",
  "saddlebrown",
  "salmon",
  "sandybrown",
  "seagreen",
  "seashell",
  "sienna",
  "silver",
  "skyblue",
  "slateblue",
  "slategray",
  "snow",
  "springgreen",
  "steelblue",
  "tan",
  "teal",
  "thistle",
  "tomato",
  "turquoise",
  "violet",
  "wheat",
  "white",
  "whitesmoke",
  "yellow",
  "yellowgreen"
].map((n) => ({ type: "constant", label: n }))), QQ = /* @__PURE__ */ [
  "a",
  "abbr",
  "address",
  "article",
  "aside",
  "b",
  "bdi",
  "bdo",
  "blockquote",
  "body",
  "br",
  "button",
  "canvas",
  "caption",
  "cite",
  "code",
  "col",
  "colgroup",
  "dd",
  "del",
  "details",
  "dfn",
  "dialog",
  "div",
  "dl",
  "dt",
  "em",
  "figcaption",
  "figure",
  "footer",
  "form",
  "header",
  "hgroup",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "html",
  "i",
  "iframe",
  "img",
  "input",
  "ins",
  "kbd",
  "label",
  "legend",
  "li",
  "main",
  "meter",
  "nav",
  "ol",
  "output",
  "p",
  "pre",
  "ruby",
  "section",
  "select",
  "small",
  "source",
  "span",
  "strong",
  "sub",
  "summary",
  "sup",
  "table",
  "tbody",
  "td",
  "template",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul"
].map((n) => ({ type: "type", label: n })), rt = /^[\w-]*/, bQ = (n) => {
  let { state: e, pos: t } = n, i = Y(e).resolveInner(t, -1);
  if (i.name == "PropertyName")
    return { from: i.from, options: Mr(), validFor: rt };
  if (i.name == "ValueName")
    return { from: i.from, options: Sa, validFor: rt };
  if (i.name == "PseudoClassName")
    return { from: i.from, options: ya, validFor: rt };
  if (i.name == "TagName") {
    for (let { parent: o } = i; o; o = o.parent)
      if (o.name == "Block")
        return { from: i.from, options: Mr(), validFor: rt };
    return { from: i.from, options: QQ, validFor: rt };
  }
  if (!n.explicit)
    return null;
  let r = i.resolve(t), s = r.childBefore(t);
  return s && s.name == ":" && r.name == "PseudoClassSelector" ? { from: t, options: ya, validFor: rt } : s && s.name == ":" && r.name == "Declaration" || r.name == "ArgList" ? { from: t, options: Sa, validFor: rt } : r.name == "Block" ? { from: t, options: Mr(), validFor: rt } : null;
}, Rs = /* @__PURE__ */ Ut.define({
  parser: /* @__PURE__ */ mQ.configure({
    props: [
      /* @__PURE__ */ Yn.add({
        Declaration: /* @__PURE__ */ ln()
      }),
      /* @__PURE__ */ Fn.add({
        Block: Jh
      })
    ]
  }),
  languageData: {
    commentTokens: { block: { open: "/*", close: "*/" } },
    indentOnInput: /^\s*\}$/,
    wordChars: "-"
  }
});
function Pf() {
  return new Vs(Rs, Rs.data.of({ autocomplete: bQ }));
}
const li = ["_blank", "_self", "_top", "_parent"], jr = ["ascii", "utf-8", "utf-16", "latin1", "latin1"], zr = ["get", "post", "put", "delete"], qr = ["application/x-www-form-urlencoded", "multipart/form-data", "text/plain"], ye = ["true", "false"], S = {}, yQ = {
  a: {
    attrs: {
      href: null,
      ping: null,
      type: null,
      media: null,
      target: li,
      hreflang: null
    }
  },
  abbr: S,
  acronym: S,
  address: S,
  applet: S,
  area: {
    attrs: {
      alt: null,
      coords: null,
      href: null,
      target: null,
      ping: null,
      media: null,
      hreflang: null,
      type: null,
      shape: ["default", "rect", "circle", "poly"]
    }
  },
  article: S,
  aside: S,
  audio: {
    attrs: {
      src: null,
      mediagroup: null,
      crossorigin: ["anonymous", "use-credentials"],
      preload: ["none", "metadata", "auto"],
      autoplay: ["autoplay"],
      loop: ["loop"],
      controls: ["controls"]
    }
  },
  b: S,
  base: { attrs: { href: null, target: li } },
  basefont: S,
  bdi: S,
  bdo: S,
  big: S,
  blockquote: { attrs: { cite: null } },
  body: S,
  br: S,
  button: {
    attrs: {
      form: null,
      formaction: null,
      name: null,
      value: null,
      autofocus: ["autofocus"],
      disabled: ["autofocus"],
      formenctype: qr,
      formmethod: zr,
      formnovalidate: ["novalidate"],
      formtarget: li,
      type: ["submit", "reset", "button"]
    }
  },
  canvas: { attrs: { width: null, height: null } },
  caption: S,
  center: S,
  cite: S,
  code: S,
  col: { attrs: { span: null } },
  colgroup: { attrs: { span: null } },
  command: {
    attrs: {
      type: ["command", "checkbox", "radio"],
      label: null,
      icon: null,
      radiogroup: null,
      command: null,
      title: null,
      disabled: ["disabled"],
      checked: ["checked"]
    }
  },
  data: { attrs: { value: null } },
  datagrid: { attrs: { disabled: ["disabled"], multiple: ["multiple"] } },
  datalist: { attrs: { data: null } },
  dd: S,
  del: { attrs: { cite: null, datetime: null } },
  details: { attrs: { open: ["open"] } },
  dfn: S,
  dir: S,
  div: S,
  dl: S,
  dt: S,
  em: S,
  embed: { attrs: { src: null, type: null, width: null, height: null } },
  eventsource: { attrs: { src: null } },
  fieldset: { attrs: { disabled: ["disabled"], form: null, name: null } },
  figcaption: S,
  figure: S,
  font: S,
  footer: S,
  form: {
    attrs: {
      action: null,
      name: null,
      "accept-charset": jr,
      autocomplete: ["on", "off"],
      enctype: qr,
      method: zr,
      novalidate: ["novalidate"],
      target: li
    }
  },
  frame: S,
  frameset: S,
  h1: S,
  h2: S,
  h3: S,
  h4: S,
  h5: S,
  h6: S,
  head: {
    children: ["title", "base", "link", "style", "meta", "script", "noscript", "command"]
  },
  header: S,
  hgroup: S,
  hr: S,
  html: {
    attrs: { manifest: null }
  },
  i: S,
  iframe: {
    attrs: {
      src: null,
      srcdoc: null,
      name: null,
      width: null,
      height: null,
      sandbox: ["allow-top-navigation", "allow-same-origin", "allow-forms", "allow-scripts"],
      seamless: ["seamless"]
    }
  },
  img: {
    attrs: {
      alt: null,
      src: null,
      ismap: null,
      usemap: null,
      width: null,
      height: null,
      crossorigin: ["anonymous", "use-credentials"]
    }
  },
  input: {
    attrs: {
      alt: null,
      dirname: null,
      form: null,
      formaction: null,
      height: null,
      list: null,
      max: null,
      maxlength: null,
      min: null,
      name: null,
      pattern: null,
      placeholder: null,
      size: null,
      src: null,
      step: null,
      value: null,
      width: null,
      accept: ["audio/*", "video/*", "image/*"],
      autocomplete: ["on", "off"],
      autofocus: ["autofocus"],
      checked: ["checked"],
      disabled: ["disabled"],
      formenctype: qr,
      formmethod: zr,
      formnovalidate: ["novalidate"],
      formtarget: li,
      multiple: ["multiple"],
      readonly: ["readonly"],
      required: ["required"],
      type: [
        "hidden",
        "text",
        "search",
        "tel",
        "url",
        "email",
        "password",
        "datetime",
        "date",
        "month",
        "week",
        "time",
        "datetime-local",
        "number",
        "range",
        "color",
        "checkbox",
        "radio",
        "file",
        "submit",
        "image",
        "reset",
        "button"
      ]
    }
  },
  ins: { attrs: { cite: null, datetime: null } },
  kbd: S,
  keygen: {
    attrs: {
      challenge: null,
      form: null,
      name: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      keytype: ["RSA"]
    }
  },
  label: { attrs: { for: null, form: null } },
  legend: S,
  li: { attrs: { value: null } },
  link: {
    attrs: {
      href: null,
      type: null,
      hreflang: null,
      media: null,
      sizes: ["all", "16x16", "16x16 32x32", "16x16 32x32 64x64"]
    }
  },
  map: { attrs: { name: null } },
  mark: S,
  menu: { attrs: { label: null, type: ["list", "context", "toolbar"] } },
  meta: {
    attrs: {
      content: null,
      charset: jr,
      name: ["viewport", "application-name", "author", "description", "generator", "keywords"],
      "http-equiv": ["content-language", "content-type", "default-style", "refresh"]
    }
  },
  meter: { attrs: { value: null, min: null, low: null, high: null, max: null, optimum: null } },
  nav: S,
  noframes: S,
  noscript: S,
  object: {
    attrs: {
      data: null,
      type: null,
      name: null,
      usemap: null,
      form: null,
      width: null,
      height: null,
      typemustmatch: ["typemustmatch"]
    }
  },
  ol: {
    attrs: { reversed: ["reversed"], start: null, type: ["1", "a", "A", "i", "I"] },
    children: ["li", "script", "template", "ul", "ol"]
  },
  optgroup: { attrs: { disabled: ["disabled"], label: null } },
  option: { attrs: { disabled: ["disabled"], label: null, selected: ["selected"], value: null } },
  output: { attrs: { for: null, form: null, name: null } },
  p: S,
  param: { attrs: { name: null, value: null } },
  pre: S,
  progress: { attrs: { value: null, max: null } },
  q: { attrs: { cite: null } },
  rp: S,
  rt: S,
  ruby: S,
  s: S,
  samp: S,
  script: {
    attrs: {
      type: ["text/javascript"],
      src: null,
      async: ["async"],
      defer: ["defer"],
      charset: jr
    }
  },
  section: S,
  select: {
    attrs: {
      form: null,
      name: null,
      size: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      multiple: ["multiple"]
    }
  },
  slot: { attrs: { name: null } },
  small: S,
  source: { attrs: { src: null, type: null, media: null } },
  span: S,
  strike: S,
  strong: S,
  style: {
    attrs: {
      type: ["text/css"],
      media: null,
      scoped: null
    }
  },
  sub: S,
  summary: S,
  sup: S,
  table: S,
  tbody: S,
  td: { attrs: { colspan: null, rowspan: null, headers: null } },
  template: S,
  textarea: {
    attrs: {
      dirname: null,
      form: null,
      maxlength: null,
      name: null,
      placeholder: null,
      rows: null,
      cols: null,
      autofocus: ["autofocus"],
      disabled: ["disabled"],
      readonly: ["readonly"],
      required: ["required"],
      wrap: ["soft", "hard"]
    }
  },
  tfoot: S,
  th: { attrs: { colspan: null, rowspan: null, headers: null, scope: ["row", "col", "rowgroup", "colgroup"] } },
  thead: S,
  time: { attrs: { datetime: null } },
  title: S,
  tr: S,
  track: {
    attrs: {
      src: null,
      label: null,
      default: null,
      kind: ["subtitles", "captions", "descriptions", "chapters", "metadata"],
      srclang: null
    }
  },
  tt: S,
  u: S,
  ul: { children: ["li", "script", "template", "ul", "ol"] },
  var: S,
  video: {
    attrs: {
      src: null,
      poster: null,
      width: null,
      height: null,
      crossorigin: ["anonymous", "use-credentials"],
      preload: ["auto", "metadata", "none"],
      autoplay: ["autoplay"],
      mediagroup: ["movie"],
      muted: ["muted"],
      controls: ["controls"]
    }
  },
  wbr: S
}, SQ = {
  accesskey: null,
  class: null,
  contenteditable: ye,
  contextmenu: null,
  dir: ["ltr", "rtl", "auto"],
  draggable: ["true", "false", "auto"],
  dropzone: ["copy", "move", "link", "string:", "file:"],
  hidden: ["hidden"],
  id: null,
  inert: ["inert"],
  itemid: null,
  itemprop: null,
  itemref: null,
  itemscope: ["itemscope"],
  itemtype: null,
  lang: ["ar", "bn", "de", "en-GB", "en-US", "es", "fr", "hi", "id", "ja", "pa", "pt", "ru", "tr", "zh"],
  spellcheck: ye,
  autocorrect: ye,
  autocapitalize: ye,
  style: null,
  tabindex: null,
  title: null,
  translate: ["yes", "no"],
  onclick: null,
  rel: ["stylesheet", "alternate", "author", "bookmark", "help", "license", "next", "nofollow", "noreferrer", "prefetch", "prev", "search", "tag"],
  role: /* @__PURE__ */ "alert application article banner button cell checkbox complementary contentinfo dialog document feed figure form grid gridcell heading img list listbox listitem main navigation region row rowgroup search switch tab table tabpanel textbox timer".split(" "),
  "aria-activedescendant": null,
  "aria-atomic": ye,
  "aria-autocomplete": ["inline", "list", "both", "none"],
  "aria-busy": ye,
  "aria-checked": ["true", "false", "mixed", "undefined"],
  "aria-controls": null,
  "aria-describedby": null,
  "aria-disabled": ye,
  "aria-dropeffect": null,
  "aria-expanded": ["true", "false", "undefined"],
  "aria-flowto": null,
  "aria-grabbed": ["true", "false", "undefined"],
  "aria-haspopup": ye,
  "aria-hidden": ye,
  "aria-invalid": ["true", "false", "grammar", "spelling"],
  "aria-label": null,
  "aria-labelledby": null,
  "aria-level": null,
  "aria-live": ["off", "polite", "assertive"],
  "aria-multiline": ye,
  "aria-multiselectable": ye,
  "aria-owns": null,
  "aria-posinset": null,
  "aria-pressed": ["true", "false", "mixed", "undefined"],
  "aria-readonly": ye,
  "aria-relevant": null,
  "aria-required": ye,
  "aria-selected": ["true", "false", "undefined"],
  "aria-setsize": null,
  "aria-sort": ["ascending", "descending", "none", "other"],
  "aria-valuemax": null,
  "aria-valuemin": null,
  "aria-valuenow": null,
  "aria-valuetext": null
};
class qn {
  constructor(e, t) {
    this.tags = Object.assign(Object.assign({}, yQ), e), this.globalAttrs = Object.assign(Object.assign({}, SQ), t), this.allTags = Object.keys(this.tags), this.globalAttrNames = Object.keys(this.globalAttrs);
  }
}
qn.default = /* @__PURE__ */ new qn();
function Jt(n, e, t = n.length) {
  if (!e)
    return "";
  let i = e.firstChild, r = i && i.getChild("TagName");
  return r ? n.sliceString(r.from, Math.min(r.to, t)) : "";
}
function lr(n, e = !1) {
  for (let t = n.parent; t; t = t.parent)
    if (t.name == "Element")
      if (e)
        e = !1;
      else
        return t;
  return null;
}
function Rf(n, e, t) {
  let i = t.tags[Jt(n, lr(e, !0))];
  return (i == null ? void 0 : i.children) || t.allTags;
}
function ao(n, e) {
  let t = [];
  for (let i = e; i = lr(i); ) {
    let r = Jt(n, i);
    if (r && i.lastChild.name == "CloseTag")
      break;
    r && t.indexOf(r) < 0 && (e.name == "EndTag" || e.from >= i.firstChild.to) && t.push(r);
  }
  return t;
}
const Cf = /^[:\-\.\w\u00b7-\uffff]*$/;
function xa(n, e, t, i, r) {
  let s = /\s*>/.test(n.sliceDoc(r, r + 5)) ? "" : ">";
  return {
    from: i,
    to: r,
    options: Rf(n.doc, t, e).map((o) => ({ label: o, type: "type" })).concat(ao(n.doc, t).map((o, l) => ({
      label: "/" + o,
      apply: "/" + o + s,
      type: "type",
      boost: 99 - l
    }))),
    validFor: /^\/?[:\-\.\w\u00b7-\uffff]*$/
  };
}
function $a(n, e, t, i) {
  let r = /\s*>/.test(n.sliceDoc(i, i + 5)) ? "" : ">";
  return {
    from: t,
    to: i,
    options: ao(n.doc, e).map((s, o) => ({ label: s, apply: s + r, type: "type", boost: 99 - o })),
    validFor: Cf
  };
}
function xQ(n, e, t, i) {
  let r = [], s = 0;
  for (let o of Rf(n.doc, t, e))
    r.push({ label: "<" + o, type: "type" });
  for (let o of ao(n.doc, t))
    r.push({ label: "</" + o + ">", type: "type", boost: 99 - s++ });
  return { from: i, to: i, options: r, validFor: /^<\/?[:\-\.\w\u00b7-\uffff]*$/ };
}
function $Q(n, e, t, i, r) {
  let s = lr(t), o = s ? e.tags[Jt(n.doc, s)] : null, l = o && o.attrs ? Object.keys(o.attrs).concat(e.globalAttrNames) : e.globalAttrNames;
  return {
    from: i,
    to: r,
    options: l.map((a) => ({ label: a, type: "property" })),
    validFor: Cf
  };
}
function kQ(n, e, t, i, r) {
  var s;
  let o = (s = t.parent) === null || s === void 0 ? void 0 : s.getChild("AttributeName"), l = [], a;
  if (o) {
    let h = n.sliceDoc(o.from, o.to), c = e.globalAttrs[h];
    if (!c) {
      let f = lr(t), u = f ? e.tags[Jt(n.doc, f)] : null;
      c = (u == null ? void 0 : u.attrs) && u.attrs[h];
    }
    if (c) {
      let f = n.sliceDoc(i, r).toLowerCase(), u = '"', d = '"';
      /^['"]/.test(f) ? (a = f[0] == '"' ? /^[^"]*$/ : /^[^']*$/, u = "", d = n.sliceDoc(r, r + 1) == f[0] ? "" : f[0], f = f.slice(1), i++) : a = /^[^\s<>='"]*$/;
      for (let O of c)
        l.push({ label: O, apply: u + O + d, type: "constant" });
    }
  }
  return { from: i, to: r, options: l, validFor: a };
}
function wQ(n, e) {
  let { state: t, pos: i } = e, r = Y(t).resolveInner(i), s = r.resolve(i, -1);
  for (let o = i, l; r == s && (l = s.childBefore(o)); ) {
    let a = l.lastChild;
    if (!a || !a.type.isError || a.from < a.to)
      break;
    r = s = l, o = a.from;
  }
  return s.name == "TagName" ? s.parent && /CloseTag$/.test(s.parent.name) ? $a(t, s, s.from, i) : xa(t, n, s, s.from, i) : s.name == "StartTag" ? xa(t, n, s, i, i) : s.name == "StartCloseTag" || s.name == "IncompleteCloseTag" ? $a(t, s, i, i) : e.explicit && (s.name == "OpenTag" || s.name == "SelfClosingTag") || s.name == "AttributeName" ? $Q(t, n, s, s.name == "AttributeName" ? s.from : i, i) : s.name == "Is" || s.name == "AttributeValue" || s.name == "UnquotedAttributeValue" ? kQ(t, n, s, s.name == "Is" ? i : s.from, i) : e.explicit && (r.name == "Element" || r.name == "Text" || r.name == "Document") ? xQ(t, n, s, i) : null;
}
function TQ(n) {
  let { extraTags: e, extraGlobalAttributes: t } = n, i = t || e ? new qn(e, t) : qn.default;
  return (r) => wQ(i, r);
}
const Cs = /* @__PURE__ */ Ut.define({
  parser: /* @__PURE__ */ H0.configure({
    props: [
      /* @__PURE__ */ Yn.add({
        Element(n) {
          let e = /^(\s*)(<\/)?/.exec(n.textAfter);
          return n.node.to <= n.pos + e[0].length ? n.continue() : n.lineIndent(n.node.from) + (e[2] ? 0 : n.unit);
        },
        "OpenTag CloseTag SelfClosingTag"(n) {
          return n.column(n.node.from) + n.unit;
        },
        Document(n) {
          if (n.pos + /\s*/.exec(n.textAfter)[0].length < n.node.to)
            return n.continue();
          let e = null, t;
          for (let i = n.node; ; ) {
            let r = i.lastChild;
            if (!r || r.name != "Element" || r.to != i.to)
              break;
            e = i = r;
          }
          return e && !((t = e.lastChild) && (t.name == "CloseTag" || t.name == "SelfClosingTag")) ? n.lineIndent(e.from) + n.unit : null;
        }
      }),
      /* @__PURE__ */ Fn.add({
        Element(n) {
          let e = n.firstChild, t = n.lastChild;
          return !e || e.name != "OpenTag" ? null : { from: e.to, to: t.name == "CloseTag" ? t.from : n.to };
        }
      })
    ],
    wrap: /* @__PURE__ */ K0([
      {
        tag: "script",
        attrs(n) {
          return !n.type || /^(?:text|application)\/(?:x-)?(?:java|ecma)script$|^module$|^$/i.test(n.type);
        },
        parser: Ot.parser
      },
      {
        tag: "style",
        attrs(n) {
          return (!n.lang || n.lang == "css") && (!n.type || /^(text\/)?(x-)?(stylesheet|css)$/i.test(n.type));
        },
        parser: Rs.parser
      }
    ])
  }),
  languageData: {
    commentTokens: { block: { open: "<!--", close: "-->" } },
    indentOnInput: /^\s*<\/\w+\W$/,
    wordChars: "-._"
  }
});
function vQ(n = {}) {
  let e = Cs;
  return n.matchClosingTags === !1 && (e = e.configure({ dialect: "noMatch" })), new Vs(e, [
    Cs.data.of({ autocomplete: TQ(n) }),
    n.autoCloseTags !== !1 ? PQ : [],
    mf().support,
    Pf().support
  ]);
}
const PQ = /* @__PURE__ */ P.inputHandler.of((n, e, t, i) => {
  if (n.composing || n.state.readOnly || e != t || i != ">" && i != "/" || !Cs.isActiveAt(n.state, e, -1))
    return !1;
  let { state: r } = n, s = r.changeByRange((o) => {
    var l, a, h;
    let { head: c } = o, f = Y(r).resolveInner(c, -1), u;
    if ((f.name == "TagName" || f.name == "StartTag") && (f = f.parent), i == ">" && f.name == "OpenTag") {
      if (((a = (l = f.parent) === null || l === void 0 ? void 0 : l.lastChild) === null || a === void 0 ? void 0 : a.name) != "CloseTag" && (u = Jt(r.doc, f.parent, c)))
        return { range: m.cursor(c + 1), changes: { from: c, insert: `></${u}>` } };
    } else if (i == "/" && f.name == "OpenTag") {
      let d = f.parent, O = d == null ? void 0 : d.parent;
      if (d.from == c - 1 && ((h = O.lastChild) === null || h === void 0 ? void 0 : h.name) != "CloseTag" && (u = Jt(r.doc, O, c))) {
        let g = `/${u}>`;
        return { range: m.cursor(c + g.length), changes: { from: c, insert: g } };
      }
    }
    return { range: o };
  });
  return s.changes.empty ? !1 : (n.dispatch(s, { userEvent: "input.type", scrollIntoView: !0 }), !0);
});
function Er(n, e, t) {
  let i = null;
  return n === "javascript" && (i = mf()), n === "html" && (i = vQ()), n === "css" && (i = Pf()), M.create({
    doc: e,
    extensions: [
      i,
      bp(),
      Yd(),
      Zd(),
      Jd(),
      Pd(),
      pg(),
      Qd(),
      XO(),
      Ci.of("    "),
      LO(FO, { fallback: !0 }),
      np(),
      pm(),
      NO({ openText: "\u25BE", closedText: "\u25B8" }),
      Tm(),
      P.lineWrapping,
      P.updateListener.of((r) => {
        r.docChanged && t(r.state.doc.toString());
      }),
      Bn.of([
        ...hg,
        ...Pp,
        cg,
        ...Wg,
        ...IO,
        ...ff,
        ...bm
      ])
    ]
  });
}
class RQ extends Af {
  constructor() {
    super();
  }
  static get observedAttributes() {
    return ["lang", "value"];
  }
  attributeChangedCallback(e, t, i) {
    !this.editor || (e === "lang" && this.editor.setState(Er(i, this.value, (r) => {
      this.value = r, this.dispatchEvent(new Event("input"));
    })), e === "value" && this.editor.setState(Er(this.lang, i, (r) => {
      this.value = r, this.dispatchEvent(new Event("input"));
    })));
  }
  connectedCallback() {
    var e, t;
    this.lang = (e = this.getAttribute("lang")) != null ? e : "javascript", this.value = (t = this.getAttribute("value")) != null ? t : "", this.editor = null, this.shadowRoot.innerHTML = `
            <div id="code-mirror-editor"></div>
            <style>
            :host {
                display: block;
                height: 100%;
            }

            #code-mirror-editor {
                height: 100%;
            }

            #code-mirror-editor .cm-editor.cm-focused {
                outline: 0 !important;
            }

            #code-mirror-editor .cm-gutters {
                user-select: none;
                background-color: inherit;
                border-right: 0;
            }

            #code-mirror-editor .cm-scroller {
                font-family: Menlo, Monaco, Consolas, 'Droid Sans Mono', 'Courier New', monospace, 'Droid Sans Fallback';
                font-size: 14px;
                overflow: auto;
            }

            #code-mirror-editor .cm-editor.cm-focused .cm-activeLine,
            #code-mirror-editor .cm-editor.cm-focused .cm-activeLineGutter {
                background-color: rgb(130, 130, 130, 0.1);
            }

            #code-mirror-editor .cm-editor:not(.cm-focused) .cm-activeLine,
            #code-mirror-editor .cm-editor:not(.cm-focused) .cm-activeLineGutter {
                background-color: transparent;
            }

            #code-mirror-editor .cm-foldGutter span {
                font-size: 1.1rem;
                line-height: 1.1rem;
                color: rgb(130, 130, 130, 0.5);
            }

            #code-mirror-editor .cm-foldGutter span:hover {
                color: #999999;
            }

            #code-mirror-editor .cm-editor {
                height: 100%;
            }
            </style>
        `, this.editor = new P({
      state: Er(this.lang, this.value, (i) => {
        this.value = i, this.dispatchEvent(new Event("input"));
      }),
      parent: this.shadowRoot.querySelector("#code-mirror-editor")
    }), this.hasAttribute("autofocus") && this.editor.focus();
  }
}
customElements.define("code-mirror", RQ);
