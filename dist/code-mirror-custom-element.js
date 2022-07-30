class yc extends HTMLElement {
  constructor() {
    super(), this.attachShadow({ mode: "open" });
  }
}
class D {
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
    let s = [];
    return this.decompose(0, e, s, 2), i.length && i.decompose(0, i.length, s, 3), this.decompose(t, this.length, s, 1), Ze.from(s, this.length - (t - e) + i.length);
  }
  append(e) {
    return this.replace(this.length, this.length, e);
  }
  slice(e, t = this.length) {
    let i = [];
    return this.decompose(e, t, i, 0), Ze.from(i, t - e);
  }
  eq(e) {
    if (e == this)
      return !0;
    if (e.length != this.length || e.lines != this.lines)
      return !1;
    let t = this.scanIdentical(e, 1), i = this.length - this.scanIdentical(e, -1), s = new ti(this), r = new ti(e);
    for (let o = t, l = t; ; ) {
      if (s.next(o), r.next(o), o = 0, s.lineBreak != r.lineBreak || s.done != r.done || s.value != r.value)
        return !1;
      if (l += s.value.length, s.done || l >= i)
        return !0;
    }
  }
  iter(e = 1) {
    return new ti(this, e);
  }
  iterRange(e, t = this.length) {
    return new Rl(this, e, t);
  }
  iterLines(e, t) {
    let i;
    if (e == null)
      i = this.iter();
    else {
      t == null && (t = this.lines + 1);
      let s = this.line(e).from;
      i = this.iterRange(s, Math.max(s, t == this.lines + 1 ? this.length : t <= 1 ? 0 : this.line(t - 1).to));
    }
    return new Al(i);
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
    return e.length == 1 && !e[0] ? D.empty : e.length <= 32 ? new B(e) : Ze.from(B.split(e, []));
  }
}
class B extends D {
  constructor(e, t = Sc(e)) {
    super(), this.text = e, this.length = t;
  }
  get lines() {
    return this.text.length;
  }
  get children() {
    return null;
  }
  lineInner(e, t, i, s) {
    for (let r = 0; ; r++) {
      let o = this.text[r], l = s + o.length;
      if ((t ? i : l) >= e)
        return new bc(s, l, i, o);
      s = l + 1, i++;
    }
  }
  decompose(e, t, i, s) {
    let r = e <= 0 && t >= this.length ? this : new B(Dr(this.text, e, t), Math.min(t, this.length) - Math.max(0, e));
    if (s & 1) {
      let o = i.pop(), l = Bi(r.text, o.text.slice(), 0, r.length);
      if (l.length <= 32)
        i.push(new B(l, o.length + r.length));
      else {
        let a = l.length >> 1;
        i.push(new B(l.slice(0, a)), new B(l.slice(a)));
      }
    } else
      i.push(r);
  }
  replace(e, t, i) {
    if (!(i instanceof B))
      return super.replace(e, t, i);
    let s = Bi(this.text, Bi(i.text, Dr(this.text, 0, e)), t), r = this.length + i.length - (t - e);
    return s.length <= 32 ? new B(s, r) : Ze.from(B.split(s, []), r);
  }
  sliceString(e, t = this.length, i = `
`) {
    let s = "";
    for (let r = 0, o = 0; r <= t && o < this.text.length; o++) {
      let l = this.text[o], a = r + l.length;
      r > e && o && (s += i), e < a && t > r && (s += l.slice(Math.max(0, e - r), t - r)), r = a + 1;
    }
    return s;
  }
  flatten(e) {
    for (let t of this.text)
      e.push(t);
  }
  scanIdentical() {
    return 0;
  }
  static split(e, t) {
    let i = [], s = -1;
    for (let r of e)
      i.push(r), s += r.length + 1, i.length == 32 && (t.push(new B(i, s)), i = [], s = -1);
    return s > -1 && t.push(new B(i, s)), t;
  }
}
class Ze extends D {
  constructor(e, t) {
    super(), this.children = e, this.length = t, this.lines = 0;
    for (let i of e)
      this.lines += i.lines;
  }
  lineInner(e, t, i, s) {
    for (let r = 0; ; r++) {
      let o = this.children[r], l = s + o.length, a = i + o.lines - 1;
      if ((t ? a : l) >= e)
        return o.lineInner(e, t, i, s);
      s = l + 1, i = a + 1;
    }
  }
  decompose(e, t, i, s) {
    for (let r = 0, o = 0; o <= t && r < this.children.length; r++) {
      let l = this.children[r], a = o + l.length;
      if (e <= a && t >= o) {
        let h = s & ((o <= e ? 1 : 0) | (a >= t ? 2 : 0));
        o >= e && a <= t && !h ? i.push(l) : l.decompose(e - o, t - o, i, h);
      }
      o = a + 1;
    }
  }
  replace(e, t, i) {
    if (i.lines < this.lines)
      for (let s = 0, r = 0; s < this.children.length; s++) {
        let o = this.children[s], l = r + o.length;
        if (e >= r && t <= l) {
          let a = o.replace(e - r, t - r, i), h = this.lines - o.lines + a.lines;
          if (a.lines < h >> 5 - 1 && a.lines > h >> 5 + 1) {
            let c = this.children.slice();
            return c[s] = a, new Ze(c, this.length - (t - e) + i.length);
          }
          return super.replace(r, l, a);
        }
        r = l + 1;
      }
    return super.replace(e, t, i);
  }
  sliceString(e, t = this.length, i = `
`) {
    let s = "";
    for (let r = 0, o = 0; r < this.children.length && o <= t; r++) {
      let l = this.children[r], a = o + l.length;
      o > e && r && (s += i), e < a && t > o && (s += l.sliceString(e - o, t - o, i)), o = a + 1;
    }
    return s;
  }
  flatten(e) {
    for (let t of this.children)
      t.flatten(e);
  }
  scanIdentical(e, t) {
    if (!(e instanceof Ze))
      return 0;
    let i = 0, [s, r, o, l] = t > 0 ? [0, 0, this.children.length, e.children.length] : [this.children.length - 1, e.children.length - 1, -1, -1];
    for (; ; s += t, r += t) {
      if (s == o || r == l)
        return i;
      let a = this.children[s], h = e.children[r];
      if (a != h)
        return i + a.scanIdentical(h, t);
      i += a.length + 1;
    }
  }
  static from(e, t = e.reduce((i, s) => i + s.length + 1, -1)) {
    let i = 0;
    for (let d of e)
      i += d.lines;
    if (i < 32) {
      let d = [];
      for (let O of e)
        O.flatten(d);
      return new B(d, t);
    }
    let s = Math.max(32, i >> 5), r = s << 1, o = s >> 1, l = [], a = 0, h = -1, c = [];
    function f(d) {
      let O;
      if (d.lines > r && d instanceof Ze)
        for (let m of d.children)
          f(m);
      else
        d.lines > o && (a > o || !a) ? (u(), l.push(d)) : d instanceof B && a && (O = c[c.length - 1]) instanceof B && d.lines + O.lines <= 32 ? (a += d.lines, h += d.length + 1, c[c.length - 1] = new B(O.text.concat(d.text), O.length + 1 + d.length)) : (a + d.lines > s && u(), a += d.lines, h += d.length + 1, c.push(d));
    }
    function u() {
      a != 0 && (l.push(c.length == 1 ? c[0] : Ze.from(c, h)), h = -1, a = c.length = 0);
    }
    for (let d of e)
      f(d);
    return u(), l.length == 1 ? l[0] : new Ze(l, t);
  }
}
D.empty = /* @__PURE__ */ new B([""], 0);
function Sc(n) {
  let e = -1;
  for (let t of n)
    e += t.length + 1;
  return e;
}
function Bi(n, e, t = 0, i = 1e9) {
  for (let s = 0, r = 0, o = !0; r < n.length && s <= i; r++) {
    let l = n[r], a = s + l.length;
    a >= t && (a > i && (l = l.slice(0, i - s)), s < t && (l = l.slice(t - s)), o ? (e[e.length - 1] += l, o = !1) : e.push(l)), s = a + 1;
  }
  return e;
}
function Dr(n, e, t) {
  return Bi(n, [""], e, t);
}
class ti {
  constructor(e, t = 1) {
    this.dir = t, this.done = !1, this.lineBreak = !1, this.value = "", this.nodes = [e], this.offsets = [t > 0 ? 1 : (e instanceof B ? e.text.length : e.children.length) << 1];
  }
  nextInner(e, t) {
    for (this.done = this.lineBreak = !1; ; ) {
      let i = this.nodes.length - 1, s = this.nodes[i], r = this.offsets[i], o = r >> 1, l = s instanceof B ? s.text.length : s.children.length;
      if (o == (t > 0 ? l : 0)) {
        if (i == 0)
          return this.done = !0, this.value = "", this;
        t > 0 && this.offsets[i - 1]++, this.nodes.pop(), this.offsets.pop();
      } else if ((r & 1) == (t > 0 ? 0 : 1)) {
        if (this.offsets[i] += t, e == 0)
          return this.lineBreak = !0, this.value = `
`, this;
        e--;
      } else if (s instanceof B) {
        let a = s.text[o + (t < 0 ? -1 : 0)];
        if (this.offsets[i] += t, a.length > Math.max(0, e))
          return this.value = e == 0 ? a : t > 0 ? a.slice(e) : a.slice(0, a.length - e), this;
        e -= a.length;
      } else {
        let a = s.children[o + (t < 0 ? -1 : 0)];
        e > a.length ? (e -= a.length, this.offsets[i] += t) : (t < 0 && this.offsets[i]--, this.nodes.push(a), this.offsets.push(t > 0 ? 1 : (a instanceof B ? a.text.length : a.children.length) << 1));
      }
    }
  }
  next(e = 0) {
    return e < 0 && (this.nextInner(-e, -this.dir), e = this.value.length), this.nextInner(e, this.dir);
  }
}
class Rl {
  constructor(e, t, i) {
    this.value = "", this.done = !1, this.cursor = new ti(e, t > i ? -1 : 1), this.pos = t > i ? e.length : 0, this.from = Math.min(t, i), this.to = Math.max(t, i);
  }
  nextInner(e, t) {
    if (t < 0 ? this.pos <= this.from : this.pos >= this.to)
      return this.value = "", this.done = !0, this;
    e += Math.max(0, t < 0 ? this.pos - this.to : this.from - this.pos);
    let i = t < 0 ? this.pos - this.from : this.to - this.pos;
    e > i && (e = i), i -= e;
    let { value: s } = this.cursor.next(e);
    return this.pos += (s.length + e) * t, this.value = s.length <= i ? s : t < 0 ? s.slice(s.length - i) : s.slice(0, i), this.done = !this.value, this;
  }
  next(e = 0) {
    return e < 0 ? e = Math.max(e, this.from - this.pos) : e > 0 && (e = Math.min(e, this.to - this.pos)), this.nextInner(e, this.cursor.dir);
  }
  get lineBreak() {
    return this.cursor.lineBreak && this.value != "";
  }
}
class Al {
  constructor(e) {
    this.inner = e, this.afterBreak = !0, this.value = "", this.done = !1;
  }
  next(e = 0) {
    let { done: t, lineBreak: i, value: s } = this.inner.next(e);
    return t ? (this.done = !0, this.value = "") : i ? this.afterBreak ? this.value = "" : (this.afterBreak = !0, this.next()) : (this.value = s, this.afterBreak = !1), this;
  }
  get lineBreak() {
    return !1;
  }
}
typeof Symbol < "u" && (D.prototype[Symbol.iterator] = function() {
  return this.iter();
}, ti.prototype[Symbol.iterator] = Rl.prototype[Symbol.iterator] = Al.prototype[Symbol.iterator] = function() {
  return this;
});
class bc {
  constructor(e, t, i, s) {
    this.from = e, this.to = t, this.number = i, this.text = s;
  }
  get length() {
    return this.to - this.from;
  }
}
let Mt = /* @__PURE__ */ "lc,34,7n,7,7b,19,,,,2,,2,,,20,b,1c,l,g,,2t,7,2,6,2,2,,4,z,,u,r,2j,b,1m,9,9,,o,4,,9,,3,,5,17,3,3b,f,,w,1j,,,,4,8,4,,3,7,a,2,t,,1m,,,,2,4,8,,9,,a,2,q,,2,2,1l,,4,2,4,2,2,3,3,,u,2,3,,b,2,1l,,4,5,,2,4,,k,2,m,6,,,1m,,,2,,4,8,,7,3,a,2,u,,1n,,,,c,,9,,14,,3,,1l,3,5,3,,4,7,2,b,2,t,,1m,,2,,2,,3,,5,2,7,2,b,2,s,2,1l,2,,,2,4,8,,9,,a,2,t,,20,,4,,2,3,,,8,,29,,2,7,c,8,2q,,2,9,b,6,22,2,r,,,,,,1j,e,,5,,2,5,b,,10,9,,2u,4,,6,,2,2,2,p,2,4,3,g,4,d,,2,2,6,,f,,jj,3,qa,3,t,3,t,2,u,2,1s,2,,7,8,,2,b,9,,19,3,3b,2,y,,3a,3,4,2,9,,6,3,63,2,2,,1m,,,7,,,,,2,8,6,a,2,,1c,h,1r,4,1c,7,,,5,,14,9,c,2,w,4,2,2,,3,1k,,,2,3,,,3,1m,8,2,2,48,3,,d,,7,4,,6,,3,2,5i,1m,,5,ek,,5f,x,2da,3,3x,,2o,w,fe,6,2x,2,n9w,4,,a,w,2,28,2,7k,,3,,4,,p,2,5,,47,2,q,i,d,,12,8,p,b,1a,3,1c,,2,4,2,2,13,,1v,6,2,2,2,2,c,,8,,1b,,1f,,,3,2,2,5,2,,,16,2,8,,6m,,2,,4,,fn4,,kh,g,g,g,a6,2,gt,,6a,,45,5,1ae,3,,2,5,4,14,3,4,,4l,2,fx,4,ar,2,49,b,4w,,1i,f,1k,3,1d,4,2,2,1x,3,10,5,,8,1q,,c,2,1g,9,a,4,2,,2n,3,2,,,2,6,,4g,,3,8,l,2,1l,2,,,,,m,,e,7,3,5,5f,8,2,3,,,n,,29,,2,6,,,2,,,2,,2,6j,,2,4,6,2,,2,r,2,2d,8,2,,,2,2y,,,,2,6,,,2t,3,2,4,,5,77,9,,2,6t,,a,2,,,4,,40,4,2,2,4,,w,a,14,6,2,4,8,,9,6,2,3,1a,d,,2,ba,7,,6,,,2a,m,2,7,,2,,2,3e,6,3,,,2,,7,,,20,2,3,,,,9n,2,f0b,5,1n,7,t4,,1r,4,29,,f5k,2,43q,,,3,4,5,8,8,2,7,u,4,44,3,1iz,1j,4,1e,8,,e,,m,5,,f,11s,7,,h,2,7,,2,,5,79,7,c5,4,15s,7,31,7,240,5,gx7k,2o,3k,6o".split(",").map((n) => n ? parseInt(n, 36) : 1);
for (let n = 1; n < Mt.length; n++)
  Mt[n] += Mt[n - 1];
function xc(n) {
  for (let e = 1; e < Mt.length; e += 2)
    if (Mt[e] > n)
      return Mt[e - 1] <= n;
  return !1;
}
function Xr(n) {
  return n >= 127462 && n <= 127487;
}
const jr = 8205;
function me(n, e, t = !0, i = !0) {
  return (t ? Ml : $c)(n, e, i);
}
function Ml(n, e, t) {
  if (e == n.length)
    return e;
  e && Wl(n.charCodeAt(e)) && Zl(n.charCodeAt(e - 1)) && e--;
  let i = K(n, e);
  for (e += pe(i); e < n.length; ) {
    let s = K(n, e);
    if (i == jr || s == jr || t && xc(s))
      e += pe(s), i = s;
    else if (Xr(s)) {
      let r = 0, o = e - 2;
      for (; o >= 0 && Xr(K(n, o)); )
        r++, o -= 2;
      if (r % 2 == 0)
        break;
      e += 2;
    } else
      break;
  }
  return e;
}
function $c(n, e, t) {
  for (; e > 0; ) {
    let i = Ml(n, e - 2, t);
    if (i < e)
      return i;
    e--;
  }
  return 0;
}
function Wl(n) {
  return n >= 56320 && n < 57344;
}
function Zl(n) {
  return n >= 55296 && n < 56320;
}
function K(n, e) {
  let t = n.charCodeAt(e);
  if (!Zl(t) || e + 1 == n.length)
    return t;
  let i = n.charCodeAt(e + 1);
  return Wl(i) ? (t - 55296 << 10) + (i - 56320) + 65536 : t;
}
function sr(n) {
  return n <= 65535 ? String.fromCharCode(n) : (n -= 65536, String.fromCharCode((n >> 10) + 55296, (n & 1023) + 56320));
}
function pe(n) {
  return n < 65536 ? 1 : 2;
}
const Qs = /\r\n?|\n/;
var ne = /* @__PURE__ */ function(n) {
  return n[n.Simple = 0] = "Simple", n[n.TrackDel = 1] = "TrackDel", n[n.TrackBefore = 2] = "TrackBefore", n[n.TrackAfter = 3] = "TrackAfter", n;
}(ne || (ne = {}));
class Ee {
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
    for (let t = 0, i = 0, s = 0; t < this.sections.length; ) {
      let r = this.sections[t++], o = this.sections[t++];
      o < 0 ? (e(i, s, r), s += r) : s += o, i += r;
    }
  }
  iterChangedRanges(e, t = !1) {
    ys(this, e, t);
  }
  get invertedDesc() {
    let e = [];
    for (let t = 0; t < this.sections.length; ) {
      let i = this.sections[t++], s = this.sections[t++];
      s < 0 ? e.push(i, s) : e.push(s, i);
    }
    return new Ee(e);
  }
  composeDesc(e) {
    return this.empty ? e : e.empty ? this : Dl(this, e);
  }
  mapDesc(e, t = !1) {
    return e.empty ? this : Ss(this, e, t);
  }
  mapPos(e, t = -1, i = ne.Simple) {
    let s = 0, r = 0;
    for (let o = 0; o < this.sections.length; ) {
      let l = this.sections[o++], a = this.sections[o++], h = s + l;
      if (a < 0) {
        if (h > e)
          return r + (e - s);
        r += l;
      } else {
        if (i != ne.Simple && h >= e && (i == ne.TrackDel && s < e && h > e || i == ne.TrackBefore && s < e || i == ne.TrackAfter && h > e))
          return null;
        if (h > e || h == e && t < 0 && !l)
          return e == s || t < 0 ? r : r + a;
        r += a;
      }
      s = h;
    }
    if (e > s)
      throw new RangeError(`Position ${e} is out of range for changeset of length ${s}`);
    return r;
  }
  touchesRange(e, t = e) {
    for (let i = 0, s = 0; i < this.sections.length && s <= t; ) {
      let r = this.sections[i++], o = this.sections[i++], l = s + r;
      if (o >= 0 && s <= t && l >= e)
        return s < e && l > t ? "cover" : !0;
      s = l;
    }
    return !1;
  }
  toString() {
    let e = "";
    for (let t = 0; t < this.sections.length; ) {
      let i = this.sections[t++], s = this.sections[t++];
      e += (e ? " " : "") + i + (s >= 0 ? ":" + s : "");
    }
    return e;
  }
  toJSON() {
    return this.sections;
  }
  static fromJSON(e) {
    if (!Array.isArray(e) || e.length % 2 || e.some((t) => typeof t != "number"))
      throw new RangeError("Invalid JSON representation of ChangeDesc");
    return new Ee(e);
  }
  static create(e) {
    return new Ee(e);
  }
}
class _ extends Ee {
  constructor(e, t) {
    super(e), this.inserted = t;
  }
  apply(e) {
    if (this.length != e.length)
      throw new RangeError("Applying change set to a document with the wrong length");
    return ys(this, (t, i, s, r, o) => e = e.replace(s, s + (i - t), o), !1), e;
  }
  mapDesc(e, t = !1) {
    return Ss(this, e, t, !0);
  }
  invert(e) {
    let t = this.sections.slice(), i = [];
    for (let s = 0, r = 0; s < t.length; s += 2) {
      let o = t[s], l = t[s + 1];
      if (l >= 0) {
        t[s] = l, t[s + 1] = o;
        let a = s >> 1;
        for (; i.length < a; )
          i.push(D.empty);
        i.push(o ? e.slice(r, r + o) : D.empty);
      }
      r += o;
    }
    return new _(t, i);
  }
  compose(e) {
    return this.empty ? e : e.empty ? this : Dl(this, e, !0);
  }
  map(e, t = !1) {
    return e.empty ? this : Ss(this, e, t, !0);
  }
  iterChanges(e, t = !1) {
    ys(this, e, t);
  }
  get desc() {
    return Ee.create(this.sections);
  }
  filter(e) {
    let t = [], i = [], s = [], r = new li(this);
    e:
      for (let o = 0, l = 0; ; ) {
        let a = o == e.length ? 1e9 : e[o++];
        for (; l < a || l == a && r.len == 0; ) {
          if (r.done)
            break e;
          let c = Math.min(r.len, a - l);
          ie(s, c, -1);
          let f = r.ins == -1 ? -1 : r.off == 0 ? r.ins : 0;
          ie(t, c, f), f > 0 && et(i, t, r.text), r.forward(c), l += c;
        }
        let h = e[o++];
        for (; l < h; ) {
          if (r.done)
            break e;
          let c = Math.min(r.len, h - l);
          ie(t, c, -1), ie(s, c, r.ins == -1 ? -1 : r.off == 0 ? r.ins : 0), r.forward(c), l += c;
        }
      }
    return {
      changes: new _(t, i),
      filtered: Ee.create(s)
    };
  }
  toJSON() {
    let e = [];
    for (let t = 0; t < this.sections.length; t += 2) {
      let i = this.sections[t], s = this.sections[t + 1];
      s < 0 ? e.push(i) : s == 0 ? e.push([i]) : e.push([i].concat(this.inserted[t >> 1].toJSON()));
    }
    return e;
  }
  static of(e, t, i) {
    let s = [], r = [], o = 0, l = null;
    function a(c = !1) {
      if (!c && !s.length)
        return;
      o < t && ie(s, t - o, -1);
      let f = new _(s, r);
      l = l ? l.compose(f.map(l)) : f, s = [], r = [], o = 0;
    }
    function h(c) {
      if (Array.isArray(c))
        for (let f of c)
          h(f);
      else if (c instanceof _) {
        if (c.length != t)
          throw new RangeError(`Mismatched change set length (got ${c.length}, expected ${t})`);
        a(), l = l ? l.compose(c.map(l)) : c;
      } else {
        let { from: f, to: u = f, insert: d } = c;
        if (f > u || f < 0 || u > t)
          throw new RangeError(`Invalid change range ${f} to ${u} (in doc of length ${t})`);
        let O = d ? typeof d == "string" ? D.of(d.split(i || Qs)) : d : D.empty, m = O.length;
        if (f == u && m == 0)
          return;
        f < o && a(), f > o && ie(s, f - o, -1), ie(s, u - f, m), et(r, s, O), o = u;
      }
    }
    return h(e), a(!l), l;
  }
  static empty(e) {
    return new _(e ? [e, -1] : [], []);
  }
  static fromJSON(e) {
    if (!Array.isArray(e))
      throw new RangeError("Invalid JSON representation of ChangeSet");
    let t = [], i = [];
    for (let s = 0; s < e.length; s++) {
      let r = e[s];
      if (typeof r == "number")
        t.push(r, -1);
      else {
        if (!Array.isArray(r) || typeof r[0] != "number" || r.some((o, l) => l && typeof o != "string"))
          throw new RangeError("Invalid JSON representation of ChangeSet");
        if (r.length == 1)
          t.push(r[0], 0);
        else {
          for (; i.length < s; )
            i.push(D.empty);
          i[s] = D.of(r.slice(1)), t.push(r[0], i[s].length);
        }
      }
    }
    return new _(t, i);
  }
  static createSet(e, t) {
    return new _(e, t);
  }
}
function ie(n, e, t, i = !1) {
  if (e == 0 && t <= 0)
    return;
  let s = n.length - 2;
  s >= 0 && t <= 0 && t == n[s + 1] ? n[s] += e : e == 0 && n[s] == 0 ? n[s + 1] += t : i ? (n[s] += e, n[s + 1] += t) : n.push(e, t);
}
function et(n, e, t) {
  if (t.length == 0)
    return;
  let i = e.length - 2 >> 1;
  if (i < n.length)
    n[n.length - 1] = n[n.length - 1].append(t);
  else {
    for (; n.length < i; )
      n.push(D.empty);
    n.push(t);
  }
}
function ys(n, e, t) {
  let i = n.inserted;
  for (let s = 0, r = 0, o = 0; o < n.sections.length; ) {
    let l = n.sections[o++], a = n.sections[o++];
    if (a < 0)
      s += l, r += l;
    else {
      let h = s, c = r, f = D.empty;
      for (; h += l, c += a, a && i && (f = f.append(i[o - 2 >> 1])), !(t || o == n.sections.length || n.sections[o + 1] < 0); )
        l = n.sections[o++], a = n.sections[o++];
      e(s, h, r, c, f), s = h, r = c;
    }
  }
}
function Ss(n, e, t, i = !1) {
  let s = [], r = i ? [] : null, o = new li(n), l = new li(e);
  for (let a = -1; ; )
    if (o.ins == -1 && l.ins == -1) {
      let h = Math.min(o.len, l.len);
      ie(s, h, -1), o.forward(h), l.forward(h);
    } else if (l.ins >= 0 && (o.ins < 0 || a == o.i || o.off == 0 && (l.len < o.len || l.len == o.len && !t))) {
      let h = l.len;
      for (ie(s, l.ins, -1); h; ) {
        let c = Math.min(o.len, h);
        o.ins >= 0 && a < o.i && o.len <= c && (ie(s, 0, o.ins), r && et(r, s, o.text), a = o.i), o.forward(c), h -= c;
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
      ie(s, h, a < o.i ? o.ins : 0), r && a < o.i && et(r, s, o.text), a = o.i, o.forward(o.len - c);
    } else {
      if (o.done && l.done)
        return r ? _.createSet(s, r) : Ee.create(s);
      throw new Error("Mismatched change set lengths");
    }
}
function Dl(n, e, t = !1) {
  let i = [], s = t ? [] : null, r = new li(n), o = new li(e);
  for (let l = !1; ; ) {
    if (r.done && o.done)
      return s ? _.createSet(i, s) : Ee.create(i);
    if (r.ins == 0)
      ie(i, r.len, 0, l), r.next();
    else if (o.len == 0 && !o.done)
      ie(i, 0, o.ins, l), s && et(s, i, o.text), o.next();
    else {
      if (r.done || o.done)
        throw new Error("Mismatched change set lengths");
      {
        let a = Math.min(r.len2, o.len), h = i.length;
        if (r.ins == -1) {
          let c = o.ins == -1 ? -1 : o.off ? 0 : o.ins;
          ie(i, a, c, l), s && c && et(s, i, o.text);
        } else
          o.ins == -1 ? (ie(i, r.off ? 0 : r.len, a, l), s && et(s, i, r.textBit(a))) : (ie(i, r.off ? 0 : r.len, o.off ? 0 : o.ins, l), s && !o.off && et(s, i, o.text));
        l = (r.ins > a || o.ins >= 0 && o.len > a) && (l || i.length > h), r.forward2(a), o.forward(a);
      }
    }
  }
}
class li {
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
    return t >= e.length ? D.empty : e[t];
  }
  textBit(e) {
    let { inserted: t } = this.set, i = this.i - 2 >> 1;
    return i >= t.length && !e ? D.empty : t[i].slice(this.off, e == null ? void 0 : this.off + e);
  }
  forward(e) {
    e == this.len ? this.next() : (this.len -= e, this.off += e);
  }
  forward2(e) {
    this.ins == -1 ? this.forward(e) : e == this.ins ? this.next() : (this.ins -= e, this.off += e);
  }
}
class Ot {
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
    let i, s;
    return this.empty ? i = s = e.mapPos(this.from, t) : (i = e.mapPos(this.from, 1), s = e.mapPos(this.to, -1)), i == this.from && s == this.to ? this : new Ot(i, s, this.flags);
  }
  extend(e, t = e) {
    if (e <= this.anchor && t >= this.anchor)
      return g.range(e, t);
    let i = Math.abs(e - this.anchor) > Math.abs(t - this.anchor) ? e : t;
    return g.range(this.anchor, i);
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
    return g.range(e.anchor, e.head);
  }
  static create(e, t, i) {
    return new Ot(e, t, i);
  }
}
class g {
  constructor(e, t) {
    this.ranges = e, this.mainIndex = t;
  }
  map(e, t = -1) {
    return e.empty ? this : g.create(this.ranges.map((i) => i.map(e, t)), this.mainIndex);
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
    return this.ranges.length == 1 ? this : new g([this.main], 0);
  }
  addRange(e, t = !0) {
    return g.create([e].concat(this.ranges), t ? 0 : this.mainIndex + 1);
  }
  replaceRange(e, t = this.mainIndex) {
    let i = this.ranges.slice();
    return i[t] = e, g.create(i, this.mainIndex);
  }
  toJSON() {
    return { ranges: this.ranges.map((e) => e.toJSON()), main: this.mainIndex };
  }
  static fromJSON(e) {
    if (!e || !Array.isArray(e.ranges) || typeof e.main != "number" || e.main >= e.ranges.length)
      throw new RangeError("Invalid JSON representation for EditorSelection");
    return new g(e.ranges.map((t) => Ot.fromJSON(t)), e.main);
  }
  static single(e, t = e) {
    return new g([g.range(e, t)], 0);
  }
  static create(e, t = 0) {
    if (e.length == 0)
      throw new RangeError("A selection needs at least one range");
    for (let i = 0, s = 0; s < e.length; s++) {
      let r = e[s];
      if (r.empty ? r.from <= i : r.from < i)
        return g.normalized(e.slice(), t);
      i = r.to;
    }
    return new g(e, t);
  }
  static cursor(e, t = 0, i, s) {
    return Ot.create(e, e, (t == 0 ? 0 : t < 0 ? 4 : 8) | (i == null ? 3 : Math.min(2, i)) | (s != null ? s : 33554431) << 5);
  }
  static range(e, t, i) {
    let s = (i != null ? i : 33554431) << 5;
    return t < e ? Ot.create(t, e, 16 | s | 8) : Ot.create(e, t, s | (t > e ? 4 : 0));
  }
  static normalized(e, t = 0) {
    let i = e[t];
    e.sort((s, r) => s.from - r.from), t = e.indexOf(i);
    for (let s = 1; s < e.length; s++) {
      let r = e[s], o = e[s - 1];
      if (r.empty ? r.from <= o.to : r.from < o.to) {
        let l = o.from, a = Math.max(r.to, o.to);
        s <= t && t--, e.splice(--s, 2, r.anchor > r.head ? g.range(a, l) : g.range(l, a));
      }
    }
    return new g(e, t);
  }
}
function Xl(n, e) {
  for (let t of n.ranges)
    if (t.to > e)
      throw new RangeError("Selection points outside of document");
}
let rr = 0;
class x {
  constructor(e, t, i, s, r) {
    this.combine = e, this.compareInput = t, this.compare = i, this.isStatic = s, this.id = rr++, this.default = e([]), this.extensions = typeof r == "function" ? r(this) : r;
  }
  static define(e = {}) {
    return new x(e.combine || ((t) => t), e.compareInput || ((t, i) => t === i), e.compare || (e.combine ? (t, i) => t === i : or), !!e.static, e.enables);
  }
  of(e) {
    return new Gi([], this, 0, e);
  }
  compute(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Gi(e, this, 1, t);
  }
  computeN(e, t) {
    if (this.isStatic)
      throw new Error("Can't compute a static facet");
    return new Gi(e, this, 2, t);
  }
  from(e, t) {
    return t || (t = (i) => i), this.compute([e], (i) => t(i.field(e)));
  }
}
function or(n, e) {
  return n == e || n.length == e.length && n.every((t, i) => t === e[i]);
}
class Gi {
  constructor(e, t, i, s) {
    this.dependencies = e, this.facet = t, this.type = i, this.value = s, this.id = rr++;
  }
  dynamicSlot(e) {
    var t;
    let i = this.value, s = this.facet.compareInput, r = this.id, o = e[r] >> 1, l = this.type == 2, a = !1, h = !1, c = [];
    for (let f of this.dependencies)
      f == "doc" ? a = !0 : f == "selection" ? h = !0 : (((t = e[f.id]) !== null && t !== void 0 ? t : 1) & 1) == 0 && c.push(e[f.id]);
    return {
      create(f) {
        return f.values[o] = i(f), 1;
      },
      update(f, u) {
        if (a && u.docChanged || h && (u.docChanged || u.selection) || bs(f, c)) {
          let d = i(f);
          if (l ? !Er(d, f.values[o], s) : !s(d, f.values[o]))
            return f.values[o] = d, 1;
        }
        return 0;
      },
      reconfigure: (f, u) => {
        let d = i(f), O = u.config.address[r];
        if (O != null) {
          let m = Ji(u, O);
          if (this.dependencies.every((Q) => Q instanceof x ? u.facet(Q) === f.facet(Q) : Q instanceof le ? u.field(Q, !1) == f.field(Q, !1) : !0) || (l ? Er(d, m, s) : s(d, m)))
            return f.values[o] = m, 0;
        }
        return f.values[o] = d, 1;
      }
    };
  }
}
function Er(n, e, t) {
  if (n.length != e.length)
    return !1;
  for (let i = 0; i < n.length; i++)
    if (!t(n[i], e[i]))
      return !1;
  return !0;
}
function bs(n, e) {
  let t = !1;
  for (let i of e)
    ii(n, i) & 1 && (t = !0);
  return t;
}
function kc(n, e, t) {
  let i = t.map((a) => n[a.id]), s = t.map((a) => a.type), r = i.filter((a) => !(a & 1)), o = n[e.id] >> 1;
  function l(a) {
    let h = [];
    for (let c = 0; c < i.length; c++) {
      let f = Ji(a, i[c]);
      if (s[c] == 2)
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
        ii(a, h);
      return a.values[o] = l(a), 1;
    },
    update(a, h) {
      if (!bs(a, r))
        return 0;
      let c = l(a);
      return e.compare(c, a.values[o]) ? 0 : (a.values[o] = c, 1);
    },
    reconfigure(a, h) {
      let c = bs(a, i), f = h.config.facets[e.id], u = h.facet(e);
      if (f && !c && or(t, f))
        return a.values[o] = u, 0;
      let d = l(a);
      return e.compare(d, u) ? (a.values[o] = u, 0) : (a.values[o] = d, 1);
    }
  };
}
const qr = /* @__PURE__ */ x.define({ static: !0 });
class le {
  constructor(e, t, i, s, r) {
    this.id = e, this.createF = t, this.updateF = i, this.compareF = s, this.spec = r, this.provides = void 0;
  }
  static define(e) {
    let t = new le(rr++, e.create, e.update, e.compare || ((i, s) => i === s), e);
    return e.provide && (t.provides = e.provide(t)), t;
  }
  create(e) {
    let t = e.facet(qr).find((i) => i.field == this);
    return ((t == null ? void 0 : t.create) || this.createF)(e);
  }
  slot(e) {
    let t = e[this.id] >> 1;
    return {
      create: (i) => (i.values[t] = this.create(i), 1),
      update: (i, s) => {
        let r = i.values[t], o = this.updateF(r, s);
        return this.compareF(r, o) ? 0 : (i.values[t] = o, 1);
      },
      reconfigure: (i, s) => s.config.address[this.id] != null ? (i.values[t] = s.field(this), 0) : (i.values[t] = this.create(i), 1)
    };
  }
  init(e) {
    return [this, qr.of({ field: this, create: e })];
  }
  get extension() {
    return this;
  }
}
const Pt = { lowest: 4, low: 3, default: 2, high: 1, highest: 0 };
function Nt(n) {
  return (e) => new jl(e, n);
}
const Gt = {
  highest: /* @__PURE__ */ Nt(Pt.highest),
  high: /* @__PURE__ */ Nt(Pt.high),
  default: /* @__PURE__ */ Nt(Pt.default),
  low: /* @__PURE__ */ Nt(Pt.low),
  lowest: /* @__PURE__ */ Nt(Pt.lowest)
};
class jl {
  constructor(e, t) {
    this.inner = e, this.prec = t;
  }
}
class vn {
  of(e) {
    return new xs(this, e);
  }
  reconfigure(e) {
    return vn.reconfigure.of({ compartment: this, extension: e });
  }
  get(e) {
    return e.config.compartments.get(this);
  }
}
class xs {
  constructor(e, t) {
    this.compartment = e, this.inner = t;
  }
}
class Hi {
  constructor(e, t, i, s, r, o) {
    for (this.base = e, this.compartments = t, this.dynamicSlots = i, this.address = s, this.staticValues = r, this.facets = o, this.statusTemplate = []; this.statusTemplate.length < i.length; )
      this.statusTemplate.push(0);
  }
  staticFacet(e) {
    let t = this.address[e.id];
    return t == null ? e.default : this.staticValues[t >> 1];
  }
  static resolve(e, t, i) {
    let s = [], r = /* @__PURE__ */ Object.create(null), o = /* @__PURE__ */ new Map();
    for (let u of wc(e, t, o))
      u instanceof le ? s.push(u) : (r[u.facet.id] || (r[u.facet.id] = [])).push(u);
    let l = /* @__PURE__ */ Object.create(null), a = [], h = [];
    for (let u of s)
      l[u.id] = h.length << 1, h.push((d) => u.slot(d));
    let c = i == null ? void 0 : i.config.facets;
    for (let u in r) {
      let d = r[u], O = d[0].facet, m = c && c[u] || [];
      if (d.every((Q) => Q.type == 0))
        if (l[O.id] = a.length << 1 | 1, or(m, d))
          a.push(i.facet(O));
        else {
          let Q = O.combine(d.map((S) => S.value));
          a.push(i && O.compare(Q, i.facet(O)) ? i.facet(O) : Q);
        }
      else {
        for (let Q of d)
          Q.type == 0 ? (l[Q.id] = a.length << 1 | 1, a.push(Q.value)) : (l[Q.id] = h.length << 1, h.push((S) => Q.dynamicSlot(S)));
        l[O.id] = h.length << 1, h.push((Q) => kc(Q, O, d));
      }
    }
    let f = h.map((u) => u(l));
    return new Hi(e, o, f, l, a, r);
  }
}
function wc(n, e, t) {
  let i = [[], [], [], [], []], s = /* @__PURE__ */ new Map();
  function r(o, l) {
    let a = s.get(o);
    if (a != null) {
      if (a <= l)
        return;
      let h = i[a].indexOf(o);
      h > -1 && i[a].splice(h, 1), o instanceof xs && t.delete(o.compartment);
    }
    if (s.set(o, l), Array.isArray(o))
      for (let h of o)
        r(h, l);
    else if (o instanceof xs) {
      if (t.has(o.compartment))
        throw new RangeError("Duplicate use of compartment in extensions");
      let h = e.get(o.compartment) || o.inner;
      t.set(o.compartment, h), r(h, l);
    } else if (o instanceof jl)
      r(o.inner, o.prec);
    else if (o instanceof le)
      i[l].push(o), o.provides && r(o.provides, l);
    else if (o instanceof Gi)
      i[l].push(o), o.facet.extensions && r(o.facet.extensions, l);
    else {
      let h = o.extension;
      if (!h)
        throw new Error(`Unrecognized extension value in extension set (${o}). This sometimes happens because multiple instances of @codemirror/state are loaded, breaking instanceof checks.`);
      r(h, l);
    }
  }
  return r(n, Pt.default), i.reduce((o, l) => o.concat(l));
}
function ii(n, e) {
  if (e & 1)
    return 2;
  let t = e >> 1, i = n.status[t];
  if (i == 4)
    throw new Error("Cyclic dependency between fields and/or facets");
  if (i & 2)
    return i;
  n.status[t] = 4;
  let s = n.computeSlot(n, n.config.dynamicSlots[t]);
  return n.status[t] = 2 | s;
}
function Ji(n, e) {
  return e & 1 ? n.config.staticValues[e >> 1] : n.values[e >> 1];
}
const El = /* @__PURE__ */ x.define(), ql = /* @__PURE__ */ x.define({
  combine: (n) => n.some((e) => e),
  static: !0
}), Il = /* @__PURE__ */ x.define({
  combine: (n) => n.length ? n[0] : void 0,
  static: !0
}), zl = /* @__PURE__ */ x.define(), Bl = /* @__PURE__ */ x.define(), Gl = /* @__PURE__ */ x.define(), Ll = /* @__PURE__ */ x.define({
  combine: (n) => n.length ? n[0] : !1
});
class xt {
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  static define() {
    return new Tc();
  }
}
class Tc {
  of(e) {
    return new xt(this, e);
  }
}
class vc {
  constructor(e) {
    this.map = e;
  }
  of(e) {
    return new C(this, e);
  }
}
class C {
  constructor(e, t) {
    this.type = e, this.value = t;
  }
  map(e) {
    let t = this.type.map(this.value, e);
    return t === void 0 ? void 0 : t == this.value ? this : new C(this.type, t);
  }
  is(e) {
    return this.type == e;
  }
  static define(e = {}) {
    return new vc(e.map || ((t) => t));
  }
  static mapEffects(e, t) {
    if (!e.length)
      return e;
    let i = [];
    for (let s of e) {
      let r = s.map(t);
      r && i.push(r);
    }
    return i;
  }
}
C.reconfigure = /* @__PURE__ */ C.define();
C.appendConfig = /* @__PURE__ */ C.define();
class N {
  constructor(e, t, i, s, r, o) {
    this.startState = e, this.changes = t, this.selection = i, this.effects = s, this.annotations = r, this.scrollIntoView = o, this._doc = null, this._state = null, i && Xl(i, t.newLength), r.some((l) => l.type == N.time) || (this.annotations = r.concat(N.time.of(Date.now())));
  }
  static create(e, t, i, s, r, o) {
    return new N(e, t, i, s, r, o);
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
    let t = this.annotation(N.userEvent);
    return !!(t && (t == e || t.length > e.length && t.slice(0, e.length) == e && t[e.length] == "."));
  }
}
N.time = /* @__PURE__ */ xt.define();
N.userEvent = /* @__PURE__ */ xt.define();
N.addToHistory = /* @__PURE__ */ xt.define();
N.remote = /* @__PURE__ */ xt.define();
function Pc(n, e) {
  let t = [];
  for (let i = 0, s = 0; ; ) {
    let r, o;
    if (i < n.length && (s == e.length || e[s] >= n[i]))
      r = n[i++], o = n[i++];
    else if (s < e.length)
      r = e[s++], o = e[s++];
    else
      return t;
    !t.length || t[t.length - 1] < r ? t.push(r, o) : t[t.length - 1] < o && (t[t.length - 1] = o);
  }
}
function _l(n, e, t) {
  var i;
  let s, r, o;
  return t ? (s = e.changes, r = _.empty(e.changes.length), o = n.changes.compose(e.changes)) : (s = e.changes.map(n.changes), r = n.changes.mapDesc(e.changes, !0), o = n.changes.compose(s)), {
    changes: o,
    selection: e.selection ? e.selection.map(r) : (i = n.selection) === null || i === void 0 ? void 0 : i.map(s),
    effects: C.mapEffects(n.effects, s).concat(C.mapEffects(e.effects, r)),
    annotations: n.annotations.length ? n.annotations.concat(e.annotations) : e.annotations,
    scrollIntoView: n.scrollIntoView || e.scrollIntoView
  };
}
function $s(n, e, t) {
  let i = e.selection, s = Wt(e.annotations);
  return e.userEvent && (s = s.concat(N.userEvent.of(e.userEvent))), {
    changes: e.changes instanceof _ ? e.changes : _.of(e.changes || [], t, n.facet(Il)),
    selection: i && (i instanceof g ? i : g.single(i.anchor, i.head)),
    effects: Wt(e.effects),
    annotations: s,
    scrollIntoView: !!e.scrollIntoView
  };
}
function Nl(n, e, t) {
  let i = $s(n, e.length ? e[0] : {}, n.doc.length);
  e.length && e[0].filter === !1 && (t = !1);
  for (let r = 1; r < e.length; r++) {
    e[r].filter === !1 && (t = !1);
    let o = !!e[r].sequential;
    i = _l(i, $s(n, e[r], o ? i.changes.newLength : n.doc.length), o);
  }
  let s = N.create(n, i.changes, i.selection, i.effects, i.annotations, i.scrollIntoView);
  return Rc(t ? Cc(s) : s);
}
function Cc(n) {
  let e = n.startState, t = !0;
  for (let s of e.facet(zl)) {
    let r = s(n);
    if (r === !1) {
      t = !1;
      break;
    }
    Array.isArray(r) && (t = t === !0 ? r : Pc(t, r));
  }
  if (t !== !0) {
    let s, r;
    if (t === !1)
      r = n.changes.invertedDesc, s = _.empty(e.doc.length);
    else {
      let o = n.changes.filter(t);
      s = o.changes, r = o.filtered.mapDesc(o.changes).invertedDesc;
    }
    n = N.create(e, s, n.selection && n.selection.map(r), C.mapEffects(n.effects, r), n.annotations, n.scrollIntoView);
  }
  let i = e.facet(Bl);
  for (let s = i.length - 1; s >= 0; s--) {
    let r = i[s](n);
    r instanceof N ? n = r : Array.isArray(r) && r.length == 1 && r[0] instanceof N ? n = r[0] : n = Nl(e, Wt(r), !1);
  }
  return n;
}
function Rc(n) {
  let e = n.startState, t = e.facet(Gl), i = n;
  for (let s = t.length - 1; s >= 0; s--) {
    let r = t[s](n);
    r && Object.keys(r).length && (i = _l(n, $s(e, r, n.changes.newLength), !0));
  }
  return i == n ? n : N.create(e, n.changes, n.selection, i.effects, i.annotations, i.scrollIntoView);
}
const Ac = [];
function Wt(n) {
  return n == null ? Ac : Array.isArray(n) ? n : [n];
}
var se = /* @__PURE__ */ function(n) {
  return n[n.Word = 0] = "Word", n[n.Space = 1] = "Space", n[n.Other = 2] = "Other", n;
}(se || (se = {}));
const Mc = /[\u00df\u0587\u0590-\u05f4\u0600-\u06ff\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc\uac00-\ud7af]/;
let ks;
try {
  ks = /* @__PURE__ */ new RegExp("[\\p{Alphabetic}\\p{Number}_]", "u");
} catch {
}
function Wc(n) {
  if (ks)
    return ks.test(n);
  for (let e = 0; e < n.length; e++) {
    let t = n[e];
    if (/\w/.test(t) || t > "\x80" && (t.toUpperCase() != t.toLowerCase() || Mc.test(t)))
      return !0;
  }
  return !1;
}
function Zc(n) {
  return (e) => {
    if (!/\S/.test(e))
      return se.Space;
    if (Wc(e))
      return se.Word;
    for (let t = 0; t < n.length; t++)
      if (e.indexOf(n[t]) > -1)
        return se.Word;
    return se.Other;
  };
}
class Z {
  constructor(e, t, i, s, r, o) {
    this.config = e, this.doc = t, this.selection = i, this.values = s, this.status = e.statusTemplate.slice(), this.computeSlot = r, o && (o._state = this);
    for (let l = 0; l < this.config.dynamicSlots.length; l++)
      ii(this, l << 1);
    this.computeSlot = null;
  }
  field(e, t = !0) {
    let i = this.config.address[e.id];
    if (i == null) {
      if (t)
        throw new RangeError("Field is not present in this state");
      return;
    }
    return ii(this, i), Ji(this, i);
  }
  update(...e) {
    return Nl(this, e, !0);
  }
  applyTransaction(e) {
    let t = this.config, { base: i, compartments: s } = t;
    for (let o of e.effects)
      o.is(vn.reconfigure) ? (t && (s = /* @__PURE__ */ new Map(), t.compartments.forEach((l, a) => s.set(a, l)), t = null), s.set(o.value.compartment, o.value.extension)) : o.is(C.reconfigure) ? (t = null, i = o.value) : o.is(C.appendConfig) && (t = null, i = Wt(i).concat(o.value));
    let r;
    t ? r = e.startState.values.slice() : (t = Hi.resolve(i, s, this), r = new Z(t, this.doc, this.selection, t.dynamicSlots.map(() => null), (l, a) => a.reconfigure(l, this), null).values), new Z(t, e.newDoc, e.newSelection, r, (o, l) => l.update(o, e), e);
  }
  replaceSelection(e) {
    return typeof e == "string" && (e = this.toText(e)), this.changeByRange((t) => ({
      changes: { from: t.from, to: t.to, insert: e },
      range: g.cursor(t.from + e.length)
    }));
  }
  changeByRange(e) {
    let t = this.selection, i = e(t.ranges[0]), s = this.changes(i.changes), r = [i.range], o = Wt(i.effects);
    for (let l = 1; l < t.ranges.length; l++) {
      let a = e(t.ranges[l]), h = this.changes(a.changes), c = h.map(s);
      for (let u = 0; u < l; u++)
        r[u] = r[u].map(c);
      let f = s.mapDesc(h, !0);
      r.push(a.range.map(f)), s = s.compose(c), o = C.mapEffects(o, c).concat(C.mapEffects(Wt(a.effects), f));
    }
    return {
      changes: s,
      selection: g.create(r, t.mainIndex),
      effects: o
    };
  }
  changes(e = []) {
    return e instanceof _ ? e : _.of(e, this.doc.length, this.facet(Z.lineSeparator));
  }
  toText(e) {
    return D.of(e.split(this.facet(Z.lineSeparator) || Qs));
  }
  sliceDoc(e = 0, t = this.doc.length) {
    return this.doc.sliceString(e, t, this.lineBreak);
  }
  facet(e) {
    let t = this.config.address[e.id];
    return t == null ? e.default : (ii(this, t), Ji(this, t));
  }
  toJSON(e) {
    let t = {
      doc: this.sliceDoc(),
      selection: this.selection.toJSON()
    };
    if (e)
      for (let i in e) {
        let s = e[i];
        s instanceof le && this.config.address[s.id] != null && (t[i] = s.spec.toJSON(this.field(e[i]), this));
      }
    return t;
  }
  static fromJSON(e, t = {}, i) {
    if (!e || typeof e.doc != "string")
      throw new RangeError("Invalid JSON representation for EditorState");
    let s = [];
    if (i) {
      for (let r in i)
        if (Object.prototype.hasOwnProperty.call(e, r)) {
          let o = i[r], l = e[r];
          s.push(o.init((a) => o.spec.fromJSON(l, a)));
        }
    }
    return Z.create({
      doc: e.doc,
      selection: g.fromJSON(e.selection),
      extensions: t.extensions ? s.concat([t.extensions]) : s
    });
  }
  static create(e = {}) {
    let t = Hi.resolve(e.extensions || [], /* @__PURE__ */ new Map()), i = e.doc instanceof D ? e.doc : D.of((e.doc || "").split(t.staticFacet(Z.lineSeparator) || Qs)), s = e.selection ? e.selection instanceof g ? e.selection : g.single(e.selection.anchor, e.selection.head) : g.single(0);
    return Xl(s, i.length), t.staticFacet(ql) || (s = s.asSingle()), new Z(t, i, s, t.dynamicSlots.map(() => null), (r, o) => o.create(r), null);
  }
  get tabSize() {
    return this.facet(Z.tabSize);
  }
  get lineBreak() {
    return this.facet(Z.lineSeparator) || `
`;
  }
  get readOnly() {
    return this.facet(Ll);
  }
  phrase(e, ...t) {
    for (let i of this.facet(Z.phrases))
      if (Object.prototype.hasOwnProperty.call(i, e)) {
        e = i[e];
        break;
      }
    return t.length && (e = e.replace(/\$(\$|\d*)/g, (i, s) => {
      if (s == "$")
        return "$";
      let r = +(s || 1);
      return !r || r > t.length ? i : t[r - 1];
    })), e;
  }
  languageDataAt(e, t, i = -1) {
    let s = [];
    for (let r of this.facet(El))
      for (let o of r(this, t, i))
        Object.prototype.hasOwnProperty.call(o, e) && s.push(o[e]);
    return s;
  }
  charCategorizer(e) {
    return Zc(this.languageDataAt("wordChars", e).join(""));
  }
  wordAt(e) {
    let { text: t, from: i, length: s } = this.doc.lineAt(e), r = this.charCategorizer(e), o = e - i, l = e - i;
    for (; o > 0; ) {
      let a = me(t, o, !1);
      if (r(t.slice(a, o)) != se.Word)
        break;
      o = a;
    }
    for (; l < s; ) {
      let a = me(t, l);
      if (r(t.slice(l, a)) != se.Word)
        break;
      l = a;
    }
    return o == l ? null : g.range(o + i, l + i);
  }
}
Z.allowMultipleSelections = ql;
Z.tabSize = /* @__PURE__ */ x.define({
  combine: (n) => n.length ? n[0] : 4
});
Z.lineSeparator = Il;
Z.readOnly = Ll;
Z.phrases = /* @__PURE__ */ x.define({
  compare(n, e) {
    let t = Object.keys(n), i = Object.keys(e);
    return t.length == i.length && t.every((s) => n[s] == e[s]);
  }
});
Z.languageData = El;
Z.changeFilter = zl;
Z.transactionFilter = Bl;
Z.transactionExtender = Gl;
vn.reconfigure = /* @__PURE__ */ C.define();
function $t(n, e, t = {}) {
  let i = {};
  for (let s of n)
    for (let r of Object.keys(s)) {
      let o = s[r], l = i[r];
      if (l === void 0)
        i[r] = o;
      else if (!(l === o || o === void 0))
        if (Object.hasOwnProperty.call(t, r))
          i[r] = t[r](l, o);
        else
          throw new Error("Config merge conflict for field " + r);
    }
  for (let s in e)
    i[s] === void 0 && (i[s] = e[s]);
  return i;
}
class yt {
  eq(e) {
    return this == e;
  }
  range(e, t = e) {
    return ai.create(e, t, this);
  }
}
yt.prototype.startSide = yt.prototype.endSide = 0;
yt.prototype.point = !1;
yt.prototype.mapMode = ne.TrackDel;
class ai {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.value = i;
  }
  static create(e, t, i) {
    return new ai(e, t, i);
  }
}
function ws(n, e) {
  return n.from - e.from || n.value.startSide - e.value.startSide;
}
class lr {
  constructor(e, t, i, s) {
    this.from = e, this.to = t, this.value = i, this.maxPoint = s;
  }
  get length() {
    return this.to[this.to.length - 1];
  }
  findIndex(e, t, i, s = 0) {
    let r = i ? this.to : this.from;
    for (let o = s, l = r.length; ; ) {
      if (o == l)
        return o;
      let a = o + l >> 1, h = r[a] - e || (i ? this.value[a].endSide : this.value[a].startSide) - t;
      if (a == o)
        return h >= 0 ? o : l;
      h >= 0 ? l = a : o = a + 1;
    }
  }
  between(e, t, i, s) {
    for (let r = this.findIndex(t, -1e9, !0), o = this.findIndex(i, 1e9, !1, r); r < o; r++)
      if (s(this.from[r] + e, this.to[r] + e, this.value[r]) === !1)
        return !1;
  }
  map(e, t) {
    let i = [], s = [], r = [], o = -1, l = -1;
    for (let a = 0; a < this.value.length; a++) {
      let h = this.value[a], c = this.from[a] + e, f = this.to[a] + e, u, d;
      if (c == f) {
        let O = t.mapPos(c, h.startSide, h.mapMode);
        if (O == null || (u = d = O, h.startSide != h.endSide && (d = t.mapPos(c, h.endSide), d < u)))
          continue;
      } else if (u = t.mapPos(c, h.startSide), d = t.mapPos(f, h.endSide), u > d || u == d && h.startSide > 0 && h.endSide <= 0)
        continue;
      (d - u || h.endSide - h.startSide) < 0 || (o < 0 && (o = u), h.point && (l = Math.max(l, d - u)), i.push(h), s.push(u - o), r.push(d - o));
    }
    return { mapped: i.length ? new lr(s, r, i, l) : null, pos: o };
  }
}
class j {
  constructor(e, t, i, s) {
    this.chunkPos = e, this.chunk = t, this.nextLayer = i, this.maxPoint = s;
  }
  static create(e, t, i, s) {
    return new j(e, t, i, s);
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
    let { add: t = [], sort: i = !1, filterFrom: s = 0, filterTo: r = this.length } = e, o = e.filter;
    if (t.length == 0 && !o)
      return this;
    if (i && (t = t.slice().sort(ws)), this.isEmpty)
      return t.length ? j.of(t) : this;
    let l = new Vl(this, null, -1).goto(0), a = 0, h = [], c = new ot();
    for (; l.value || a < t.length; )
      if (a < t.length && (l.from - t[a].from || l.startSide - t[a].value.startSide) >= 0) {
        let f = t[a++];
        c.addInner(f.from, f.to, f.value) || h.push(f);
      } else
        l.rangeIndex == 1 && l.chunkIndex < this.chunk.length && (a == t.length || this.chunkEnd(l.chunkIndex) < t[a].from) && (!o || s > this.chunkEnd(l.chunkIndex) || r < this.chunkPos[l.chunkIndex]) && c.addChunk(this.chunkPos[l.chunkIndex], this.chunk[l.chunkIndex]) ? l.nextChunk() : ((!o || s > l.to || r < l.from || o(l.from, l.to, l.value)) && (c.addInner(l.from, l.to, l.value) || h.push(ai.create(l.from, l.to, l.value))), l.next());
    return c.finishInner(this.nextLayer.isEmpty && !h.length ? j.empty : this.nextLayer.update({ add: h, filter: o, filterFrom: s, filterTo: r }));
  }
  map(e) {
    if (e.empty || this.isEmpty)
      return this;
    let t = [], i = [], s = -1;
    for (let o = 0; o < this.chunk.length; o++) {
      let l = this.chunkPos[o], a = this.chunk[o], h = e.touchesRange(l, l + a.length);
      if (h === !1)
        s = Math.max(s, a.maxPoint), t.push(a), i.push(e.mapPos(l));
      else if (h === !0) {
        let { mapped: c, pos: f } = a.map(l, e);
        c && (s = Math.max(s, c.maxPoint), t.push(c), i.push(f));
      }
    }
    let r = this.nextLayer.map(e);
    return t.length == 0 ? r : new j(i, t, r || j.empty, s);
  }
  between(e, t, i) {
    if (!this.isEmpty) {
      for (let s = 0; s < this.chunk.length; s++) {
        let r = this.chunkPos[s], o = this.chunk[s];
        if (t >= r && e <= r + o.length && o.between(r, e - r, t - r, i) === !1)
          return;
      }
      this.nextLayer.between(e, t, i);
    }
  }
  iter(e = 0) {
    return hi.from([this]).goto(e);
  }
  get isEmpty() {
    return this.nextLayer == this;
  }
  static iter(e, t = 0) {
    return hi.from(e).goto(t);
  }
  static compare(e, t, i, s, r = -1) {
    let o = e.filter((f) => f.maxPoint > 0 || !f.isEmpty && f.maxPoint >= r), l = t.filter((f) => f.maxPoint > 0 || !f.isEmpty && f.maxPoint >= r), a = Ir(o, l, i), h = new Vt(o, a, r), c = new Vt(l, a, r);
    i.iterGaps((f, u, d) => zr(h, f, c, u, d, s)), i.empty && i.length == 0 && zr(h, 0, c, 0, 0, s);
  }
  static eq(e, t, i = 0, s) {
    s == null && (s = 1e9);
    let r = e.filter((c) => !c.isEmpty && t.indexOf(c) < 0), o = t.filter((c) => !c.isEmpty && e.indexOf(c) < 0);
    if (r.length != o.length)
      return !1;
    if (!r.length)
      return !0;
    let l = Ir(r, o), a = new Vt(r, l, 0).goto(i), h = new Vt(o, l, 0).goto(i);
    for (; ; ) {
      if (a.to != h.to || !Ts(a.active, h.active) || a.point && (!h.point || !a.point.eq(h.point)))
        return !1;
      if (a.to > s)
        return !0;
      a.next(), h.next();
    }
  }
  static spans(e, t, i, s, r = -1) {
    let o = new Vt(e, null, r).goto(t), l = t, a = o.openStart;
    for (; ; ) {
      let h = Math.min(o.to, i);
      if (o.point ? (s.point(l, h, o.point, o.activeForPoint(o.to), a, o.pointRank), a = o.openEnd(h) + (o.to > h ? 1 : 0)) : h > l && (s.span(l, h, o.active, a), a = o.openEnd(h)), o.to > i)
        break;
      l = o.to, o.next();
    }
    return a;
  }
  static of(e, t = !1) {
    let i = new ot();
    for (let s of e instanceof ai ? [e] : t ? Dc(e) : e)
      i.add(s.from, s.to, s.value);
    return i.finish();
  }
}
j.empty = /* @__PURE__ */ new j([], [], null, -1);
function Dc(n) {
  if (n.length > 1)
    for (let e = n[0], t = 1; t < n.length; t++) {
      let i = n[t];
      if (ws(e, i) > 0)
        return n.slice().sort(ws);
      e = i;
    }
  return n;
}
j.empty.nextLayer = j.empty;
class ot {
  constructor() {
    this.chunks = [], this.chunkPos = [], this.chunkStart = -1, this.last = null, this.lastFrom = -1e9, this.lastTo = -1e9, this.from = [], this.to = [], this.value = [], this.maxPoint = -1, this.setMaxPoint = -1, this.nextLayer = null;
  }
  finishChunk(e) {
    this.chunks.push(new lr(this.from, this.to, this.value, this.maxPoint)), this.chunkPos.push(this.chunkStart), this.chunkStart = -1, this.setMaxPoint = Math.max(this.setMaxPoint, this.maxPoint), this.maxPoint = -1, e && (this.from = [], this.to = [], this.value = []);
  }
  add(e, t, i) {
    this.addInner(e, t, i) || (this.nextLayer || (this.nextLayer = new ot())).add(e, t, i);
  }
  addInner(e, t, i) {
    let s = e - this.lastTo || i.startSide - this.last.endSide;
    if (s <= 0 && (e - this.lastFrom || i.startSide - this.last.startSide) < 0)
      throw new Error("Ranges must be added sorted by `from` position and `startSide`");
    return s < 0 ? !1 : (this.from.length == 250 && this.finishChunk(!0), this.chunkStart < 0 && (this.chunkStart = e), this.from.push(e - this.chunkStart), this.to.push(t - this.chunkStart), this.last = i, this.lastFrom = e, this.lastTo = t, this.value.push(i), i.point && (this.maxPoint = Math.max(this.maxPoint, t - e)), !0);
  }
  addChunk(e, t) {
    if ((e - this.lastTo || t.value[0].startSide - this.last.endSide) < 0)
      return !1;
    this.from.length && this.finishChunk(!0), this.setMaxPoint = Math.max(this.setMaxPoint, t.maxPoint), this.chunks.push(t), this.chunkPos.push(e);
    let i = t.value.length - 1;
    return this.last = t.value[i], this.lastFrom = t.from[i] + e, this.lastTo = t.to[i] + e, !0;
  }
  finish() {
    return this.finishInner(j.empty);
  }
  finishInner(e) {
    if (this.from.length && this.finishChunk(!1), this.chunks.length == 0)
      return e;
    let t = j.create(this.chunkPos, this.chunks, this.nextLayer ? this.nextLayer.finishInner(e) : e, this.setMaxPoint);
    return this.from = null, t;
  }
}
function Ir(n, e, t) {
  let i = /* @__PURE__ */ new Map();
  for (let r of n)
    for (let o = 0; o < r.chunk.length; o++)
      r.chunk[o].maxPoint <= 0 && i.set(r.chunk[o], r.chunkPos[o]);
  let s = /* @__PURE__ */ new Set();
  for (let r of e)
    for (let o = 0; o < r.chunk.length; o++) {
      let l = i.get(r.chunk[o]);
      l != null && (t ? t.mapPos(l) : l) == r.chunkPos[o] && !(t != null && t.touchesRange(l, l + r.chunk[o].length)) && s.add(r.chunk[o]);
    }
  return s;
}
class Vl {
  constructor(e, t, i, s = 0) {
    this.layer = e, this.skip = t, this.minPoint = i, this.rank = s;
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
      let s = this.layer.chunk[this.chunkIndex];
      if (!(this.skip && this.skip.has(s) || this.layer.chunkEnd(this.chunkIndex) < e || s.maxPoint < this.minPoint))
        break;
      this.chunkIndex++, i = !1;
    }
    if (this.chunkIndex < this.layer.chunk.length) {
      let s = this.layer.chunk[this.chunkIndex].findIndex(e - this.layer.chunkPos[this.chunkIndex], t, !0);
      (!i || this.rangeIndex < s) && this.setRangeIndex(s);
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
class hi {
  constructor(e) {
    this.heap = e;
  }
  static from(e, t = null, i = -1) {
    let s = [];
    for (let r = 0; r < e.length; r++)
      for (let o = e[r]; !o.isEmpty; o = o.nextLayer)
        o.maxPoint >= i && s.push(new Vl(o, t, i, r));
    return s.length == 1 ? s[0] : new hi(s);
  }
  get startSide() {
    return this.value ? this.value.startSide : 0;
  }
  goto(e, t = -1e9) {
    for (let i of this.heap)
      i.goto(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      _n(this.heap, i);
    return this.next(), this;
  }
  forward(e, t) {
    for (let i of this.heap)
      i.forward(e, t);
    for (let i = this.heap.length >> 1; i >= 0; i--)
      _n(this.heap, i);
    (this.to - e || this.value.endSide - t) < 0 && this.next();
  }
  next() {
    if (this.heap.length == 0)
      this.from = this.to = 1e9, this.value = null, this.rank = -1;
    else {
      let e = this.heap[0];
      this.from = e.from, this.to = e.to, this.value = e.value, this.rank = e.rank, e.value && e.next(), _n(this.heap, 0);
    }
  }
}
function _n(n, e) {
  for (let t = n[e]; ; ) {
    let i = (e << 1) + 1;
    if (i >= n.length)
      break;
    let s = n[i];
    if (i + 1 < n.length && s.compare(n[i + 1]) >= 0 && (s = n[i + 1], i++), t.compare(s) < 0)
      break;
    n[i] = t, n[e] = s, e = i;
  }
}
class Vt {
  constructor(e, t, i) {
    this.minPoint = i, this.active = [], this.activeTo = [], this.activeRank = [], this.minActive = -1, this.point = null, this.pointFrom = 0, this.pointRank = 0, this.to = -1e9, this.endSide = 0, this.openStart = -1, this.cursor = hi.from(e, t, i);
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
    ki(this.active, e), ki(this.activeTo, e), ki(this.activeRank, e), this.minActive = Br(this.active, this.activeTo);
  }
  addActive(e) {
    let t = 0, { value: i, to: s, rank: r } = this.cursor;
    for (; t < this.activeRank.length && this.activeRank[t] <= r; )
      t++;
    wi(this.active, t, i), wi(this.activeTo, t, s), wi(this.activeRank, t, r), e && wi(e, t, this.cursor.from), this.minActive = Br(this.active, this.activeTo);
  }
  next() {
    let e = this.to, t = this.point;
    this.point = null;
    let i = this.openStart < 0 ? [] : null, s = 0;
    for (; ; ) {
      let r = this.minActive;
      if (r > -1 && (this.activeTo[r] - this.cursor.from || this.active[r].endSide - this.cursor.startSide) < 0) {
        if (this.activeTo[r] > e) {
          this.to = this.activeTo[r], this.endSide = this.active[r].endSide;
          break;
        }
        this.removeActive(r), i && ki(i, r);
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
            this.point = o, this.pointFrom = this.cursor.from, this.pointRank = this.cursor.rank, this.to = this.cursor.to, this.endSide = o.endSide, this.cursor.from < e && (s = 1), this.cursor.next(), this.forward(this.to, this.endSide);
            break;
          }
        }
      else {
        this.to = this.endSide = 1e9;
        break;
      }
    }
    if (i) {
      let r = 0;
      for (; r < i.length && i[r] < e; )
        r++;
      this.openStart = r + s;
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
function zr(n, e, t, i, s, r) {
  n.goto(e), t.goto(i);
  let o = i + s, l = i, a = i - e;
  for (; ; ) {
    let h = n.to + a - t.to || n.endSide - t.endSide, c = h < 0 ? n.to + a : t.to, f = Math.min(c, o);
    if (n.point || t.point ? n.point && t.point && (n.point == t.point || n.point.eq(t.point)) && Ts(n.activeForPoint(n.to + a), t.activeForPoint(t.to)) || r.comparePoint(l, f, n.point, t.point) : f > l && !Ts(n.active, t.active) && r.compareRange(l, f, n.active, t.active), c > o)
      break;
    l = c, h <= 0 && n.next(), h >= 0 && t.next();
  }
}
function Ts(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++)
    if (n[t] != e[t] && !n[t].eq(e[t]))
      return !1;
  return !0;
}
function ki(n, e) {
  for (let t = e, i = n.length - 1; t < i; t++)
    n[t] = n[t + 1];
  n.pop();
}
function wi(n, e, t) {
  for (let i = n.length - 1; i >= e; i--)
    n[i + 1] = n[i];
  n[e] = t;
}
function Br(n, e) {
  let t = -1, i = 1e9;
  for (let s = 0; s < e.length; s++)
    (e[s] - i || n[s].endSide - n[t].endSide) < 0 && (t = s, i = e[s]);
  return t;
}
function Pn(n, e, t = n.length) {
  let i = 0;
  for (let s = 0; s < t; )
    n.charCodeAt(s) == 9 ? (i += e - i % e, s++) : (i++, s = me(n, s));
  return i;
}
function Xc(n, e, t, i) {
  for (let s = 0, r = 0; ; ) {
    if (r >= e)
      return s;
    if (s == n.length)
      break;
    r += n.charCodeAt(s) == 9 ? t - r % t : 1, s = me(n, s);
  }
  return i === !0 ? -1 : n.length;
}
const vs = "\u037C", Gr = typeof Symbol > "u" ? "__" + vs : Symbol.for(vs), Ps = typeof Symbol > "u" ? "__styleSet" + Math.floor(Math.random() * 1e8) : Symbol("styleSet"), Lr = typeof globalThis < "u" ? globalThis : typeof window < "u" ? window : {};
class lt {
  constructor(e, t) {
    this.rules = [];
    let { finish: i } = t || {};
    function s(o) {
      return /^@/.test(o) ? [o] : o.split(/,\s*/);
    }
    function r(o, l, a, h) {
      let c = [], f = /^@(\w+)\b/.exec(o[0]), u = f && f[1] == "keyframes";
      if (f && l == null)
        return a.push(o[0] + ";");
      for (let d in l) {
        let O = l[d];
        if (/&/.test(d))
          r(
            d.split(/,\s*/).map((m) => o.map((Q) => m.replace(/&/, Q))).reduce((m, Q) => m.concat(Q)),
            O,
            a
          );
        else if (O && typeof O == "object") {
          if (!f)
            throw new RangeError("The value of a property (" + d + ") should be a primitive value.");
          r(s(d), O, c, u);
        } else
          O != null && c.push(d.replace(/_.*/, "").replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()) + ": " + O + ";");
      }
      (c.length || u) && a.push((i && !f && !h ? o.map(i) : o).join(", ") + " {" + c.join(" ") + "}");
    }
    for (let o in e)
      r(s(o), e[o], this.rules);
  }
  getRules() {
    return this.rules.join(`
`);
  }
  static newName() {
    let e = Lr[Gr] || 1;
    return Lr[Gr] = e + 1, vs + e.toString(36);
  }
  static mount(e, t) {
    (e[Ps] || new jc(e)).mount(Array.isArray(t) ? t : [t]);
  }
}
let Ti = null;
class jc {
  constructor(e) {
    if (!e.head && e.adoptedStyleSheets && typeof CSSStyleSheet < "u") {
      if (Ti)
        return e.adoptedStyleSheets = [Ti.sheet].concat(e.adoptedStyleSheets), e[Ps] = Ti;
      this.sheet = new CSSStyleSheet(), e.adoptedStyleSheets = [this.sheet].concat(e.adoptedStyleSheets), Ti = this;
    } else {
      this.styleTag = (e.ownerDocument || e).createElement("style");
      let t = e.head || e;
      t.insertBefore(this.styleTag, t.firstChild);
    }
    this.modules = [], e[Ps] = this;
  }
  mount(e) {
    let t = this.sheet, i = 0, s = 0;
    for (let r = 0; r < e.length; r++) {
      let o = e[r], l = this.modules.indexOf(o);
      if (l < s && l > -1 && (this.modules.splice(l, 1), s--, l = -1), l == -1) {
        if (this.modules.splice(s++, 0, o), t)
          for (let a = 0; a < o.rules.length; a++)
            t.insertRule(o.rules[a], i++);
      } else {
        for (; s < l; )
          i += this.modules[s++].rules.length;
        i += o.rules.length, s++;
      }
    }
    if (!t) {
      let r = "";
      for (let o = 0; o < this.modules.length; o++)
        r += this.modules[o].getRules() + `
`;
      this.styleTag.textContent = r;
    }
  }
}
var at = {
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
}, Xt = {
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
}, _r = typeof navigator < "u" && /Chrome\/(\d+)/.exec(navigator.userAgent), Ec = typeof navigator < "u" && /Apple Computer/.test(navigator.vendor), qc = typeof navigator < "u" && /Gecko\/\d+/.test(navigator.userAgent), Nr = typeof navigator < "u" && /Mac/.test(navigator.platform), Ic = typeof navigator < "u" && /MSIE \d|Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(navigator.userAgent), zc = _r && (Nr || +_r[1] < 57) || qc && Nr;
for (var ee = 0; ee < 10; ee++)
  at[48 + ee] = at[96 + ee] = String(ee);
for (var ee = 1; ee <= 24; ee++)
  at[ee + 111] = "F" + ee;
for (var ee = 65; ee <= 90; ee++)
  at[ee] = String.fromCharCode(ee + 32), Xt[ee] = String.fromCharCode(ee);
for (var Nn in at)
  Xt.hasOwnProperty(Nn) || (Xt[Nn] = at[Nn]);
function Bc(n) {
  var e = zc && (n.ctrlKey || n.altKey || n.metaKey) || (Ec || Ic) && n.shiftKey && n.key && n.key.length == 1 || n.key == "Unidentified", t = !e && n.key || (n.shiftKey ? Xt : at)[n.keyCode] || n.key || "Unidentified";
  return t == "Esc" && (t = "Escape"), t == "Del" && (t = "Delete"), t == "Left" && (t = "ArrowLeft"), t == "Up" && (t = "ArrowUp"), t == "Right" && (t = "ArrowRight"), t == "Down" && (t = "ArrowDown"), t;
}
function Ki(n) {
  let e;
  return n.nodeType == 11 ? e = n.getSelection ? n : n.ownerDocument : e = n, e.getSelection();
}
function jt(n, e) {
  return e ? n == e || n.contains(e.nodeType != 1 ? e.parentNode : e) : !1;
}
function Gc() {
  let n = document.activeElement;
  for (; n && n.shadowRoot; )
    n = n.shadowRoot.activeElement;
  return n;
}
function Li(n, e) {
  if (!e.anchorNode)
    return !1;
  try {
    return jt(n, e.anchorNode);
  } catch {
    return !1;
  }
}
function ci(n) {
  return n.nodeType == 3 ? Et(n, 0, n.nodeValue.length).getClientRects() : n.nodeType == 1 ? n.getClientRects() : [];
}
function en(n, e, t, i) {
  return t ? Vr(n, e, t, i, -1) || Vr(n, e, t, i, 1) : !1;
}
function tn(n) {
  for (var e = 0; ; e++)
    if (n = n.previousSibling, !n)
      return e;
}
function Vr(n, e, t, i, s) {
  for (; ; ) {
    if (n == t && e == i)
      return !0;
    if (e == (s < 0 ? 0 : fi(n))) {
      if (n.nodeName == "DIV")
        return !1;
      let r = n.parentNode;
      if (!r || r.nodeType != 1)
        return !1;
      e = tn(n) + (s < 0 ? 0 : 1), n = r;
    } else if (n.nodeType == 1) {
      if (n = n.childNodes[e + (s < 0 ? -1 : 0)], n.nodeType == 1 && n.contentEditable == "false")
        return !1;
      e = s < 0 ? fi(n) : 0;
    } else
      return !1;
  }
}
function fi(n) {
  return n.nodeType == 3 ? n.nodeValue.length : n.childNodes.length;
}
const Ul = { left: 0, right: 0, top: 0, bottom: 0 };
function Cn(n, e) {
  let t = e ? n.left : n.right;
  return { left: t, right: t, top: n.top, bottom: n.bottom };
}
function Lc(n) {
  return {
    left: 0,
    right: n.innerWidth,
    top: 0,
    bottom: n.innerHeight
  };
}
function _c(n, e, t, i, s, r, o, l) {
  let a = n.ownerDocument, h = a.defaultView;
  for (let c = n; c; )
    if (c.nodeType == 1) {
      let f, u = c == a.body;
      if (u)
        f = Lc(h);
      else {
        if (c.scrollHeight <= c.clientHeight && c.scrollWidth <= c.clientWidth) {
          c = c.parentNode;
          continue;
        }
        let m = c.getBoundingClientRect();
        f = {
          left: m.left,
          right: m.left + c.clientWidth,
          top: m.top,
          bottom: m.top + c.clientHeight
        };
      }
      let d = 0, O = 0;
      if (s == "nearest")
        e.top < f.top ? (O = -(f.top - e.top + o), t > 0 && e.bottom > f.bottom + O && (O = e.bottom - f.bottom + O + o)) : e.bottom > f.bottom && (O = e.bottom - f.bottom + o, t < 0 && e.top - O < f.top && (O = -(f.top + O - e.top + o)));
      else {
        let m = e.bottom - e.top, Q = f.bottom - f.top;
        O = (s == "center" && m <= Q ? e.top + m / 2 - Q / 2 : s == "start" || s == "center" && t < 0 ? e.top - o : e.bottom - Q + o) - f.top;
      }
      if (i == "nearest" ? e.left < f.left ? (d = -(f.left - e.left + r), t > 0 && e.right > f.right + d && (d = e.right - f.right + d + r)) : e.right > f.right && (d = e.right - f.right + r, t < 0 && e.left < f.left + d && (d = -(f.left + d - e.left + r))) : d = (i == "center" ? e.left + (e.right - e.left) / 2 - (f.right - f.left) / 2 : i == "start" == l ? e.left - r : e.right - (f.right - f.left) + r) - f.left, d || O)
        if (u)
          h.scrollBy(d, O);
        else {
          if (O) {
            let m = c.scrollTop;
            c.scrollTop += O, O = c.scrollTop - m;
          }
          if (d) {
            let m = c.scrollLeft;
            c.scrollLeft += d, d = c.scrollLeft - m;
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
      c = c.assignedSlot || c.parentNode, i = s = "nearest";
    } else if (c.nodeType == 11)
      c = c.host;
    else
      break;
}
class Nc {
  constructor() {
    this.anchorNode = null, this.anchorOffset = 0, this.focusNode = null, this.focusOffset = 0;
  }
  eq(e) {
    return this.anchorNode == e.anchorNode && this.anchorOffset == e.anchorOffset && this.focusNode == e.focusNode && this.focusOffset == e.focusOffset;
  }
  setRange(e) {
    this.set(e.anchorNode, e.anchorOffset, e.focusNode, e.focusOffset);
  }
  set(e, t, i, s) {
    this.anchorNode = e, this.anchorOffset = t, this.focusNode = i, this.focusOffset = s;
  }
}
let vt = null;
function Fl(n) {
  if (n.setActive)
    return n.setActive();
  if (vt)
    return n.focus(vt);
  let e = [];
  for (let t = n; t && (e.push(t, t.scrollTop, t.scrollLeft), t != t.ownerDocument); t = t.parentNode)
    ;
  if (n.focus(vt == null ? {
    get preventScroll() {
      return vt = { preventScroll: !0 }, !0;
    }
  } : void 0), !vt) {
    vt = !1;
    for (let t = 0; t < e.length; ) {
      let i = e[t++], s = e[t++], r = e[t++];
      i.scrollTop != s && (i.scrollTop = s), i.scrollLeft != r && (i.scrollLeft = r);
    }
  }
}
let Ur;
function Et(n, e, t = e) {
  let i = Ur || (Ur = document.createRange());
  return i.setEnd(n, t), i.setStart(n, e), i;
}
function ni(n, e, t) {
  let i = { key: e, code: e, keyCode: t, which: t, cancelable: !0 }, s = new KeyboardEvent("keydown", i);
  s.synthetic = !0, n.dispatchEvent(s);
  let r = new KeyboardEvent("keyup", i);
  return r.synthetic = !0, n.dispatchEvent(r), s.defaultPrevented || r.defaultPrevented;
}
function Vc(n) {
  for (; n; ) {
    if (n && (n.nodeType == 9 || n.nodeType == 11 && n.host))
      return n;
    n = n.assignedSlot || n.parentNode;
  }
  return null;
}
function Yl(n) {
  for (; n.attributes.length; )
    n.removeAttributeNode(n.attributes[0]);
}
function Uc(n, e) {
  let t = e.focusNode, i = e.focusOffset;
  if (!t || e.anchorNode != t || e.anchorOffset != i)
    return !1;
  for (; ; )
    if (i) {
      if (t.nodeType != 1)
        return !1;
      let s = t.childNodes[i - 1];
      s.contentEditable == "false" ? i-- : (t = s, i = fi(t));
    } else {
      if (t == n)
        return !0;
      i = tn(t), t = t.parentNode;
    }
}
class te {
  constructor(e, t, i = !0) {
    this.node = e, this.offset = t, this.precise = i;
  }
  static before(e, t) {
    return new te(e.parentNode, tn(e), t);
  }
  static after(e, t) {
    return new te(e.parentNode, tn(e) + 1, t);
  }
}
const ar = [];
class q {
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
      let t = this.dom, i = null, s;
      for (let r of this.children) {
        if (r.dirty) {
          if (!r.dom && (s = i ? i.nextSibling : t.firstChild)) {
            let o = q.get(s);
            (!o || !o.parent && o.constructor == r.constructor) && r.reuseDOM(s);
          }
          r.sync(e), r.dirty = 0;
        }
        if (s = i ? i.nextSibling : t.firstChild, e && !e.written && e.node == t && s != r.dom && (e.written = !0), r.dom.parentNode == t)
          for (; s && s != r.dom; )
            s = Fr(s);
        else
          t.insertBefore(r.dom, s);
        i = r.dom;
      }
      for (s = i ? i.nextSibling : t.firstChild, s && e && e.node == t && (e.written = !0); s; )
        s = Fr(s);
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
      let s = fi(e) == 0 ? 0 : t == 0 ? -1 : 1;
      for (; ; ) {
        let r = e.parentNode;
        if (r == this.dom)
          break;
        s == 0 && r.firstChild != r.lastChild && (e == r.firstChild ? s = -1 : s = 1), e = r;
      }
      s < 0 ? i = e : i = e.nextSibling;
    }
    if (i == this.dom.firstChild)
      return 0;
    for (; i && !q.get(i); )
      i = i.nextSibling;
    if (!i)
      return this.length;
    for (let s = 0, r = 0; ; s++) {
      let o = this.children[s];
      if (o.dom == i)
        return r;
      r += o.length + o.breakAfter;
    }
  }
  domBoundsAround(e, t, i = 0) {
    let s = -1, r = -1, o = -1, l = -1;
    for (let a = 0, h = i, c = i; a < this.children.length; a++) {
      let f = this.children[a], u = h + f.length;
      if (h < e && u > t)
        return f.domBoundsAround(e, t, h);
      if (u >= e && s == -1 && (s = a, r = h), h > t && f.dom.parentNode == this.dom) {
        o = a, l = c;
        break;
      }
      c = u, h = u + f.breakAfter;
    }
    return {
      from: r,
      to: l < 0 ? i + this.length : l,
      startDOM: (s ? this.children[s - 1].dom.nextSibling : null) || this.dom.firstChild,
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
  replaceChildren(e, t, i = ar) {
    this.markDirty();
    for (let s = e; s < t; s++) {
      let r = this.children[s];
      r.parent == this && r.destroy();
    }
    this.children.splice(e, t - e, ...i);
    for (let s = 0; s < i.length; s++)
      i[s].setParent(this);
  }
  ignoreMutation(e) {
    return !1;
  }
  ignoreEvent(e) {
    return !1;
  }
  childCursor(e = this.length) {
    return new Hl(this.children, e, this.children.length);
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
  merge(e, t, i, s, r, o) {
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
q.prototype.breakAfter = 0;
function Fr(n) {
  let e = n.nextSibling;
  return n.parentNode.removeChild(n), e;
}
class Hl {
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
function Jl(n, e, t, i, s, r, o, l, a) {
  let { children: h } = n, c = h.length ? h[e] : null, f = r.length ? r[r.length - 1] : null, u = f ? f.breakAfter : o;
  if (!(e == i && c && !o && !u && r.length < 2 && c.merge(t, s, r.length ? f : null, t == 0, l, a))) {
    if (i < h.length) {
      let d = h[i];
      d && s < d.length ? (e == i && (d = d.split(s), s = 0), !u && f && d.merge(0, s, f, !0, 0, a) ? r[r.length - 1] = d : (s && d.merge(0, s, null, !1, 0, a), r.push(d))) : d != null && d.breakAfter && (f ? f.breakAfter = 1 : o = 1), i++;
    }
    for (c && (c.breakAfter = o, t > 0 && (!o && r.length && c.merge(t, c.length, r[0], !1, l, 0) ? c.breakAfter = r.shift().breakAfter : (t < c.length || c.children.length && c.children[c.children.length - 1].length == 0) && c.merge(t, c.length, null, !1, l, 0), e++)); e < i && r.length; )
      if (h[i - 1].become(r[r.length - 1]))
        i--, r.pop(), a = r.length ? 0 : l;
      else if (h[e].become(r[0]))
        e++, r.shift(), l = r.length ? 0 : a;
      else
        break;
    !r.length && e && i < h.length && !h[e - 1].breakAfter && h[i].merge(0, 0, h[e - 1], !1, l, a) && e--, (e < i || r.length) && n.replaceChildren(e, i, r);
  }
}
function Kl(n, e, t, i, s, r) {
  let o = n.childCursor(), { i: l, off: a } = o.findPos(t, 1), { i: h, off: c } = o.findPos(e, -1), f = e - t;
  for (let u of i)
    f += u.length;
  n.length += f, Jl(n, h, c, l, a, i, 0, s, r);
}
let ge = typeof navigator < "u" ? navigator : { userAgent: "", vendor: "", platform: "" }, Cs = typeof document < "u" ? document : { documentElement: { style: {} } };
const Rs = /* @__PURE__ */ /Edge\/(\d+)/.exec(ge.userAgent), ea = /* @__PURE__ */ /MSIE \d/.test(ge.userAgent), As = /* @__PURE__ */ /Trident\/(?:[7-9]|\d{2,})\..*rv:(\d+)/.exec(ge.userAgent), Rn = !!(ea || As || Rs), Yr = !Rn && /* @__PURE__ */ /gecko\/(\d+)/i.test(ge.userAgent), Vn = !Rn && /* @__PURE__ */ /Chrome\/(\d+)/.exec(ge.userAgent), Hr = "webkitFontSmoothing" in Cs.documentElement.style, ta = !Rn && /* @__PURE__ */ /Apple Computer/.test(ge.vendor), Jr = ta && (/* @__PURE__ */ /Mobile\/\w+/.test(ge.userAgent) || ge.maxTouchPoints > 2);
var b = {
  mac: Jr || /* @__PURE__ */ /Mac/.test(ge.platform),
  windows: /* @__PURE__ */ /Win/.test(ge.platform),
  linux: /* @__PURE__ */ /Linux|X11/.test(ge.platform),
  ie: Rn,
  ie_version: ea ? Cs.documentMode || 6 : As ? +As[1] : Rs ? +Rs[1] : 0,
  gecko: Yr,
  gecko_version: Yr ? +(/* @__PURE__ */ /Firefox\/(\d+)/.exec(ge.userAgent) || [0, 0])[1] : 0,
  chrome: !!Vn,
  chrome_version: Vn ? +Vn[1] : 0,
  ios: Jr,
  android: /* @__PURE__ */ /Android\b/.test(ge.userAgent),
  webkit: Hr,
  safari: ta,
  webkit_version: Hr ? +(/* @__PURE__ */ /\bAppleWebKit\/(\d+)/.exec(navigator.userAgent) || [0, 0])[1] : 0,
  tabSize: Cs.documentElement.style.tabSize != null ? "tab-size" : "-moz-tab-size"
};
const Fc = 256;
class ht extends q {
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
    return i && (!(i instanceof ht) || this.length - (t - e) + i.length > Fc) ? !1 : (this.text = this.text.slice(0, e) + (i ? i.text : "") + this.text.slice(t), this.markDirty(), !0);
  }
  split(e) {
    let t = new ht(this.text.slice(e));
    return this.text = this.text.slice(0, e), this.markDirty(), t;
  }
  localPosFromDOM(e, t) {
    return e == this.dom ? t : t ? this.text.length : 0;
  }
  domAtPos(e) {
    return new te(this.dom, e);
  }
  domBoundsAround(e, t, i) {
    return { from: i, to: i + this.length, startDOM: this.dom, endDOM: this.dom.nextSibling };
  }
  coordsAt(e, t) {
    return Ms(this.dom, e, t);
  }
}
class qe extends q {
  constructor(e, t = [], i = 0) {
    super(), this.mark = e, this.children = t, this.length = i;
    for (let s of t)
      s.setParent(this);
  }
  setAttrs(e) {
    if (Yl(e), this.mark.class && (e.className = this.mark.class), this.mark.attrs)
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
  merge(e, t, i, s, r, o) {
    return i && (!(i instanceof qe && i.mark.eq(this.mark)) || e && r <= 0 || t < this.length && o <= 0) ? !1 : (Kl(this, e, t, i ? i.children : [], r - 1, o - 1), this.markDirty(), !0);
  }
  split(e) {
    let t = [], i = 0, s = -1, r = 0;
    for (let l of this.children) {
      let a = i + l.length;
      a > e && t.push(i < e ? l.split(e - i) : l), s < 0 && i >= e && (s = r), i = a, r++;
    }
    let o = this.length - e;
    return this.length = e, s > -1 && (this.children.length = s, this.markDirty()), new qe(this.mark, t, o);
  }
  domAtPos(e) {
    return sa(this.dom, this.children, e);
  }
  coordsAt(e, t) {
    return oa(this, e, t);
  }
}
function Ms(n, e, t) {
  let i = n.nodeValue.length;
  e > i && (e = i);
  let s = e, r = e, o = 0;
  e == 0 && t < 0 || e == i && t >= 0 ? b.chrome || b.gecko || (e ? (s--, o = 1) : r < i && (r++, o = -1)) : t < 0 ? s-- : r < i && r++;
  let l = Et(n, s, r).getClientRects();
  if (!l.length)
    return Ul;
  let a = l[(o ? o < 0 : t >= 0) ? 0 : l.length - 1];
  return b.safari && !o && a.width == 0 && (a = Array.prototype.find.call(l, (h) => h.width) || a), o ? Cn(a, o < 0) : a || null;
}
class tt extends q {
  constructor(e, t, i) {
    super(), this.widget = e, this.length = t, this.side = i, this.prevWidget = null;
  }
  static create(e, t, i) {
    return new (e.customView || tt)(e, t, i);
  }
  split(e) {
    let t = tt.create(this.widget, this.length - e, this.side);
    return this.length -= e, t;
  }
  sync() {
    (!this.dom || !this.widget.updateDOM(this.dom)) && (this.dom && this.prevWidget && this.prevWidget.destroy(this.dom), this.prevWidget = null, this.setDOM(this.widget.toDOM(this.editorView)), this.dom.contentEditable = "false");
  }
  getSide() {
    return this.side;
  }
  merge(e, t, i, s, r, o) {
    return i && (!(i instanceof tt) || !this.widget.compare(i.widget) || e > 0 && r <= 0 || t < this.length && o <= 0) ? !1 : (this.length = e + (i ? i.length : 0) + (this.length - t), !0);
  }
  become(e) {
    return e.length == this.length && e instanceof tt && e.side == this.side && this.widget.constructor == e.widget.constructor ? (this.widget.eq(e.widget) || this.markDirty(!0), this.dom && !this.prevWidget && (this.prevWidget = this.widget), this.widget = e.widget, !0) : !1;
  }
  ignoreMutation() {
    return !0;
  }
  ignoreEvent(e) {
    return this.widget.ignoreEvent(e);
  }
  get overrideDOMText() {
    if (this.length == 0)
      return D.empty;
    let e = this;
    for (; e.parent; )
      e = e.parent;
    let t = e.editorView, i = t && t.state.doc, s = this.posAtStart;
    return i ? i.slice(s, s + this.length) : D.empty;
  }
  domAtPos(e) {
    return e == 0 ? te.before(this.dom) : te.after(this.dom, e == this.length);
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(e, t) {
    let i = this.dom.getClientRects(), s = null;
    if (!i.length)
      return Ul;
    for (let r = e > 0 ? i.length - 1 : 0; s = i[r], !(e > 0 ? r == 0 : r == i.length - 1 || s.top < s.bottom); r += e > 0 ? -1 : 1)
      ;
    return e == 0 && t > 0 || e == this.length && t <= 0 ? s : Cn(s, e == 0);
  }
  get isEditable() {
    return !1;
  }
  destroy() {
    super.destroy(), this.dom && this.widget.destroy(this.dom);
  }
}
class ia extends tt {
  domAtPos(e) {
    let { topView: t, text: i } = this.widget;
    return t ? Ws(e, 0, t, i, (s, r) => s.domAtPos(r), (s) => new te(i, Math.min(s, i.nodeValue.length))) : new te(i, Math.min(e, i.nodeValue.length));
  }
  sync() {
    this.setDOM(this.widget.toDOM());
  }
  localPosFromDOM(e, t) {
    let { topView: i, text: s } = this.widget;
    return i ? na(e, t, i, s) : Math.min(t, this.length);
  }
  ignoreMutation() {
    return !1;
  }
  get overrideDOMText() {
    return null;
  }
  coordsAt(e, t) {
    let { topView: i, text: s } = this.widget;
    return i ? Ws(e, t, i, s, (r, o, l) => r.coordsAt(o, l), (r, o) => Ms(s, r, o)) : Ms(s, e, t);
  }
  destroy() {
    var e;
    super.destroy(), (e = this.widget.topView) === null || e === void 0 || e.destroy();
  }
  get isEditable() {
    return !0;
  }
}
function Ws(n, e, t, i, s, r) {
  if (t instanceof qe) {
    for (let o of t.children) {
      let l = jt(o.dom, i), a = l ? i.nodeValue.length : o.length;
      if (n < a || n == a && o.getSide() <= 0)
        return l ? Ws(n, e, o, i, s, r) : s(o, n, e);
      n -= a;
    }
    return s(t, t.length, -1);
  } else
    return t.dom == i ? r(n, e) : s(t, n, e);
}
function na(n, e, t, i) {
  if (t instanceof qe)
    for (let s of t.children) {
      let r = 0, o = jt(s.dom, i);
      if (jt(s.dom, n))
        return r + (o ? na(n, e, s, i) : s.localPosFromDOM(n, e));
      r += o ? i.nodeValue.length : s.length;
    }
  else if (t.dom == i)
    return Math.min(e, i.nodeValue.length);
  return t.localPosFromDOM(n, e);
}
class qt extends q {
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
    return e instanceof qt && e.side == this.side;
  }
  split() {
    return new qt(this.side);
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
    return te.before(this.dom);
  }
  localPosFromDOM() {
    return 0;
  }
  domBoundsAround() {
    return null;
  }
  coordsAt(e) {
    let t = this.dom.getBoundingClientRect(), i = Yc(this, this.side > 0 ? -1 : 1);
    return i && i.top < t.bottom && i.bottom > t.top ? { left: t.left, right: t.right, top: i.top, bottom: i.bottom } : t;
  }
  get overrideDOMText() {
    return D.empty;
  }
}
ht.prototype.children = tt.prototype.children = qt.prototype.children = ar;
function Yc(n, e) {
  let t = n.parent, i = t ? t.children.indexOf(n) : -1;
  for (; t && i >= 0; )
    if (e < 0 ? i > 0 : i < t.children.length) {
      let s = t.children[i + e];
      if (s instanceof ht) {
        let r = s.coordsAt(e < 0 ? s.length : 0, e);
        if (r)
          return r;
      }
      i += e;
    } else if (t instanceof qe && t.parent)
      i = t.parent.children.indexOf(t) + (e < 0 ? 0 : 1), t = t.parent;
    else {
      let s = t.dom.lastChild;
      if (s && s.nodeName == "BR")
        return s.getClientRects()[0];
      break;
    }
}
function sa(n, e, t) {
  let i = 0;
  for (let s = 0; i < e.length; i++) {
    let r = e[i], o = s + r.length;
    if (!(o == s && r.getSide() <= 0)) {
      if (t > s && t < o && r.dom.parentNode == n)
        return r.domAtPos(t - s);
      if (t <= s)
        break;
      s = o;
    }
  }
  for (; i > 0; i--) {
    let s = e[i - 1].dom;
    if (s.parentNode == n)
      return te.after(s);
  }
  return new te(n, 0);
}
function ra(n, e, t) {
  let i, { children: s } = n;
  t > 0 && e instanceof qe && s.length && (i = s[s.length - 1]) instanceof qe && i.mark.eq(e.mark) ? ra(i, e.children[0], t - 1) : (s.push(e), e.setParent(n)), n.length += e.length;
}
function oa(n, e, t) {
  for (let r = 0, o = 0; o < n.children.length; o++) {
    let l = n.children[o], a = r + l.length, h;
    if ((t <= 0 || a == n.length || l.getSide() > 0 ? a >= e : a > e) && (e < a || o + 1 == n.children.length || (h = n.children[o + 1]).length || h.getSide() > 0)) {
      let c = 0;
      if (a == r) {
        if (l.getSide() <= 0)
          continue;
        c = t = -l.getSide();
      }
      let f = l.coordsAt(Math.max(0, e - r), t);
      return c && f ? Cn(f, t < 0) : f;
    }
    r = a;
  }
  let i = n.dom.lastChild;
  if (!i)
    return n.dom.getBoundingClientRect();
  let s = ci(i);
  return s[s.length - 1] || null;
}
function Zs(n, e) {
  for (let t in n)
    t == "class" && e.class ? e.class += " " + n.class : t == "style" && e.style ? e.style += ";" + n.style : e[t] = n[t];
  return e;
}
function hr(n, e) {
  if (n == e)
    return !0;
  if (!n || !e)
    return !1;
  let t = Object.keys(n), i = Object.keys(e);
  if (t.length != i.length)
    return !1;
  for (let s of t)
    if (i.indexOf(s) == -1 || n[s] !== e[s])
      return !1;
  return !0;
}
function Ds(n, e, t) {
  let i = null;
  if (e)
    for (let s in e)
      t && s in t || n.removeAttribute(i = s);
  if (t)
    for (let s in t)
      e && e[s] == t[s] || n.setAttribute(i = s, t[s]);
  return !!i;
}
class ft {
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
var G = /* @__PURE__ */ function(n) {
  return n[n.Text = 0] = "Text", n[n.WidgetBefore = 1] = "WidgetBefore", n[n.WidgetAfter = 2] = "WidgetAfter", n[n.WidgetRange = 3] = "WidgetRange", n;
}(G || (G = {}));
class T extends yt {
  constructor(e, t, i, s) {
    super(), this.startSide = e, this.endSide = t, this.widget = i, this.spec = s;
  }
  get heightRelevant() {
    return !1;
  }
  static mark(e) {
    return new An(e);
  }
  static widget(e) {
    let t = e.side || 0, i = !!e.block;
    return t += i ? t > 0 ? 3e8 : -4e8 : t > 0 ? 1e8 : -1e8, new St(e, t, t, i, e.widget || null, !1);
  }
  static replace(e) {
    let t = !!e.block, i, s;
    if (e.isBlockGap)
      i = -5e8, s = 4e8;
    else {
      let { start: r, end: o } = la(e, t);
      i = (r ? t ? -3e8 : -1 : 5e8) - 1, s = (o ? t ? 2e8 : 1 : -6e8) + 1;
    }
    return new St(e, i, s, t, e.widget || null, !0);
  }
  static line(e) {
    return new mi(e);
  }
  static set(e, t = !1) {
    return j.of(e, t);
  }
  hasHeight() {
    return this.widget ? this.widget.estimatedHeight > -1 : !1;
  }
}
T.none = j.empty;
class An extends T {
  constructor(e) {
    let { start: t, end: i } = la(e);
    super(t ? -1 : 5e8, i ? 1 : -6e8, null, e), this.tagName = e.tagName || "span", this.class = e.class || "", this.attrs = e.attributes || null;
  }
  eq(e) {
    return this == e || e instanceof An && this.tagName == e.tagName && this.class == e.class && hr(this.attrs, e.attrs);
  }
  range(e, t = e) {
    if (e >= t)
      throw new RangeError("Mark decorations may not be empty");
    return super.range(e, t);
  }
}
An.prototype.point = !1;
class mi extends T {
  constructor(e) {
    super(-2e8, -2e8, null, e);
  }
  eq(e) {
    return e instanceof mi && hr(this.spec.attributes, e.spec.attributes);
  }
  range(e, t = e) {
    if (t != e)
      throw new RangeError("Line decoration ranges must be zero-length");
    return super.range(e, t);
  }
}
mi.prototype.mapMode = ne.TrackBefore;
mi.prototype.point = !0;
class St extends T {
  constructor(e, t, i, s, r, o) {
    super(t, i, r, e), this.block = s, this.isReplace = o, this.mapMode = s ? t <= 0 ? ne.TrackBefore : ne.TrackAfter : ne.TrackDel;
  }
  get type() {
    return this.startSide < this.endSide ? G.WidgetRange : this.startSide <= 0 ? G.WidgetBefore : G.WidgetAfter;
  }
  get heightRelevant() {
    return this.block || !!this.widget && this.widget.estimatedHeight >= 5;
  }
  eq(e) {
    return e instanceof St && Hc(this.widget, e.widget) && this.block == e.block && this.startSide == e.startSide && this.endSide == e.endSide;
  }
  range(e, t = e) {
    if (this.isReplace && (e > t || e == t && this.startSide > 0 && this.endSide <= 0))
      throw new RangeError("Invalid range for replacement decoration");
    if (!this.isReplace && t != e)
      throw new RangeError("Widget decorations can only have zero-length ranges");
    return super.range(e, t);
  }
}
St.prototype.point = !0;
function la(n, e = !1) {
  let { inclusiveStart: t, inclusiveEnd: i } = n;
  return t == null && (t = n.inclusive), i == null && (i = n.inclusive), { start: t != null ? t : e, end: i != null ? i : e };
}
function Hc(n, e) {
  return n == e || !!(n && e && n.compare(e));
}
function Xs(n, e, t, i = 0) {
  let s = t.length - 1;
  s >= 0 && t[s] + i >= n ? t[s] = Math.max(t[s], e) : t.push(n, e);
}
class re extends q {
  constructor() {
    super(...arguments), this.children = [], this.length = 0, this.prevAttrs = void 0, this.attrs = null, this.breakAfter = 0;
  }
  merge(e, t, i, s, r, o) {
    if (i) {
      if (!(i instanceof re))
        return !1;
      this.dom || i.transferDOM(this);
    }
    return s && this.setDeco(i ? i.attrs : null), Kl(this, e, t, i ? i.children : [], r, o), !0;
  }
  split(e) {
    let t = new re();
    if (t.breakAfter = this.breakAfter, this.length == 0)
      return t;
    let { i, off: s } = this.childPos(e);
    s && (t.append(this.children[i].split(s), 0), this.children[i].merge(s, this.children[i].length, null, !1, 0, 0), i++);
    for (let r = i; r < this.children.length; r++)
      t.append(this.children[r], 0);
    for (; i > 0 && this.children[i - 1].length == 0; )
      this.children[--i].destroy();
    return this.children.length = i, this.markDirty(), this.length = e, t;
  }
  transferDOM(e) {
    !this.dom || (this.markDirty(), e.setDOM(this.dom), e.prevAttrs = this.prevAttrs === void 0 ? this.attrs : this.prevAttrs, this.prevAttrs = void 0, this.dom = null);
  }
  setDeco(e) {
    hr(this.attrs, e) || (this.dom && (this.prevAttrs = this.attrs, this.markDirty()), this.attrs = e);
  }
  append(e, t) {
    ra(this, e, t);
  }
  addLineDeco(e) {
    let t = e.spec.attributes, i = e.spec.class;
    t && (this.attrs = Zs(t, this.attrs || {})), i && (this.attrs = Zs({ class: i }, this.attrs || {}));
  }
  domAtPos(e) {
    return sa(this.dom, this.children, e);
  }
  reuseDOM(e) {
    e.nodeName == "DIV" && (this.setDOM(e), this.dirty |= 6);
  }
  sync(e) {
    var t;
    this.dom ? this.dirty & 4 && (Yl(this.dom), this.dom.className = "cm-line", this.prevAttrs = this.attrs ? null : void 0) : (this.setDOM(document.createElement("div")), this.dom.className = "cm-line", this.prevAttrs = this.attrs ? null : void 0), this.prevAttrs !== void 0 && (Ds(this.dom, this.prevAttrs, this.attrs), this.dom.classList.add("cm-line"), this.prevAttrs = void 0), super.sync(e);
    let i = this.dom.lastChild;
    for (; i && q.get(i) instanceof qe; )
      i = i.lastChild;
    if (!i || !this.length || i.nodeName != "BR" && ((t = q.get(i)) === null || t === void 0 ? void 0 : t.isEditable) == !1 && (!b.ios || !this.children.some((s) => s instanceof ht))) {
      let s = document.createElement("BR");
      s.cmIgnore = !0, this.dom.appendChild(s);
    }
  }
  measureTextSize() {
    if (this.children.length == 0 || this.length > 20)
      return null;
    let e = 0;
    for (let t of this.children) {
      if (!(t instanceof ht))
        return null;
      let i = ci(t.dom);
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
    return oa(this, e, t);
  }
  become(e) {
    return !1;
  }
  get type() {
    return G.Text;
  }
  static find(e, t) {
    for (let i = 0, s = 0; i < e.children.length; i++) {
      let r = e.children[i], o = s + r.length;
      if (o >= t) {
        if (r instanceof re)
          return r;
        if (o > t)
          break;
      }
      s = o + r.breakAfter;
    }
    return null;
  }
}
class gt extends q {
  constructor(e, t, i) {
    super(), this.widget = e, this.length = t, this.type = i, this.breakAfter = 0, this.prevWidget = null;
  }
  merge(e, t, i, s, r, o) {
    return i && (!(i instanceof gt) || !this.widget.compare(i.widget) || e > 0 && r <= 0 || t < this.length && o <= 0) ? !1 : (this.length = e + (i ? i.length : 0) + (this.length - t), !0);
  }
  domAtPos(e) {
    return e == 0 ? te.before(this.dom) : te.after(this.dom, e == this.length);
  }
  split(e) {
    let t = this.length - e;
    this.length = e;
    let i = new gt(this.widget, t, this.type);
    return i.breakAfter = this.breakAfter, i;
  }
  get children() {
    return ar;
  }
  sync() {
    (!this.dom || !this.widget.updateDOM(this.dom)) && (this.dom && this.prevWidget && this.prevWidget.destroy(this.dom), this.prevWidget = null, this.setDOM(this.widget.toDOM(this.editorView)), this.dom.contentEditable = "false");
  }
  get overrideDOMText() {
    return this.parent ? this.parent.view.state.doc.slice(this.posAtStart, this.posAtEnd) : D.empty;
  }
  domBoundsAround() {
    return null;
  }
  become(e) {
    return e instanceof gt && e.type == this.type && e.widget.constructor == this.widget.constructor ? (e.widget.eq(this.widget) || this.markDirty(!0), this.dom && !this.prevWidget && (this.prevWidget = this.widget), this.widget = e.widget, this.length = e.length, this.breakAfter = e.breakAfter, !0) : !1;
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
class cr {
  constructor(e, t, i, s) {
    this.doc = e, this.pos = t, this.end = i, this.disallowBlockEffectsFor = s, this.content = [], this.curLine = null, this.breakAtStart = 0, this.pendingBuffer = 0, this.atCursorPos = !0, this.openStart = -1, this.openEnd = -1, this.text = "", this.textOff = 0, this.cursor = e.iter(), this.skip = t;
  }
  posCovered() {
    if (this.content.length == 0)
      return !this.breakAtStart && this.doc.lineAt(this.pos).from != this.pos;
    let e = this.content[this.content.length - 1];
    return !e.breakAfter && !(e instanceof gt && e.type == G.WidgetBefore);
  }
  getLine() {
    return this.curLine || (this.content.push(this.curLine = new re()), this.atCursorPos = !0), this.curLine;
  }
  flushBuffer(e) {
    this.pendingBuffer && (this.curLine.append(vi(new qt(-1), e), e.length), this.pendingBuffer = 0);
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
        let { value: r, lineBreak: o, done: l } = this.cursor.next(this.skip);
        if (this.skip = 0, l)
          throw new Error("Ran out of text content when drawing inline views");
        if (o) {
          this.posCovered() || this.getLine(), this.content.length ? this.content[this.content.length - 1].breakAfter = 1 : this.breakAtStart = 1, this.flushBuffer([]), this.curLine = null, e--;
          continue;
        } else
          this.text = r, this.textOff = 0;
      }
      let s = Math.min(this.text.length - this.textOff, e, 512);
      this.flushBuffer(t.slice(0, i)), this.getLine().append(vi(new ht(this.text.slice(this.textOff, this.textOff + s)), t), i), this.atCursorPos = !0, this.textOff += s, e -= s, i = 0;
    }
  }
  span(e, t, i, s) {
    this.buildText(t - e, i, s), this.pos = t, this.openStart < 0 && (this.openStart = s);
  }
  point(e, t, i, s, r, o) {
    if (this.disallowBlockEffectsFor[o] && i instanceof St) {
      if (i.block)
        throw new RangeError("Block decorations may not be specified via plugins");
      if (t > this.doc.lineAt(this.pos).to)
        throw new RangeError("Decorations that replace line breaks may not be specified via plugins");
    }
    let l = t - e;
    if (i instanceof St)
      if (i.block) {
        let { type: a } = i;
        a == G.WidgetAfter && !this.posCovered() && this.getLine(), this.addBlockWidget(new gt(i.widget || new Kr("div"), l, a));
      } else {
        let a = tt.create(i.widget || new Kr("span"), l, i.startSide), h = this.atCursorPos && !a.isEditable && r <= s.length && (e < t || i.startSide > 0), c = !a.isEditable && (e < t || i.startSide <= 0), f = this.getLine();
        this.pendingBuffer == 2 && !h && (this.pendingBuffer = 0), this.flushBuffer(s), h && (f.append(vi(new qt(1), s), r), r = s.length + Math.max(0, r - s.length)), f.append(vi(a, s), r), this.atCursorPos = c, this.pendingBuffer = c ? e < t ? 1 : 2 : 0;
      }
    else
      this.doc.lineAt(this.pos).from == this.pos && this.getLine().addLineDeco(i);
    l && (this.textOff + l <= this.text.length ? this.textOff += l : (this.skip += l - (this.text.length - this.textOff), this.text = "", this.textOff = 0), this.pos = t), this.openStart < 0 && (this.openStart = r);
  }
  static build(e, t, i, s, r) {
    let o = new cr(e, t, i, r);
    return o.openEnd = j.spans(s, t, i, o), o.openStart < 0 && (o.openStart = o.openEnd), o.finish(o.openEnd), o;
  }
}
function vi(n, e) {
  for (let t of e)
    n = new qe(t, [n], n.length);
  return n;
}
class Kr extends ft {
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
const aa = /* @__PURE__ */ x.define(), ha = /* @__PURE__ */ x.define(), ca = /* @__PURE__ */ x.define(), fa = /* @__PURE__ */ x.define(), js = /* @__PURE__ */ x.define(), ua = /* @__PURE__ */ x.define(), da = /* @__PURE__ */ x.define({
  combine: (n) => n.some((e) => e)
});
class nn {
  constructor(e, t = "nearest", i = "nearest", s = 5, r = 5) {
    this.range = e, this.y = t, this.x = i, this.yMargin = s, this.xMargin = r;
  }
  map(e) {
    return e.empty ? this : new nn(this.range.map(e), this.y, this.x, this.yMargin, this.xMargin);
  }
}
const eo = /* @__PURE__ */ C.define({ map: (n, e) => n.map(e) });
function ve(n, e, t) {
  let i = n.facet(fa);
  i.length ? i[0](e) : window.onerror ? window.onerror(String(e), t, void 0, void 0, e) : t ? console.error(t + ":", e) : console.error(e);
}
const Mn = /* @__PURE__ */ x.define({ combine: (n) => n.length ? n[0] : !0 });
let Jc = 0;
const Jt = /* @__PURE__ */ x.define();
class oe {
  constructor(e, t, i, s) {
    this.id = e, this.create = t, this.domEventHandlers = i, this.extension = s(this);
  }
  static define(e, t) {
    const { eventHandlers: i, provide: s, decorations: r } = t || {};
    return new oe(Jc++, e, i, (o) => {
      let l = [Jt.of(o)];
      return r && l.push(ui.of((a) => {
        let h = a.plugin(o);
        return h ? r(h) : T.none;
      })), s && l.push(s(o)), l;
    });
  }
  static fromClass(e, t) {
    return oe.define((i) => new e(i), t);
  }
}
class Un {
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
            if (ve(t.state, i, "CodeMirror plugin crashed"), this.value.destroy)
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
        ve(e.state, t, "CodeMirror plugin crashed"), this.deactivate();
      }
    return this;
  }
  destroy(e) {
    var t;
    if (!((t = this.value) === null || t === void 0) && t.destroy)
      try {
        this.value.destroy();
      } catch (i) {
        ve(e.state, i, "CodeMirror plugin crashed");
      }
  }
  deactivate() {
    this.spec = this.value = null;
  }
}
const Oa = /* @__PURE__ */ x.define(), pa = /* @__PURE__ */ x.define(), ui = /* @__PURE__ */ x.define(), ga = /* @__PURE__ */ x.define(), ma = /* @__PURE__ */ x.define(), Kt = /* @__PURE__ */ x.define();
class Ne {
  constructor(e, t, i, s) {
    this.fromA = e, this.toA = t, this.fromB = i, this.toB = s;
  }
  join(e) {
    return new Ne(Math.min(this.fromA, e.fromA), Math.max(this.toA, e.toA), Math.min(this.fromB, e.fromB), Math.max(this.toB, e.toB));
  }
  addToSet(e) {
    let t = e.length, i = this;
    for (; t > 0; t--) {
      let s = e[t - 1];
      if (!(s.fromA > i.toA)) {
        if (s.toA < i.fromA)
          break;
        i = i.join(s), e.splice(t - 1, 1);
      }
    }
    return e.splice(t, 0, i), e;
  }
  static extendWithRanges(e, t) {
    if (t.length == 0)
      return e;
    let i = [];
    for (let s = 0, r = 0, o = 0, l = 0; ; s++) {
      let a = s == e.length ? null : e[s], h = o - l, c = a ? a.fromB : 1e9;
      for (; r < t.length && t[r] < c; ) {
        let f = t[r], u = t[r + 1], d = Math.max(l, f), O = Math.min(c, u);
        if (d <= O && new Ne(d + h, O + h, d, O).addToSet(i), u > c)
          break;
        r += 2;
      }
      if (!a)
        return i;
      new Ne(a.fromA, a.toA, a.fromB, a.toB).addToSet(i), o = a.toA, l = a.toB;
    }
  }
}
class sn {
  constructor(e, t, i) {
    this.view = e, this.state = t, this.transactions = i, this.flags = 0, this.startState = e.state, this.changes = _.empty(this.startState.doc.length);
    for (let o of i)
      this.changes = this.changes.compose(o.changes);
    let s = [];
    this.changes.iterChangedRanges((o, l, a, h) => s.push(new Ne(o, l, a, h))), this.changedRanges = s;
    let r = e.hasFocus;
    r != e.inputState.notifiedFocused && (e.inputState.notifiedFocused = r, this.flags |= 1);
  }
  static create(e, t, i) {
    return new sn(e, t, i);
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
var V = /* @__PURE__ */ function(n) {
  return n[n.LTR = 0] = "LTR", n[n.RTL = 1] = "RTL", n;
}(V || (V = {}));
const Es = V.LTR, Kc = V.RTL;
function Qa(n) {
  let e = [];
  for (let t = 0; t < n.length; t++)
    e.push(1 << +n[t]);
  return e;
}
const ef = /* @__PURE__ */ Qa("88888888888888888888888888888888888666888888787833333333337888888000000000000000000000000008888880000000000000000000000000088888888888888888888888888888888888887866668888088888663380888308888800000000000000000000000800000000000000000000000000000008"), tf = /* @__PURE__ */ Qa("4444448826627288999999999992222222222222222222222222222222222222222222222229999999999999999999994444444444644222822222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222222999999949999999229989999223333333333"), qs = /* @__PURE__ */ Object.create(null), Ce = [];
for (let n of ["()", "[]", "{}"]) {
  let e = /* @__PURE__ */ n.charCodeAt(0), t = /* @__PURE__ */ n.charCodeAt(1);
  qs[e] = t, qs[t] = -e;
}
function nf(n) {
  return n <= 247 ? ef[n] : 1424 <= n && n <= 1524 ? 2 : 1536 <= n && n <= 1785 ? tf[n - 1536] : 1774 <= n && n <= 2220 ? 4 : 8192 <= n && n <= 8203 || n == 8204 ? 256 : 1;
}
const sf = /[\u0590-\u05f4\u0600-\u06ff\u0700-\u08ac]/;
class Zt {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.level = i;
  }
  get dir() {
    return this.level % 2 ? Kc : Es;
  }
  side(e, t) {
    return this.dir == t == e ? this.to : this.from;
  }
  static find(e, t, i, s) {
    let r = -1;
    for (let o = 0; o < e.length; o++) {
      let l = e[o];
      if (l.from <= t && l.to >= t) {
        if (l.level == i)
          return o;
        (r < 0 || (s != 0 ? s < 0 ? l.from < t : l.to > t : e[r].level > l.level)) && (r = o);
      }
    }
    if (r < 0)
      throw new RangeError("Index out of range");
    return r;
  }
}
const I = [];
function rf(n, e) {
  let t = n.length, i = e == Es ? 1 : 2, s = e == Es ? 2 : 1;
  if (!n || i == 1 && !sf.test(n))
    return ya(t);
  for (let o = 0, l = i, a = i; o < t; o++) {
    let h = nf(n.charCodeAt(o));
    h == 512 ? h = l : h == 8 && a == 4 && (h = 16), I[o] = h == 4 ? 2 : h, h & 7 && (a = h), l = h;
  }
  for (let o = 0, l = i, a = i; o < t; o++) {
    let h = I[o];
    if (h == 128)
      o < t - 1 && l == I[o + 1] && l & 24 ? h = I[o] = l : I[o] = 256;
    else if (h == 64) {
      let c = o + 1;
      for (; c < t && I[c] == 64; )
        c++;
      let f = o && l == 8 || c < t && I[c] == 8 ? a == 1 ? 1 : 8 : 256;
      for (let u = o; u < c; u++)
        I[u] = f;
      o = c - 1;
    } else
      h == 8 && a == 1 && (I[o] = 1);
    l = h, h & 7 && (a = h);
  }
  for (let o = 0, l = 0, a = 0, h, c, f; o < t; o++)
    if (c = qs[h = n.charCodeAt(o)])
      if (c < 0) {
        for (let u = l - 3; u >= 0; u -= 3)
          if (Ce[u + 1] == -c) {
            let d = Ce[u + 2], O = d & 2 ? i : d & 4 ? d & 1 ? s : i : 0;
            O && (I[o] = I[Ce[u]] = O), l = u;
            break;
          }
      } else {
        if (Ce.length == 189)
          break;
        Ce[l++] = o, Ce[l++] = h, Ce[l++] = a;
      }
    else if ((f = I[o]) == 2 || f == 1) {
      let u = f == i;
      a = u ? 0 : 1;
      for (let d = l - 3; d >= 0; d -= 3) {
        let O = Ce[d + 2];
        if (O & 2)
          break;
        if (u)
          Ce[d + 2] |= 2;
        else {
          if (O & 4)
            break;
          Ce[d + 2] |= 4;
        }
      }
    }
  for (let o = 0; o < t; o++)
    if (I[o] == 256) {
      let l = o + 1;
      for (; l < t && I[l] == 256; )
        l++;
      let a = (o ? I[o - 1] : i) == 1, h = (l < t ? I[l] : i) == 1, c = a == h ? a ? 1 : 2 : i;
      for (let f = o; f < l; f++)
        I[f] = c;
      o = l - 1;
    }
  let r = [];
  if (i == 1)
    for (let o = 0; o < t; ) {
      let l = o, a = I[o++] != 1;
      for (; o < t && a == (I[o] != 1); )
        o++;
      if (a)
        for (let h = o; h > l; ) {
          let c = h, f = I[--h] != 2;
          for (; h > l && f == (I[h - 1] != 2); )
            h--;
          r.push(new Zt(h, c, f ? 2 : 1));
        }
      else
        r.push(new Zt(l, o, 0));
    }
  else
    for (let o = 0; o < t; ) {
      let l = o, a = I[o++] == 2;
      for (; o < t && a == (I[o] == 2); )
        o++;
      r.push(new Zt(l, o, a ? 1 : 2));
    }
  return r;
}
function ya(n) {
  return [new Zt(0, n, 0)];
}
let Sa = "";
function of(n, e, t, i, s) {
  var r;
  let o = i.head - n.from, l = -1;
  if (o == 0) {
    if (!s || !n.length)
      return null;
    e[0].level != t && (o = e[0].side(!1, t), l = 0);
  } else if (o == n.length) {
    if (s)
      return null;
    let u = e[e.length - 1];
    u.level != t && (o = u.side(!0, t), l = e.length - 1);
  }
  l < 0 && (l = Zt.find(e, o, (r = i.bidiLevel) !== null && r !== void 0 ? r : -1, i.assoc));
  let a = e[l];
  o == a.side(s, t) && (a = e[l += s ? 1 : -1], o = a.side(!s, t));
  let h = s == (a.dir == t), c = me(n.text, o, h);
  if (Sa = n.text.slice(Math.min(o, c), Math.max(o, c)), c != a.side(s, t))
    return g.cursor(c + n.from, h ? -1 : 1, a.level);
  let f = l == (s ? e.length - 1 : 0) ? null : e[l + (s ? 1 : -1)];
  return !f && a.level != t ? g.cursor(s ? n.to : n.from, s ? -1 : 1, t) : f && f.level < a.level ? g.cursor(f.side(!s, t) + n.from, s ? 1 : -1, f.level) : g.cursor(c + n.from, s ? -1 : 1, a.level);
}
const it = "\uFFFF";
class ba {
  constructor(e, t) {
    this.points = e, this.text = "", this.lineSeparator = t.facet(Z.lineSeparator);
  }
  append(e) {
    this.text += e;
  }
  lineBreak() {
    this.text += it;
  }
  readRange(e, t) {
    if (!e)
      return this;
    let i = e.parentNode;
    for (let s = e; ; ) {
      this.findPointBefore(i, s), this.readNode(s);
      let r = s.nextSibling;
      if (r == t)
        break;
      let o = q.get(s), l = q.get(r);
      (o && l ? o.breakAfter : (o ? o.breakAfter : to(s)) || to(r) && (s.nodeName != "BR" || s.cmIgnore)) && this.lineBreak(), s = r;
    }
    return this.findPointBefore(i, t), this;
  }
  readTextNode(e) {
    let t = e.nodeValue;
    for (let i of this.points)
      i.node == e && (i.pos = this.text.length + Math.min(i.offset, t.length));
    for (let i = 0, s = this.lineSeparator ? null : /\r\n?|\n/g; ; ) {
      let r = -1, o = 1, l;
      if (this.lineSeparator ? (r = t.indexOf(this.lineSeparator, i), o = this.lineSeparator.length) : (l = s.exec(t)) && (r = l.index, o = l[0].length), this.append(t.slice(i, r < 0 ? t.length : r)), r < 0)
        break;
      if (this.lineBreak(), o > 1)
        for (let a of this.points)
          a.node == e && a.pos > this.text.length && (a.pos -= o - 1);
      i = r + o;
    }
  }
  readNode(e) {
    if (e.cmIgnore)
      return;
    let t = q.get(e), i = t && t.overrideDOMText;
    if (i != null) {
      this.findPointInside(e, i.length);
      for (let s = i.iter(); !s.next().done; )
        s.lineBreak ? this.lineBreak() : this.append(s.value);
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
function to(n) {
  return n.nodeType == 1 && /^(DIV|P|LI|UL|OL|BLOCKQUOTE|DD|DT|H\d|SECTION|PRE)$/.test(n.nodeName);
}
class io {
  constructor(e, t) {
    this.node = e, this.offset = t, this.pos = -1;
  }
}
class no extends q {
  constructor(e) {
    super(), this.view = e, this.compositionDeco = T.none, this.decorations = [], this.dynamicDecorationMap = [], this.minWidth = 0, this.minWidthFrom = 0, this.minWidthTo = 0, this.impreciseAnchor = null, this.impreciseHead = null, this.forceSelection = !1, this.lastUpdate = Date.now(), this.setDOM(e.contentDOM), this.children = [new re()], this.children[0].setParent(this), this.updateDeco(), this.updateInner([new Ne(0, 0, 0, e.state.doc.length)], 0);
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
    this.minWidth > 0 && t.length && (t.every(({ fromA: o, toA: l }) => l < this.minWidthFrom || o > this.minWidthTo) ? (this.minWidthFrom = e.changes.mapPos(this.minWidthFrom, 1), this.minWidthTo = e.changes.mapPos(this.minWidthTo, 1)) : this.minWidth = this.minWidthFrom = this.minWidthTo = 0), this.view.inputState.composing < 0 ? this.compositionDeco = T.none : (e.transactions.length || this.dirty) && (this.compositionDeco = af(this.view, e.changes)), (b.ie || b.chrome) && !this.compositionDeco.size && e && e.state.doc.lines != e.startState.doc.lines && (this.forceSelection = !0);
    let i = this.decorations, s = this.updateDeco(), r = uf(i, s, e.changes);
    return t = Ne.extendWithRanges(t, r), this.dirty == 0 && t.length == 0 ? !1 : (this.updateInner(t, e.startState.doc.length), e.transactions.length && (this.lastUpdate = Date.now()), !0);
  }
  updateInner(e, t) {
    this.view.viewState.mustMeasureContent = !0, this.updateChildren(e, t);
    let { observer: i } = this.view;
    i.ignore(() => {
      this.dom.style.height = this.view.viewState.contentHeight + "px", this.dom.style.flexBasis = this.minWidth ? this.minWidth + "px" : "";
      let r = b.chrome || b.ios ? { node: i.selectionRange.focusNode, written: !1 } : void 0;
      this.sync(r), this.dirty = 0, r && (r.written || i.selectionRange.focusNode != r.node) && (this.forceSelection = !0), this.dom.style.height = "";
    });
    let s = [];
    if (this.view.viewport.from || this.view.viewport.to < this.view.state.doc.length)
      for (let r of this.children)
        r instanceof gt && r.widget instanceof so && s.push(r.dom);
    i.updateGaps(s);
  }
  updateChildren(e, t) {
    let i = this.childCursor(t);
    for (let s = e.length - 1; ; s--) {
      let r = s >= 0 ? e[s] : null;
      if (!r)
        break;
      let { fromA: o, toA: l, fromB: a, toB: h } = r, { content: c, breakAtStart: f, openStart: u, openEnd: d } = cr.build(this.view.state.doc, a, h, this.decorations, this.dynamicDecorationMap), { i: O, off: m } = i.findPos(l, 1), { i: Q, off: S } = i.findPos(o, -1);
      Jl(this, Q, S, O, m, c, f, u, d);
    }
  }
  updateSelection(e = !1, t = !1) {
    if ((e || !this.view.observer.selectionRange.focusNode) && this.view.observer.readSelectionRange(), !(t || this.mayControlSelection()) || b.ios && this.view.inputState.rapidCompositionStart)
      return;
    let i = this.forceSelection;
    this.forceSelection = !1;
    let s = this.view.state.selection.main, r = this.domAtPos(s.anchor), o = s.empty ? r : this.domAtPos(s.head);
    if (b.gecko && s.empty && lf(r)) {
      let a = document.createTextNode("");
      this.view.observer.ignore(() => r.node.insertBefore(a, r.node.childNodes[r.offset] || null)), r = o = new te(a, 0), i = !0;
    }
    let l = this.view.observer.selectionRange;
    (i || !l.focusNode || !en(r.node, r.offset, l.anchorNode, l.anchorOffset) || !en(o.node, o.offset, l.focusNode, l.focusOffset)) && (this.view.observer.ignore(() => {
      b.android && b.chrome && this.dom.contains(l.focusNode) && df(l.focusNode, this.dom) && (this.dom.blur(), this.dom.focus({ preventScroll: !0 }));
      let a = Ki(this.root);
      if (a)
        if (s.empty) {
          if (b.gecko) {
            let h = cf(r.node, r.offset);
            if (h && h != 3) {
              let c = $a(r.node, r.offset, h == 1 ? 1 : -1);
              c && (r = new te(c, h == 1 ? 0 : c.nodeValue.length));
            }
          }
          a.collapse(r.node, r.offset), s.bidiLevel != null && l.cursorBidiLevel != null && (l.cursorBidiLevel = s.bidiLevel);
        } else if (a.extend)
          a.collapse(r.node, r.offset), a.extend(o.node, o.offset);
        else {
          let h = document.createRange();
          s.anchor > s.head && ([r, o] = [o, r]), h.setEnd(o.node, o.offset), h.setStart(r.node, r.offset), a.removeAllRanges(), a.addRange(h);
        }
    }), this.view.observer.setSelectionRange(r, o)), this.impreciseAnchor = r.precise ? null : new te(l.anchorNode, l.anchorOffset), this.impreciseHead = o.precise ? null : new te(l.focusNode, l.focusOffset);
  }
  enforceCursorAssoc() {
    if (this.compositionDeco.size)
      return;
    let e = this.view.state.selection.main, t = Ki(this.root);
    if (!t || !e.empty || !e.assoc || !t.modify)
      return;
    let i = re.find(this, e.head);
    if (!i)
      return;
    let s = i.posAtStart;
    if (e.head == s || e.head == s + i.length)
      return;
    let r = this.coordsAt(e.head, -1), o = this.coordsAt(e.head, 1);
    if (!r || !o || r.bottom > o.top)
      return;
    let l = this.domAtPos(e.head + e.assoc);
    t.collapse(l.node, l.offset), t.modify("move", e.assoc < 0 ? "forward" : "backward", "lineboundary");
  }
  mayControlSelection() {
    let e = this.root.activeElement;
    return e == this.dom || Li(this.dom, this.view.observer.selectionRange) && !(e && this.dom.contains(e));
  }
  nearest(e) {
    for (let t = e; t; ) {
      let i = q.get(t);
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
      let s = this.children[t];
      if (i < s.length || s instanceof re)
        break;
      t++, i = 0;
    }
    return this.children[t].domAtPos(i);
  }
  coordsAt(e, t) {
    for (let i = this.length, s = this.children.length - 1; ; s--) {
      let r = this.children[s], o = i - r.breakAfter - r.length;
      if (e > o || e == o && r.type != G.WidgetBefore && r.type != G.WidgetAfter && (!s || t == 2 || this.children[s - 1].breakAfter || this.children[s - 1].type == G.WidgetBefore && t > -2))
        return r.coordsAt(e - o, t);
      i = o;
    }
  }
  measureVisibleLineHeights(e) {
    let t = [], { from: i, to: s } = e, r = this.view.contentDOM.clientWidth, o = r > Math.max(this.view.scrollDOM.clientWidth, this.minWidth) + 1, l = -1, a = this.view.textDirection == V.LTR;
    for (let h = 0, c = 0; c < this.children.length; c++) {
      let f = this.children[c], u = h + f.length;
      if (u > s)
        break;
      if (h >= i) {
        let d = f.dom.getBoundingClientRect();
        if (t.push(d.height), o) {
          let O = f.dom.lastChild, m = O ? ci(O) : [];
          if (m.length) {
            let Q = m[m.length - 1], S = a ? Q.right - d.left : d.right - Q.left;
            S > l && (l = S, this.minWidth = r, this.minWidthFrom = h, this.minWidthTo = u);
          }
        }
      }
      h = u + f.breakAfter;
    }
    return t;
  }
  textDirectionAt(e) {
    let { i: t } = this.childPos(e, 1);
    return getComputedStyle(this.children[t].dom).direction == "rtl" ? V.RTL : V.LTR;
  }
  measureTextSize() {
    for (let s of this.children)
      if (s instanceof re) {
        let r = s.measureTextSize();
        if (r)
          return r;
      }
    let e = document.createElement("div"), t, i;
    return e.className = "cm-line", e.style.width = "99999px", e.textContent = "abc def ghi jkl mno pqr stu", this.view.observer.ignore(() => {
      this.dom.appendChild(e);
      let s = ci(e.firstChild)[0];
      t = e.getBoundingClientRect().height, i = s ? s.width / 27 : 7, e.remove();
    }), { lineHeight: t, charWidth: i };
  }
  childCursor(e = this.length) {
    let t = this.children.length;
    return t && (e -= this.children[--t].length), new Hl(this.children, e, t);
  }
  computeBlockGapDeco() {
    let e = [], t = this.view.viewState;
    for (let i = 0, s = 0; ; s++) {
      let r = s == t.viewports.length ? null : t.viewports[s], o = r ? r.from - 1 : this.length;
      if (o > i) {
        let l = t.lineBlockAt(o).bottom - t.lineBlockAt(i).top;
        e.push(T.replace({
          widget: new so(l),
          block: !0,
          inclusive: !0,
          isBlockGap: !0
        }).range(i, o));
      }
      if (!r)
        break;
      i = r.to + 1;
    }
    return T.set(e);
  }
  updateDeco() {
    let e = this.view.state.facet(ui).map((t, i) => (this.dynamicDecorationMap[i] = typeof t == "function") ? t(this.view) : t);
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
    let { range: t } = e, i = this.coordsAt(t.head, t.empty ? t.assoc : t.head > t.anchor ? -1 : 1), s;
    if (!i)
      return;
    !t.empty && (s = this.coordsAt(t.anchor, t.anchor > t.head ? -1 : 1)) && (i = {
      left: Math.min(i.left, s.left),
      top: Math.min(i.top, s.top),
      right: Math.max(i.right, s.right),
      bottom: Math.max(i.bottom, s.bottom)
    });
    let r = 0, o = 0, l = 0, a = 0;
    for (let c of this.view.state.facet(ma).map((f) => f(this.view)))
      if (c) {
        let { left: f, right: u, top: d, bottom: O } = c;
        f != null && (r = Math.max(r, f)), u != null && (o = Math.max(o, u)), d != null && (l = Math.max(l, d)), O != null && (a = Math.max(a, O));
      }
    let h = {
      left: i.left - r,
      top: i.top - l,
      right: i.right + o,
      bottom: i.bottom + a
    };
    _c(this.view.scrollDOM, h, t.head < t.anchor ? -1 : 1, e.x, e.y, e.xMargin, e.yMargin, this.view.textDirection == V.LTR);
  }
}
function lf(n) {
  return n.node.nodeType == 1 && n.node.firstChild && (n.offset == 0 || n.node.childNodes[n.offset - 1].contentEditable == "false") && (n.offset == n.node.childNodes.length || n.node.childNodes[n.offset].contentEditable == "false");
}
class so extends ft {
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
function xa(n) {
  let e = n.observer.selectionRange, t = e.focusNode && $a(e.focusNode, e.focusOffset, 0);
  if (!t)
    return null;
  let i = n.docView.nearest(t);
  if (!i)
    return null;
  if (i instanceof re) {
    let s = t;
    for (; s.parentNode != i.dom; )
      s = s.parentNode;
    let r = s.previousSibling;
    for (; r && !q.get(r); )
      r = r.previousSibling;
    let o = r ? q.get(r).posAtEnd : i.posAtStart;
    return { from: o, to: o, node: s, text: t };
  } else {
    for (; ; ) {
      let { parent: r } = i;
      if (!r)
        return null;
      if (r instanceof re)
        break;
      i = r;
    }
    let s = i.posAtStart;
    return { from: s, to: s + i.length, node: i.dom, text: t };
  }
}
function af(n, e) {
  let t = xa(n);
  if (!t)
    return T.none;
  let { from: i, to: s, node: r, text: o } = t, l = e.mapPos(i, 1), a = Math.max(l, e.mapPos(s, -1)), { state: h } = n, c = r.nodeType == 3 ? r.nodeValue : new ba([], h).readRange(r.firstChild, null).text;
  if (a - l < c.length)
    if (h.doc.sliceString(l, Math.min(h.doc.length, l + c.length), it) == c)
      a = l + c.length;
    else if (h.doc.sliceString(Math.max(0, a - c.length), a, it) == c)
      l = a - c.length;
    else
      return T.none;
  else if (h.doc.sliceString(l, a, it) != c)
    return T.none;
  let f = q.get(r);
  return f instanceof ia ? f = f.widget.topView : f && (f.parent = null), T.set(T.replace({ widget: new hf(r, o, f), inclusive: !0 }).range(l, a));
}
class hf extends ft {
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
    return ia;
  }
}
function $a(n, e, t) {
  for (; ; ) {
    if (n.nodeType == 3)
      return n;
    if (n.nodeType == 1 && e > 0 && t <= 0)
      n = n.childNodes[e - 1], e = fi(n);
    else if (n.nodeType == 1 && e < n.childNodes.length && t >= 0)
      n = n.childNodes[e], e = 0;
    else
      return null;
  }
}
function cf(n, e) {
  return n.nodeType != 1 ? 0 : (e && n.childNodes[e - 1].contentEditable == "false" ? 1 : 0) | (e < n.childNodes.length && n.childNodes[e].contentEditable == "false" ? 2 : 0);
}
class ff {
  constructor() {
    this.changes = [];
  }
  compareRange(e, t) {
    Xs(e, t, this.changes);
  }
  comparePoint(e, t) {
    Xs(e, t, this.changes);
  }
}
function uf(n, e, t) {
  let i = new ff();
  return j.compare(n, e, t, i), i.changes;
}
function df(n, e) {
  for (let t = n; t && t != e; t = t.assignedSlot || t.parentNode)
    if (t.nodeType == 1 && t.contentEditable == "false")
      return !0;
  return !1;
}
function Of(n, e, t = 1) {
  let i = n.charCategorizer(e), s = n.doc.lineAt(e), r = e - s.from;
  if (s.length == 0)
    return g.cursor(e);
  r == 0 ? t = 1 : r == s.length && (t = -1);
  let o = r, l = r;
  t < 0 ? o = me(s.text, r, !1) : l = me(s.text, r);
  let a = i(s.text.slice(o, l));
  for (; o > 0; ) {
    let h = me(s.text, o, !1);
    if (i(s.text.slice(h, o)) != a)
      break;
    o = h;
  }
  for (; l < s.length; ) {
    let h = me(s.text, l);
    if (i(s.text.slice(l, h)) != a)
      break;
    l = h;
  }
  return g.range(o + s.from, l + s.from);
}
function pf(n, e) {
  return e.left > n ? e.left - n : Math.max(0, n - e.right);
}
function gf(n, e) {
  return e.top > n ? e.top - n : Math.max(0, n - e.bottom);
}
function Fn(n, e) {
  return n.top < e.bottom - 1 && n.bottom > e.top + 1;
}
function ro(n, e) {
  return e < n.top ? { top: e, left: n.left, right: n.right, bottom: n.bottom } : n;
}
function oo(n, e) {
  return e > n.bottom ? { top: n.top, left: n.left, right: n.right, bottom: e } : n;
}
function Is(n, e, t) {
  let i, s, r, o, l, a, h, c;
  for (let d = n.firstChild; d; d = d.nextSibling) {
    let O = ci(d);
    for (let m = 0; m < O.length; m++) {
      let Q = O[m];
      s && Fn(s, Q) && (Q = ro(oo(Q, s.bottom), s.top));
      let S = pf(e, Q), $ = gf(t, Q);
      if (S == 0 && $ == 0)
        return d.nodeType == 3 ? lo(d, e, t) : Is(d, e, t);
      (!i || o > $ || o == $ && r > S) && (i = d, s = Q, r = S, o = $), S == 0 ? t > Q.bottom && (!h || h.bottom < Q.bottom) ? (l = d, h = Q) : t < Q.top && (!c || c.top > Q.top) && (a = d, c = Q) : h && Fn(h, Q) ? h = oo(h, Q.bottom) : c && Fn(c, Q) && (c = ro(c, Q.top));
    }
  }
  if (h && h.bottom >= t ? (i = l, s = h) : c && c.top <= t && (i = a, s = c), !i)
    return { node: n, offset: 0 };
  let f = Math.max(s.left, Math.min(s.right, e));
  if (i.nodeType == 3)
    return lo(i, f, t);
  if (!r && i.contentEditable == "true")
    return Is(i, f, t);
  let u = Array.prototype.indexOf.call(n.childNodes, i) + (e >= (s.left + s.right) / 2 ? 1 : 0);
  return { node: n, offset: u };
}
function lo(n, e, t) {
  let i = n.nodeValue.length, s = -1, r = 1e9, o = 0;
  for (let l = 0; l < i; l++) {
    let a = Et(n, l, l + 1).getClientRects();
    for (let h = 0; h < a.length; h++) {
      let c = a[h];
      if (c.top == c.bottom)
        continue;
      o || (o = e - c.left);
      let f = (c.top > t ? c.top - t : t - c.bottom) - 1;
      if (c.left - 1 <= e && c.right + 1 >= e && f < r) {
        let u = e >= (c.left + c.right) / 2, d = u;
        if ((b.chrome || b.gecko) && Et(n, l).getBoundingClientRect().left == c.right && (d = !u), f <= 0)
          return { node: n, offset: l + (d ? 1 : 0) };
        s = l + (d ? 1 : 0), r = f;
      }
    }
  }
  return { node: n, offset: s > -1 ? s : o > 0 ? n.nodeValue.length : 0 };
}
function ka(n, { x: e, y: t }, i, s = -1) {
  var r;
  let o = n.contentDOM.getBoundingClientRect(), l = o.top + n.viewState.paddingTop, a, { docHeight: h } = n.viewState, c = t - l;
  if (c < 0)
    return 0;
  if (c > h)
    return n.state.doc.length;
  for (let S = n.defaultLineHeight / 2, $ = !1; a = n.elementAtHeight(c), a.type != G.Text; )
    for (; c = s > 0 ? a.bottom + S : a.top - S, !(c >= 0 && c <= h); ) {
      if ($)
        return i ? null : 0;
      $ = !0, s = -s;
    }
  t = l + c;
  let f = a.from;
  if (f < n.viewport.from)
    return n.viewport.from == 0 ? 0 : i ? null : ao(n, o, a, e, t);
  if (f > n.viewport.to)
    return n.viewport.to == n.state.doc.length ? n.state.doc.length : i ? null : ao(n, o, a, e, t);
  let u = n.dom.ownerDocument, d = n.root.elementFromPoint ? n.root : u, O = d.elementFromPoint(e, t);
  O && !n.contentDOM.contains(O) && (O = null), O || (e = Math.max(o.left + 1, Math.min(o.right - 1, e)), O = d.elementFromPoint(e, t), O && !n.contentDOM.contains(O) && (O = null));
  let m, Q = -1;
  if (O && ((r = n.docView.nearest(O)) === null || r === void 0 ? void 0 : r.isEditable) != !1) {
    if (u.caretPositionFromPoint) {
      let S = u.caretPositionFromPoint(e, t);
      S && ({ offsetNode: m, offset: Q } = S);
    } else if (u.caretRangeFromPoint) {
      let S = u.caretRangeFromPoint(e, t);
      S && ({ startContainer: m, startOffset: Q } = S, (b.safari && mf(m, Q, e) || b.chrome && Qf(m, Q, e)) && (m = void 0));
    }
  }
  if (!m || !n.docView.dom.contains(m)) {
    let S = re.find(n.docView, f);
    if (!S)
      return c > a.top + a.height / 2 ? a.to : a.from;
    ({ node: m, offset: Q } = Is(S.dom, e, t));
  }
  return n.docView.posFromDOM(m, Q);
}
function ao(n, e, t, i, s) {
  let r = Math.round((i - e.left) * n.defaultCharacterWidth);
  n.lineWrapping && t.height > n.defaultLineHeight * 1.5 && (r += Math.floor((s - t.top) / n.defaultLineHeight) * n.viewState.heightOracle.lineLength);
  let o = n.state.sliceDoc(t.from, t.to);
  return t.from + Xc(o, r, n.state.tabSize);
}
function mf(n, e, t) {
  let i;
  if (n.nodeType != 3 || e != (i = n.nodeValue.length))
    return !1;
  for (let s = n.nextSibling; s; s = s.nextSibling)
    if (s.nodeType != 1 || s.nodeName != "BR")
      return !1;
  return Et(n, i - 1, i).getBoundingClientRect().left > t;
}
function Qf(n, e, t) {
  if (e != 0)
    return !1;
  for (let s = n; ; ) {
    let r = s.parentNode;
    if (!r || r.nodeType != 1 || r.firstChild != s)
      return !1;
    if (r.classList.contains("cm-line"))
      break;
    s = r;
  }
  let i = n.nodeType == 1 ? n.getBoundingClientRect() : Et(n, 0, Math.max(n.nodeValue.length, 1)).getBoundingClientRect();
  return t - i.left > 5;
}
function yf(n, e, t, i) {
  let s = n.state.doc.lineAt(e.head), r = !i || !n.lineWrapping ? null : n.coordsAtPos(e.assoc < 0 && e.head > s.from ? e.head - 1 : e.head);
  if (r) {
    let a = n.dom.getBoundingClientRect(), h = n.textDirectionAt(s.from), c = n.posAtCoords({
      x: t == (h == V.LTR) ? a.right - 1 : a.left + 1,
      y: (r.top + r.bottom) / 2
    });
    if (c != null)
      return g.cursor(c, t ? -1 : 1);
  }
  let o = re.find(n.docView, e.head), l = o ? t ? o.posAtEnd : o.posAtStart : t ? s.to : s.from;
  return g.cursor(l, t ? -1 : 1);
}
function ho(n, e, t, i) {
  let s = n.state.doc.lineAt(e.head), r = n.bidiSpans(s), o = n.textDirectionAt(s.from);
  for (let l = e, a = null; ; ) {
    let h = of(s, r, o, l, t), c = Sa;
    if (!h) {
      if (s.number == (t ? n.state.doc.lines : 1))
        return l;
      c = `
`, s = n.state.doc.line(s.number + (t ? 1 : -1)), r = n.bidiSpans(s), h = g.cursor(t ? s.from : s.to);
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
function Sf(n, e, t) {
  let i = n.state.charCategorizer(e), s = i(t);
  return (r) => {
    let o = i(r);
    return s == se.Space && (s = o), s == o;
  };
}
function bf(n, e, t, i) {
  let s = e.head, r = t ? 1 : -1;
  if (s == (t ? n.state.doc.length : 0))
    return g.cursor(s, e.assoc);
  let o = e.goalColumn, l, a = n.contentDOM.getBoundingClientRect(), h = n.coordsAtPos(s), c = n.documentTop;
  if (h)
    o == null && (o = h.left - a.left), l = r < 0 ? h.top : h.bottom;
  else {
    let d = n.viewState.lineBlockAt(s);
    o == null && (o = Math.min(a.right - a.left, n.defaultCharacterWidth * (s - d.from))), l = (r < 0 ? d.top : d.bottom) + c;
  }
  let f = a.left + o, u = i != null ? i : n.defaultLineHeight >> 1;
  for (let d = 0; ; d += 10) {
    let O = l + (u + d) * r, m = ka(n, { x: f, y: O }, !1, r);
    if (O < a.top || O > a.bottom || (r < 0 ? m < s : m > s))
      return g.cursor(m, e.assoc, void 0, o);
  }
}
function Yn(n, e, t) {
  let i = n.state.facet(ga).map((s) => s(n));
  for (; ; ) {
    let s = !1;
    for (let r of i)
      r.between(t.from - 1, t.from + 1, (o, l, a) => {
        t.from > o && t.from < l && (t = e.from > t.from ? g.cursor(o, 1) : g.cursor(l, -1), s = !0);
      });
    if (!s)
      return t;
  }
}
class xf {
  constructor(e) {
    this.lastKeyCode = 0, this.lastKeyTime = 0, this.lastTouchTime = 0, this.lastFocusTime = 0, this.lastScrollTop = 0, this.lastScrollLeft = 0, this.chromeScrollHack = -1, this.pendingIOSKey = void 0, this.lastSelectionOrigin = null, this.lastSelectionTime = 0, this.lastEscPress = 0, this.lastContextMenu = 0, this.scrollHandlers = [], this.registeredEvents = [], this.customHandlers = [], this.composing = -1, this.compositionFirstChange = null, this.compositionEndedAt = 0, this.rapidCompositionStart = !1, this.mouseSelection = null;
    for (let t in Y) {
      let i = Y[t];
      e.contentDOM.addEventListener(t, (s) => {
        !co(e, s) || this.ignoreDuringComposition(s) || t == "keydown" && this.keydown(e, s) || (this.mustFlushObserver(s) && e.observer.forceFlush(), this.runCustomHandlers(t, e, s) ? s.preventDefault() : i(e, s));
      }, zs[t]), this.registeredEvents.push(t);
    }
    b.chrome && b.chrome_version == 102 && e.scrollDOM.addEventListener("wheel", () => {
      this.chromeScrollHack < 0 ? e.contentDOM.style.pointerEvents = "none" : window.clearTimeout(this.chromeScrollHack), this.chromeScrollHack = setTimeout(() => {
        this.chromeScrollHack = -1, e.contentDOM.style.pointerEvents = "";
      }, 100);
    }, { passive: !0 }), this.notifiedFocused = e.hasFocus, b.safari && e.contentDOM.addEventListener("input", () => null);
  }
  setSelectionOrigin(e) {
    this.lastSelectionOrigin = e, this.lastSelectionTime = Date.now();
  }
  ensureHandlers(e, t) {
    var i;
    let s;
    this.customHandlers = [];
    for (let r of t)
      if (s = (i = r.update(e).spec) === null || i === void 0 ? void 0 : i.domEventHandlers) {
        this.customHandlers.push({ plugin: r.value, handlers: s });
        for (let o in s)
          this.registeredEvents.indexOf(o) < 0 && o != "scroll" && (this.registeredEvents.push(o), e.contentDOM.addEventListener(o, (l) => {
            !co(e, l) || this.runCustomHandlers(o, e, l) && l.preventDefault();
          }));
      }
  }
  runCustomHandlers(e, t, i) {
    for (let s of this.customHandlers) {
      let r = s.handlers[e];
      if (r)
        try {
          if (r.call(s.plugin, i, t) || i.defaultPrevented)
            return !0;
        } catch (o) {
          ve(t.state, o);
        }
    }
    return !1;
  }
  runScrollHandlers(e, t) {
    this.lastScrollTop = e.scrollDOM.scrollTop, this.lastScrollLeft = e.scrollDOM.scrollLeft;
    for (let i of this.customHandlers) {
      let s = i.handlers.scroll;
      if (s)
        try {
          s.call(i.plugin, t, e);
        } catch (r) {
          ve(e.state, r);
        }
    }
  }
  keydown(e, t) {
    if (this.lastKeyCode = t.keyCode, this.lastKeyTime = Date.now(), t.keyCode == 9 && Date.now() < this.lastEscPress + 2e3)
      return !0;
    if (b.android && b.chrome && !t.synthetic && (t.keyCode == 13 || t.keyCode == 8))
      return e.observer.delayAndroidKey(t.key, t.keyCode), !0;
    let i;
    return b.ios && (i = wa.find((s) => s.keyCode == t.keyCode)) && !(t.ctrlKey || t.altKey || t.metaKey) && !t.synthetic ? (this.pendingIOSKey = i, setTimeout(() => this.flushIOSKey(e), 250), !0) : !1;
  }
  flushIOSKey(e) {
    let t = this.pendingIOSKey;
    return t ? (this.pendingIOSKey = void 0, ni(e.contentDOM, t.key, t.keyCode)) : !1;
  }
  ignoreDuringComposition(e) {
    return /^key/.test(e.type) ? this.composing > 0 ? !0 : b.safari && !b.ios && Date.now() - this.compositionEndedAt < 100 ? (this.compositionEndedAt = 0, !0) : !1 : !1;
  }
  mustFlushObserver(e) {
    return e.type == "keydown" && e.keyCode != 229 || e.type == "compositionend" && !b.ios;
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
const wa = [
  { key: "Backspace", keyCode: 8, inputType: "deleteContentBackward" },
  { key: "Enter", keyCode: 13, inputType: "insertParagraph" },
  { key: "Delete", keyCode: 46, inputType: "deleteContentForward" }
], Ta = [16, 17, 18, 20, 91, 92, 224, 225];
class $f {
  constructor(e, t, i, s) {
    this.view = e, this.style = i, this.mustSelect = s, this.lastEvent = t;
    let r = e.contentDOM.ownerDocument;
    r.addEventListener("mousemove", this.move = this.move.bind(this)), r.addEventListener("mouseup", this.up = this.up.bind(this)), this.extend = t.shiftKey, this.multiple = e.state.facet(Z.allowMultipleSelections) && kf(e, t), this.dragMove = wf(e, t), this.dragging = Tf(e, t) && fr(t) == 1 ? null : !1, this.dragging === !1 && (t.preventDefault(), this.select(t));
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
function kf(n, e) {
  let t = n.state.facet(aa);
  return t.length ? t[0](e) : b.mac ? e.metaKey : e.ctrlKey;
}
function wf(n, e) {
  let t = n.state.facet(ha);
  return t.length ? t[0](e) : b.mac ? !e.altKey : !e.ctrlKey;
}
function Tf(n, e) {
  let { main: t } = n.state.selection;
  if (t.empty)
    return !1;
  let i = Ki(n.root);
  if (!i || i.rangeCount == 0)
    return !0;
  let s = i.getRangeAt(0).getClientRects();
  for (let r = 0; r < s.length; r++) {
    let o = s[r];
    if (o.left <= e.clientX && o.right >= e.clientX && o.top <= e.clientY && o.bottom >= e.clientY)
      return !0;
  }
  return !1;
}
function co(n, e) {
  if (!e.bubbles)
    return !0;
  if (e.defaultPrevented)
    return !1;
  for (let t = e.target, i; t != n.contentDOM; t = t.parentNode)
    if (!t || t.nodeType == 11 || (i = q.get(t)) && i.ignoreEvent(e))
      return !1;
  return !0;
}
const Y = /* @__PURE__ */ Object.create(null), zs = /* @__PURE__ */ Object.create(null), va = b.ie && b.ie_version < 15 || b.ios && b.webkit_version < 604;
function vf(n) {
  let e = n.dom.parentNode;
  if (!e)
    return;
  let t = e.appendChild(document.createElement("textarea"));
  t.style.cssText = "position: fixed; left: -10000px; top: 10px", t.focus(), setTimeout(() => {
    n.focus(), t.remove(), Pa(n, t.value);
  }, 50);
}
function Pa(n, e) {
  let { state: t } = n, i, s = 1, r = t.toText(e), o = r.lines == t.selection.ranges.length;
  if (Bs != null && t.selection.ranges.every((a) => a.empty) && Bs == r.toString()) {
    let a = -1;
    i = t.changeByRange((h) => {
      let c = t.doc.lineAt(h.from);
      if (c.from == a)
        return { range: h };
      a = c.from;
      let f = t.toText((o ? r.line(s++).text : e) + t.lineBreak);
      return {
        changes: { from: c.from, insert: f },
        range: g.cursor(h.from + f.length)
      };
    });
  } else
    o ? i = t.changeByRange((a) => {
      let h = r.line(s++);
      return {
        changes: { from: a.from, to: a.to, insert: h.text },
        range: g.cursor(a.from + h.length)
      };
    }) : i = t.replaceSelection(r);
  n.dispatch(i, {
    userEvent: "input.paste",
    scrollIntoView: !0
  });
}
Y.keydown = (n, e) => {
  n.inputState.setSelectionOrigin("select"), e.keyCode == 27 ? n.inputState.lastEscPress = Date.now() : Ta.indexOf(e.keyCode) < 0 && (n.inputState.lastEscPress = 0);
};
Y.touchstart = (n, e) => {
  n.inputState.lastTouchTime = Date.now(), n.inputState.setSelectionOrigin("select.pointer");
};
Y.touchmove = (n) => {
  n.inputState.setSelectionOrigin("select.pointer");
};
zs.touchstart = zs.touchmove = { passive: !0 };
Y.mousedown = (n, e) => {
  if (n.observer.flush(), n.inputState.lastTouchTime > Date.now() - 2e3 && fr(e) == 1)
    return;
  let t = null;
  for (let i of n.state.facet(ca))
    if (t = i(n, e), t)
      break;
  if (!t && e.button == 0 && (t = Rf(n, e)), t) {
    let i = n.root.activeElement != n.contentDOM;
    i && n.observer.ignore(() => Fl(n.contentDOM)), n.inputState.startMouseSelection(new $f(n, e, t, i));
  }
};
function fo(n, e, t, i) {
  if (i == 1)
    return g.cursor(e, t);
  if (i == 2)
    return Of(n.state, e, t);
  {
    let s = re.find(n.docView, e), r = n.state.doc.lineAt(s ? s.posAtEnd : e), o = s ? s.posAtStart : r.from, l = s ? s.posAtEnd : r.to;
    return l < n.state.doc.length && l == r.to && l++, g.range(o, l);
  }
}
let Ca = (n, e) => n >= e.top && n <= e.bottom, uo = (n, e, t) => Ca(e, t) && n >= t.left && n <= t.right;
function Pf(n, e, t, i) {
  let s = re.find(n.docView, e);
  if (!s)
    return 1;
  let r = e - s.posAtStart;
  if (r == 0)
    return 1;
  if (r == s.length)
    return -1;
  let o = s.coordsAt(r, -1);
  if (o && uo(t, i, o))
    return -1;
  let l = s.coordsAt(r, 1);
  return l && uo(t, i, l) ? 1 : o && Ca(i, o) ? -1 : 1;
}
function Oo(n, e) {
  let t = n.posAtCoords({ x: e.clientX, y: e.clientY }, !1);
  return { pos: t, bias: Pf(n, t, e.clientX, e.clientY) };
}
const Cf = b.ie && b.ie_version <= 11;
let po = null, go = 0, mo = 0;
function fr(n) {
  if (!Cf)
    return n.detail;
  let e = po, t = mo;
  return po = n, mo = Date.now(), go = !e || t > Date.now() - 400 && Math.abs(e.clientX - n.clientX) < 2 && Math.abs(e.clientY - n.clientY) < 2 ? (go + 1) % 3 : 1;
}
function Rf(n, e) {
  let t = Oo(n, e), i = fr(e), s = n.state.selection, r = t, o = e;
  return {
    update(l) {
      l.docChanged && (t && (t.pos = l.changes.mapPos(t.pos)), s = s.map(l.changes), o = null);
    },
    get(l, a, h) {
      let c;
      if (o && l.clientX == o.clientX && l.clientY == o.clientY ? c = r : (c = r = Oo(n, l), o = l), !c || !t)
        return s;
      let f = fo(n, c.pos, c.bias, i);
      if (t.pos != c.pos && !a) {
        let u = fo(n, t.pos, t.bias, i), d = Math.min(u.from, f.from), O = Math.max(u.to, f.to);
        f = d < f.from ? g.range(d, O) : g.range(O, d);
      }
      return a ? s.replaceRange(s.main.extend(f.from, f.to)) : h && s.ranges.length > 1 && s.ranges.some((u) => u.eq(f)) ? Af(s, f) : h ? s.addRange(f) : g.create([f]);
    }
  };
}
function Af(n, e) {
  for (let t = 0; ; t++)
    if (n.ranges[t].eq(e))
      return g.create(n.ranges.slice(0, t).concat(n.ranges.slice(t + 1)), n.mainIndex == t ? 0 : n.mainIndex - (n.mainIndex > t ? 1 : 0));
}
Y.dragstart = (n, e) => {
  let { selection: { main: t } } = n.state, { mouseSelection: i } = n.inputState;
  i && (i.dragging = t), e.dataTransfer && (e.dataTransfer.setData("Text", n.state.sliceDoc(t.from, t.to)), e.dataTransfer.effectAllowed = "copyMove");
};
function Qo(n, e, t, i) {
  if (!t)
    return;
  let s = n.posAtCoords({ x: e.clientX, y: e.clientY }, !1);
  e.preventDefault();
  let { mouseSelection: r } = n.inputState, o = i && r && r.dragging && r.dragMove ? { from: r.dragging.from, to: r.dragging.to } : null, l = { from: s, insert: t }, a = n.state.changes(o ? [o, l] : l);
  n.focus(), n.dispatch({
    changes: a,
    selection: { anchor: a.mapPos(s, -1), head: a.mapPos(s, 1) },
    userEvent: o ? "move.drop" : "input.drop"
  });
}
Y.drop = (n, e) => {
  if (!e.dataTransfer)
    return;
  if (n.state.readOnly)
    return e.preventDefault();
  let t = e.dataTransfer.files;
  if (t && t.length) {
    e.preventDefault();
    let i = Array(t.length), s = 0, r = () => {
      ++s == t.length && Qo(n, e, i.filter((o) => o != null).join(n.state.lineBreak), !1);
    };
    for (let o = 0; o < t.length; o++) {
      let l = new FileReader();
      l.onerror = r, l.onload = () => {
        /[\x00-\x08\x0e-\x1f]{2}/.test(l.result) || (i[o] = l.result), r();
      }, l.readAsText(t[o]);
    }
  } else
    Qo(n, e, e.dataTransfer.getData("Text"), !0);
};
Y.paste = (n, e) => {
  if (n.state.readOnly)
    return e.preventDefault();
  n.observer.flush();
  let t = va ? null : e.clipboardData;
  t ? (Pa(n, t.getData("text/plain")), e.preventDefault()) : vf(n);
};
function Mf(n, e) {
  let t = n.dom.parentNode;
  if (!t)
    return;
  let i = t.appendChild(document.createElement("textarea"));
  i.style.cssText = "position: fixed; left: -10000px; top: 10px", i.value = e, i.focus(), i.selectionEnd = e.length, i.selectionStart = 0, setTimeout(() => {
    i.remove(), n.focus();
  }, 50);
}
function Wf(n) {
  let e = [], t = [], i = !1;
  for (let s of n.selection.ranges)
    s.empty || (e.push(n.sliceDoc(s.from, s.to)), t.push(s));
  if (!e.length) {
    let s = -1;
    for (let { from: r } of n.selection.ranges) {
      let o = n.doc.lineAt(r);
      o.number > s && (e.push(o.text), t.push({ from: o.from, to: Math.min(n.doc.length, o.to + 1) })), s = o.number;
    }
    i = !0;
  }
  return { text: e.join(n.lineBreak), ranges: t, linewise: i };
}
let Bs = null;
Y.copy = Y.cut = (n, e) => {
  let { text: t, ranges: i, linewise: s } = Wf(n.state);
  if (!t && !s)
    return;
  Bs = s ? t : null;
  let r = va ? null : e.clipboardData;
  r ? (e.preventDefault(), r.clearData(), r.setData("text/plain", t)) : Mf(n, t), e.type == "cut" && !n.state.readOnly && n.dispatch({
    changes: i,
    scrollIntoView: !0,
    userEvent: "delete.cut"
  });
};
function Ra(n) {
  setTimeout(() => {
    n.hasFocus != n.inputState.notifiedFocused && n.update([]);
  }, 10);
}
Y.focus = (n) => {
  n.inputState.lastFocusTime = Date.now(), !n.scrollDOM.scrollTop && (n.inputState.lastScrollTop || n.inputState.lastScrollLeft) && (n.scrollDOM.scrollTop = n.inputState.lastScrollTop, n.scrollDOM.scrollLeft = n.inputState.lastScrollLeft), Ra(n);
};
Y.blur = (n) => {
  n.observer.clearSelectionRange(), Ra(n);
};
function Aa(n, e) {
  if (n.docView.compositionDeco.size) {
    n.inputState.rapidCompositionStart = e;
    try {
      n.update([]);
    } finally {
      n.inputState.rapidCompositionStart = !1;
    }
  }
}
Y.compositionstart = Y.compositionupdate = (n) => {
  n.inputState.compositionFirstChange == null && (n.inputState.compositionFirstChange = !0), n.inputState.composing < 0 && (n.inputState.composing = 0, n.docView.compositionDeco.size && (n.observer.flush(), Aa(n, !0)));
};
Y.compositionend = (n) => {
  n.inputState.composing = -1, n.inputState.compositionEndedAt = Date.now(), n.inputState.compositionFirstChange = null, setTimeout(() => {
    n.inputState.composing < 0 && Aa(n, !1);
  }, 50);
};
Y.contextmenu = (n) => {
  n.inputState.lastContextMenu = Date.now();
};
Y.beforeinput = (n, e) => {
  var t;
  let i;
  if (b.chrome && b.android && (i = wa.find((s) => s.inputType == e.inputType)) && (n.observer.delayAndroidKey(i.key, i.keyCode), i.key == "Backspace" || i.key == "Delete")) {
    let s = ((t = window.visualViewport) === null || t === void 0 ? void 0 : t.height) || 0;
    setTimeout(() => {
      var r;
      (((r = window.visualViewport) === null || r === void 0 ? void 0 : r.height) || 0) > s + 10 && n.hasFocus && (n.contentDOM.blur(), n.focus());
    }, 100);
  }
};
const yo = ["pre-wrap", "normal", "pre-line", "break-spaces"];
class Zf {
  constructor() {
    this.doc = D.empty, this.lineWrapping = !1, this.heightSamples = {}, this.lineHeight = 14, this.charWidth = 7, this.lineLength = 30, this.heightChanged = !1;
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
    return yo.indexOf(e) > -1 != this.lineWrapping;
  }
  mustRefreshForHeights(e) {
    let t = !1;
    for (let i = 0; i < e.length; i++) {
      let s = e[i];
      s < 0 ? i++ : this.heightSamples[Math.floor(s * 10)] || (t = !0, this.heightSamples[Math.floor(s * 10)] = !0);
    }
    return t;
  }
  refresh(e, t, i, s, r) {
    let o = yo.indexOf(e) > -1, l = Math.round(t) != Math.round(this.lineHeight) || this.lineWrapping != o;
    if (this.lineWrapping = o, this.lineHeight = t, this.charWidth = i, this.lineLength = s, l) {
      this.heightSamples = {};
      for (let a = 0; a < r.length; a++) {
        let h = r[a];
        h < 0 ? a++ : this.heightSamples[Math.floor(h * 10)] = !0;
      }
    }
    return l;
  }
}
class Df {
  constructor(e, t) {
    this.from = e, this.heights = t, this.index = 0;
  }
  get more() {
    return this.index < this.heights.length;
  }
}
class nt {
  constructor(e, t, i, s, r) {
    this.from = e, this.length = t, this.top = i, this.height = s, this.type = r;
  }
  get to() {
    return this.from + this.length;
  }
  get bottom() {
    return this.top + this.height;
  }
  join(e) {
    let t = (Array.isArray(this.type) ? this.type : [this]).concat(Array.isArray(e.type) ? e.type : [e]);
    return new nt(this.from, this.length + e.length, this.top, this.height + e.height, t);
  }
}
var E = /* @__PURE__ */ function(n) {
  return n[n.ByPos = 0] = "ByPos", n[n.ByHeight = 1] = "ByHeight", n[n.ByPosNoHeight = 2] = "ByPosNoHeight", n;
}(E || (E = {}));
const _i = 1e-3;
class ue {
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
    this.height != t && (Math.abs(this.height - t) > _i && (e.heightChanged = !0), this.height = t);
  }
  replace(e, t, i) {
    return ue.of(i);
  }
  decomposeLeft(e, t) {
    t.push(this);
  }
  decomposeRight(e, t) {
    t.push(this);
  }
  applyChanges(e, t, i, s) {
    let r = this;
    for (let o = s.length - 1; o >= 0; o--) {
      let { fromA: l, toA: a, fromB: h, toB: c } = s[o], f = r.lineAt(l, E.ByPosNoHeight, t, 0, 0), u = f.to >= a ? f : r.lineAt(a, E.ByPosNoHeight, t, 0, 0);
      for (c += u.to - a, a = u.to; o > 0 && f.from <= s[o - 1].toA; )
        l = s[o - 1].fromA, h = s[o - 1].fromB, o--, l < f.from && (f = r.lineAt(l, E.ByPosNoHeight, t, 0, 0));
      h += f.from - l, l = f.from;
      let d = ur.build(i, e, h, c);
      r = r.replace(l, a, d);
    }
    return r.updateHeight(i, 0);
  }
  static empty() {
    return new Oe(0, 0);
  }
  static of(e) {
    if (e.length == 1)
      return e[0];
    let t = 0, i = e.length, s = 0, r = 0;
    for (; ; )
      if (t == i)
        if (s > r * 2) {
          let l = e[t - 1];
          l.break ? e.splice(--t, 1, l.left, null, l.right) : e.splice(--t, 1, l.left, l.right), i += 1 + l.break, s -= l.size;
        } else if (r > s * 2) {
          let l = e[i];
          l.break ? e.splice(i, 1, l.left, null, l.right) : e.splice(i, 1, l.left, l.right), i += 2 + l.break, r -= l.size;
        } else
          break;
      else if (s < r) {
        let l = e[t++];
        l && (s += l.size);
      } else {
        let l = e[--i];
        l && (r += l.size);
      }
    let o = 0;
    return e[t - 1] == null ? (o = 1, t--) : e[t] == null && (o = 1, i++), new Xf(ue.of(e.slice(0, t)), o, ue.of(e.slice(i)));
  }
}
ue.prototype.size = 1;
class Ma extends ue {
  constructor(e, t, i) {
    super(e, t), this.type = i;
  }
  blockAt(e, t, i, s) {
    return new nt(s, this.length, i, this.height, this.type);
  }
  lineAt(e, t, i, s, r) {
    return this.blockAt(0, i, s, r);
  }
  forEachLine(e, t, i, s, r, o) {
    e <= r + this.length && t >= r && o(this.blockAt(0, i, s, r));
  }
  updateHeight(e, t = 0, i = !1, s) {
    return s && s.from <= t && s.more && this.setHeight(e, s.heights[s.index++]), this.outdated = !1, this;
  }
  toString() {
    return `block(${this.length})`;
  }
}
class Oe extends Ma {
  constructor(e, t) {
    super(e, t, G.Text), this.collapsed = 0, this.widgetHeight = 0;
  }
  replace(e, t, i) {
    let s = i[0];
    return i.length == 1 && (s instanceof Oe || s instanceof J && s.flags & 4) && Math.abs(this.length - s.length) < 10 ? (s instanceof J ? s = new Oe(s.length, this.height) : s.height = this.height, this.outdated || (s.outdated = !1), s) : ue.of(i);
  }
  updateHeight(e, t = 0, i = !1, s) {
    return s && s.from <= t && s.more ? this.setHeight(e, s.heights[s.index++]) : (i || this.outdated) && this.setHeight(e, Math.max(this.widgetHeight, e.heightForLine(this.length - this.collapsed))), this.outdated = !1, this;
  }
  toString() {
    return `line(${this.length}${this.collapsed ? -this.collapsed : ""}${this.widgetHeight ? ":" + this.widgetHeight : ""})`;
  }
}
class J extends ue {
  constructor(e) {
    super(e, 0);
  }
  lines(e, t) {
    let i = e.lineAt(t).number, s = e.lineAt(t + this.length).number;
    return { firstLine: i, lastLine: s, lineHeight: this.height / (s - i + 1) };
  }
  blockAt(e, t, i, s) {
    let { firstLine: r, lastLine: o, lineHeight: l } = this.lines(t, s), a = Math.max(0, Math.min(o - r, Math.floor((e - i) / l))), { from: h, length: c } = t.line(r + a);
    return new nt(h, c, i + l * a, l, G.Text);
  }
  lineAt(e, t, i, s, r) {
    if (t == E.ByHeight)
      return this.blockAt(e, i, s, r);
    if (t == E.ByPosNoHeight) {
      let { from: f, to: u } = i.lineAt(e);
      return new nt(f, u - f, 0, 0, G.Text);
    }
    let { firstLine: o, lineHeight: l } = this.lines(i, r), { from: a, length: h, number: c } = i.lineAt(e);
    return new nt(a, h, s + l * (c - o), l, G.Text);
  }
  forEachLine(e, t, i, s, r, o) {
    let { firstLine: l, lineHeight: a } = this.lines(i, r);
    for (let h = Math.max(e, r), c = Math.min(r + this.length, t); h <= c; ) {
      let f = i.lineAt(h);
      h == e && (s += a * (f.number - l)), o(new nt(f.from, f.length, s, a, G.Text)), s += a, h = f.to + 1;
    }
  }
  replace(e, t, i) {
    let s = this.length - t;
    if (s > 0) {
      let r = i[i.length - 1];
      r instanceof J ? i[i.length - 1] = new J(r.length + s) : i.push(null, new J(s - 1));
    }
    if (e > 0) {
      let r = i[0];
      r instanceof J ? i[0] = new J(e + r.length) : i.unshift(new J(e - 1), null);
    }
    return ue.of(i);
  }
  decomposeLeft(e, t) {
    t.push(new J(e - 1), null);
  }
  decomposeRight(e, t) {
    t.push(null, new J(this.length - e - 1));
  }
  updateHeight(e, t = 0, i = !1, s) {
    let r = t + this.length;
    if (s && s.from <= t + this.length && s.more) {
      let o = [], l = Math.max(t, s.from), a = -1, h = e.heightChanged;
      for (s.from > t && o.push(new J(s.from - t - 1).updateHeight(e, t)); l <= r && s.more; ) {
        let f = e.doc.lineAt(l).length;
        o.length && o.push(null);
        let u = s.heights[s.index++];
        a == -1 ? a = u : Math.abs(u - a) >= _i && (a = -2);
        let d = new Oe(f, u);
        d.outdated = !1, o.push(d), l += f + 1;
      }
      l <= r && o.push(null, new J(r - l).updateHeight(e, l));
      let c = ue.of(o);
      return e.heightChanged = h || a < 0 || Math.abs(c.height - this.height) >= _i || Math.abs(a - this.lines(e.doc, t).lineHeight) >= _i, c;
    } else
      (i || this.outdated) && (this.setHeight(e, e.heightForGap(t, t + this.length)), this.outdated = !1);
    return this;
  }
  toString() {
    return `gap(${this.length})`;
  }
}
class Xf extends ue {
  constructor(e, t, i) {
    super(e.length + t + i.length, e.height + i.height, t | (e.outdated || i.outdated ? 2 : 0)), this.left = e, this.right = i, this.size = e.size + i.size;
  }
  get break() {
    return this.flags & 1;
  }
  blockAt(e, t, i, s) {
    let r = i + this.left.height;
    return e < r ? this.left.blockAt(e, t, i, s) : this.right.blockAt(e, t, r, s + this.left.length + this.break);
  }
  lineAt(e, t, i, s, r) {
    let o = s + this.left.height, l = r + this.left.length + this.break, a = t == E.ByHeight ? e < o : e < l, h = a ? this.left.lineAt(e, t, i, s, r) : this.right.lineAt(e, t, i, o, l);
    if (this.break || (a ? h.to < l : h.from > l))
      return h;
    let c = t == E.ByPosNoHeight ? E.ByPosNoHeight : E.ByPos;
    return a ? h.join(this.right.lineAt(l, c, i, o, l)) : this.left.lineAt(l, c, i, s, r).join(h);
  }
  forEachLine(e, t, i, s, r, o) {
    let l = s + this.left.height, a = r + this.left.length + this.break;
    if (this.break)
      e < a && this.left.forEachLine(e, t, i, s, r, o), t >= a && this.right.forEachLine(e, t, i, l, a, o);
    else {
      let h = this.lineAt(a, E.ByPos, i, s, r);
      e < h.from && this.left.forEachLine(e, h.from - 1, i, s, r, o), h.to >= e && h.from <= t && o(h), t > h.to && this.right.forEachLine(h.to + 1, t, i, l, a, o);
    }
  }
  replace(e, t, i) {
    let s = this.left.length + this.break;
    if (t < s)
      return this.balanced(this.left.replace(e, t, i), this.right);
    if (e > this.left.length)
      return this.balanced(this.left, this.right.replace(e - s, t - s, i));
    let r = [];
    e > 0 && this.decomposeLeft(e, r);
    let o = r.length;
    for (let l of i)
      r.push(l);
    if (e > 0 && So(r, o - 1), t < this.length) {
      let l = r.length;
      this.decomposeRight(t, r), So(r, l);
    }
    return ue.of(r);
  }
  decomposeLeft(e, t) {
    let i = this.left.length;
    if (e <= i)
      return this.left.decomposeLeft(e, t);
    t.push(this.left), this.break && (i++, e >= i && t.push(null)), e > i && this.right.decomposeLeft(e - i, t);
  }
  decomposeRight(e, t) {
    let i = this.left.length, s = i + this.break;
    if (e >= s)
      return this.right.decomposeRight(e - s, t);
    e < i && this.left.decomposeRight(e, t), this.break && e < s && t.push(null), t.push(this.right);
  }
  balanced(e, t) {
    return e.size > 2 * t.size || t.size > 2 * e.size ? ue.of(this.break ? [e, null, t] : [e, t]) : (this.left = e, this.right = t, this.height = e.height + t.height, this.outdated = e.outdated || t.outdated, this.size = e.size + t.size, this.length = e.length + this.break + t.length, this);
  }
  updateHeight(e, t = 0, i = !1, s) {
    let { left: r, right: o } = this, l = t + r.length + this.break, a = null;
    return s && s.from <= t + r.length && s.more ? a = r = r.updateHeight(e, t, i, s) : r.updateHeight(e, t, i), s && s.from <= l + o.length && s.more ? a = o = o.updateHeight(e, l, i, s) : o.updateHeight(e, l, i), a ? this.balanced(r, o) : (this.height = this.left.height + this.right.height, this.outdated = !1, this);
  }
  toString() {
    return this.left + (this.break ? " " : "-") + this.right;
  }
}
function So(n, e) {
  let t, i;
  n[e] == null && (t = n[e - 1]) instanceof J && (i = n[e + 1]) instanceof J && n.splice(e - 1, 3, new J(t.length + 1 + i.length));
}
const jf = 5;
class ur {
  constructor(e, t) {
    this.pos = e, this.oracle = t, this.nodes = [], this.lineStart = -1, this.lineEnd = -1, this.covering = null, this.writtenTo = e;
  }
  get isCovered() {
    return this.covering && this.nodes[this.nodes.length - 1] == this.covering;
  }
  span(e, t) {
    if (this.lineStart > -1) {
      let i = Math.min(t, this.lineEnd), s = this.nodes[this.nodes.length - 1];
      s instanceof Oe ? s.length += i - this.pos : (i > this.pos || !this.isCovered) && this.nodes.push(new Oe(i - this.pos, -1)), this.writtenTo = i, t > i && (this.nodes.push(null), this.writtenTo++, this.lineStart = -1);
    }
    this.pos = t;
  }
  point(e, t, i) {
    if (e < t || i.heightRelevant) {
      let s = i.widget ? i.widget.estimatedHeight : 0;
      s < 0 && (s = this.oracle.lineHeight);
      let r = t - e;
      i.block ? this.addBlock(new Ma(r, s, i.type)) : (r || s >= jf) && this.addLineDeco(s, r);
    } else
      t > e && this.span(e, t);
    this.lineEnd > -1 && this.lineEnd < this.pos && (this.lineEnd = this.oracle.doc.lineAt(this.pos).to);
  }
  enterLine() {
    if (this.lineStart > -1)
      return;
    let { from: e, to: t } = this.oracle.doc.lineAt(this.pos);
    this.lineStart = e, this.lineEnd = t, this.writtenTo < e && ((this.writtenTo < e - 1 || this.nodes[this.nodes.length - 1] == null) && this.nodes.push(this.blankContent(this.writtenTo, e - 1)), this.nodes.push(null)), this.pos > e && this.nodes.push(new Oe(this.pos - e, -1)), this.writtenTo = this.pos;
  }
  blankContent(e, t) {
    let i = new J(t - e);
    return this.oracle.doc.lineAt(e).to == t && (i.flags |= 4), i;
  }
  ensureLine() {
    this.enterLine();
    let e = this.nodes.length ? this.nodes[this.nodes.length - 1] : null;
    if (e instanceof Oe)
      return e;
    let t = new Oe(0, -1);
    return this.nodes.push(t), t;
  }
  addBlock(e) {
    this.enterLine(), e.type == G.WidgetAfter && !this.isCovered && this.ensureLine(), this.nodes.push(e), this.writtenTo = this.pos = this.pos + e.length, e.type != G.WidgetBefore && (this.covering = e);
  }
  addLineDeco(e, t) {
    let i = this.ensureLine();
    i.length += t, i.collapsed += t, i.widgetHeight = Math.max(i.widgetHeight, e), this.writtenTo = this.pos = this.pos + t;
  }
  finish(e) {
    let t = this.nodes.length == 0 ? null : this.nodes[this.nodes.length - 1];
    this.lineStart > -1 && !(t instanceof Oe) && !this.isCovered ? this.nodes.push(new Oe(0, -1)) : (this.writtenTo < this.pos || t == null) && this.nodes.push(this.blankContent(this.writtenTo, this.pos));
    let i = e;
    for (let s of this.nodes)
      s instanceof Oe && s.updateHeight(this.oracle, i), i += s ? s.length : 1;
    return this.nodes;
  }
  static build(e, t, i, s) {
    let r = new ur(i, e);
    return j.spans(t, i, s, r, 0), r.finish(i);
  }
}
function Ef(n, e, t) {
  let i = new qf();
  return j.compare(n, e, t, i, 0), i.changes;
}
class qf {
  constructor() {
    this.changes = [];
  }
  compareRange() {
  }
  comparePoint(e, t, i, s) {
    (e < t || i && i.heightRelevant || s && s.heightRelevant) && Xs(e, t, this.changes, 5);
  }
}
function If(n, e) {
  let t = n.getBoundingClientRect(), i = Math.max(0, t.left), s = Math.min(innerWidth, t.right), r = Math.max(0, t.top), o = Math.min(innerHeight, t.bottom), l = n.ownerDocument.body;
  for (let a = n.parentNode; a && a != l; )
    if (a.nodeType == 1) {
      let h = a, c = window.getComputedStyle(h);
      if ((h.scrollHeight > h.clientHeight || h.scrollWidth > h.clientWidth) && c.overflow != "visible") {
        let f = h.getBoundingClientRect();
        i = Math.max(i, f.left), s = Math.min(s, f.right), r = Math.max(r, f.top), o = Math.min(o, f.bottom);
      }
      a = c.position == "absolute" || c.position == "fixed" ? h.offsetParent : h.parentNode;
    } else if (a.nodeType == 11)
      a = a.host;
    else
      break;
  return {
    left: i - t.left,
    right: Math.max(i, s) - t.left,
    top: r - (t.top + e),
    bottom: Math.max(r, o) - (t.top + e)
  };
}
function zf(n, e) {
  let t = n.getBoundingClientRect();
  return {
    left: 0,
    right: t.right - t.left,
    top: e,
    bottom: t.bottom - (t.top + e)
  };
}
class Hn {
  constructor(e, t, i) {
    this.from = e, this.to = t, this.size = i;
  }
  static same(e, t) {
    if (e.length != t.length)
      return !1;
    for (let i = 0; i < e.length; i++) {
      let s = e[i], r = t[i];
      if (s.from != r.from || s.to != r.to || s.size != r.size)
        return !1;
    }
    return !0;
  }
  draw(e) {
    return T.replace({ widget: new Bf(this.size, e) }).range(this.from, this.to);
  }
}
class Bf extends ft {
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
class bo {
  constructor(e) {
    this.state = e, this.pixelViewport = { left: 0, right: window.innerWidth, top: 0, bottom: 0 }, this.inView = !0, this.paddingTop = 0, this.paddingBottom = 0, this.contentDOMWidth = 0, this.contentDOMHeight = 0, this.editorHeight = 0, this.editorWidth = 0, this.heightOracle = new Zf(), this.scaler = ko, this.scrollTarget = null, this.printing = !1, this.mustMeasureContent = !0, this.defaultTextDirection = V.RTL, this.visibleRanges = [], this.mustEnforceCursorAssoc = !1, this.stateDeco = e.facet(ui).filter((t) => typeof t != "function"), this.heightMap = ue.empty().applyChanges(this.stateDeco, D.empty, this.heightOracle.setDoc(e.doc), [new Ne(0, 0, 0, e.doc.length)]), this.viewport = this.getViewport(0, null), this.updateViewportLines(), this.updateForViewport(), this.lineGaps = this.ensureLineGaps([]), this.lineGapDeco = T.set(this.lineGaps.map((t) => t.draw(!1))), this.computeVisibleRanges();
  }
  updateForViewport() {
    let e = [this.viewport], { main: t } = this.state.selection;
    for (let i = 0; i <= 1; i++) {
      let s = i ? t.head : t.anchor;
      if (!e.some(({ from: r, to: o }) => s >= r && s <= o)) {
        let { from: r, to: o } = this.lineBlockAt(s);
        e.push(new Pi(r, o));
      }
    }
    this.viewports = e.sort((i, s) => i.from - s.from), this.scaler = this.heightMap.height <= 7e6 ? ko : new _f(this.heightOracle.doc, this.heightMap, this.viewports);
  }
  updateViewportLines() {
    this.viewportLines = [], this.heightMap.forEachLine(this.viewport.from, this.viewport.to, this.state.doc, 0, 0, (e) => {
      this.viewportLines.push(this.scaler.scale == 1 ? e : ei(e, this.scaler));
    });
  }
  update(e, t = null) {
    this.state = e.state;
    let i = this.stateDeco;
    this.stateDeco = this.state.facet(ui).filter((h) => typeof h != "function");
    let s = e.changedRanges, r = Ne.extendWithRanges(s, Ef(i, this.stateDeco, e ? e.changes : _.empty(this.state.doc.length))), o = this.heightMap.height;
    this.heightMap = this.heightMap.applyChanges(this.stateDeco, e.startState.doc, this.heightOracle.setDoc(this.state.doc), r), this.heightMap.height != o && (e.flags |= 2);
    let l = r.length ? this.mapViewport(this.viewport, e.changes) : this.viewport;
    (t && (t.range.head < l.from || t.range.head > l.to) || !this.viewportIsAppropriate(l)) && (l = this.getViewport(0, t));
    let a = !e.changes.empty || e.flags & 2 || l.from != this.viewport.from || l.to != this.viewport.to;
    this.viewport = l, this.updateForViewport(), a && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(this.mapLineGaps(this.lineGaps, e.changes))), e.flags |= this.computeVisibleRanges(), t && (this.scrollTarget = t), !this.mustEnforceCursorAssoc && e.selectionSet && e.view.lineWrapping && e.state.selection.main.empty && e.state.selection.main.assoc && (this.mustEnforceCursorAssoc = !0);
  }
  measure(e) {
    let t = e.contentDOM, i = window.getComputedStyle(t), s = this.heightOracle, r = i.whiteSpace;
    this.defaultTextDirection = i.direction == "rtl" ? V.RTL : V.LTR;
    let o = this.heightOracle.mustRefreshForWrapping(r), l = o || this.mustMeasureContent || this.contentDOMHeight != t.clientHeight;
    this.contentDOMHeight = t.clientHeight, this.mustMeasureContent = !1;
    let a = 0, h = 0, c = parseInt(i.paddingTop) || 0, f = parseInt(i.paddingBottom) || 0;
    (this.paddingTop != c || this.paddingBottom != f) && (this.paddingTop = c, this.paddingBottom = f, a |= 10), this.editorWidth != e.scrollDOM.clientWidth && (s.lineWrapping && (l = !0), this.editorWidth = e.scrollDOM.clientWidth, a |= 8);
    let u = (this.printing ? zf : If)(t, this.paddingTop), d = u.top - this.pixelViewport.top, O = u.bottom - this.pixelViewport.bottom;
    this.pixelViewport = u;
    let m = this.pixelViewport.bottom > this.pixelViewport.top && this.pixelViewport.right > this.pixelViewport.left;
    if (m != this.inView && (this.inView = m, m && (l = !0)), !this.inView)
      return 0;
    let Q = t.clientWidth;
    if ((this.contentDOMWidth != Q || this.editorHeight != e.scrollDOM.clientHeight) && (this.contentDOMWidth = Q, this.editorHeight = e.scrollDOM.clientHeight, a |= 8), l) {
      let $ = e.docView.measureVisibleLineHeights(this.viewport);
      if (s.mustRefreshForHeights($) && (o = !0), o || s.lineWrapping && Math.abs(Q - this.contentDOMWidth) > s.charWidth) {
        let { lineHeight: A, charWidth: w } = e.docView.measureTextSize();
        o = s.refresh(r, A, w, Q / w, $), o && (e.docView.minWidth = 0, a |= 8);
      }
      d > 0 && O > 0 ? h = Math.max(d, O) : d < 0 && O < 0 && (h = Math.min(d, O)), s.heightChanged = !1;
      for (let A of this.viewports) {
        let w = A.from == this.viewport.from ? $ : e.docView.measureVisibleLineHeights(A);
        this.heightMap = this.heightMap.updateHeight(s, 0, o, new Df(A.from, w));
      }
      s.heightChanged && (a |= 2);
    }
    let S = !this.viewportIsAppropriate(this.viewport, h) || this.scrollTarget && (this.scrollTarget.range.head < this.viewport.from || this.scrollTarget.range.head > this.viewport.to);
    return S && (this.viewport = this.getViewport(h, this.scrollTarget)), this.updateForViewport(), (a & 2 || S) && this.updateViewportLines(), (this.lineGaps.length || this.viewport.to - this.viewport.from > 4e3) && this.updateLineGaps(this.ensureLineGaps(o ? [] : this.lineGaps)), a |= this.computeVisibleRanges(), this.mustEnforceCursorAssoc && (this.mustEnforceCursorAssoc = !1, e.docView.enforceCursorAssoc()), a;
  }
  get visibleTop() {
    return this.scaler.fromDOM(this.pixelViewport.top);
  }
  get visibleBottom() {
    return this.scaler.fromDOM(this.pixelViewport.bottom);
  }
  getViewport(e, t) {
    let i = 0.5 - Math.max(-0.5, Math.min(0.5, e / 1e3 / 2)), s = this.heightMap, r = this.state.doc, { visibleTop: o, visibleBottom: l } = this, a = new Pi(s.lineAt(o - i * 1e3, E.ByHeight, r, 0, 0).from, s.lineAt(l + (1 - i) * 1e3, E.ByHeight, r, 0, 0).to);
    if (t) {
      let { head: h } = t.range;
      if (h < a.from || h > a.to) {
        let c = Math.min(this.editorHeight, this.pixelViewport.bottom - this.pixelViewport.top), f = s.lineAt(h, E.ByPos, r, 0, 0), u;
        t.y == "center" ? u = (f.top + f.bottom) / 2 - c / 2 : t.y == "start" || t.y == "nearest" && h < a.from ? u = f.top : u = f.bottom - c, a = new Pi(s.lineAt(u - 1e3 / 2, E.ByHeight, r, 0, 0).from, s.lineAt(u + c + 1e3 / 2, E.ByHeight, r, 0, 0).to);
      }
    }
    return a;
  }
  mapViewport(e, t) {
    let i = t.mapPos(e.from, -1), s = t.mapPos(e.to, 1);
    return new Pi(this.heightMap.lineAt(i, E.ByPos, this.state.doc, 0, 0).from, this.heightMap.lineAt(s, E.ByPos, this.state.doc, 0, 0).to);
  }
  viewportIsAppropriate({ from: e, to: t }, i = 0) {
    if (!this.inView)
      return !0;
    let { top: s } = this.heightMap.lineAt(e, E.ByPos, this.state.doc, 0, 0), { bottom: r } = this.heightMap.lineAt(t, E.ByPos, this.state.doc, 0, 0), { visibleTop: o, visibleBottom: l } = this;
    return (e == 0 || s <= o - Math.max(10, Math.min(-i, 250))) && (t == this.state.doc.length || r >= l + Math.max(10, Math.min(i, 250))) && s > o - 2 * 1e3 && r < l + 2 * 1e3;
  }
  mapLineGaps(e, t) {
    if (!e.length || t.empty)
      return e;
    let i = [];
    for (let s of e)
      t.touchesRange(s.from, s.to) || i.push(new Hn(t.mapPos(s.from), t.mapPos(s.to), s.size));
    return i;
  }
  ensureLineGaps(e) {
    let t = [];
    if (this.defaultTextDirection != V.LTR)
      return t;
    for (let i of this.viewportLines) {
      if (i.length < 4e3)
        continue;
      let s = Gf(i.from, i.to, this.stateDeco);
      if (s.total < 4e3)
        continue;
      let r, o;
      if (this.heightOracle.lineWrapping) {
        let h = 2e3 / this.heightOracle.lineLength * this.heightOracle.lineHeight;
        r = Ci(s, (this.visibleTop - i.top - h) / i.height), o = Ci(s, (this.visibleBottom - i.top + h) / i.height);
      } else {
        let h = s.total * this.heightOracle.charWidth, c = 2e3 * this.heightOracle.charWidth;
        r = Ci(s, (this.pixelViewport.left - c) / h), o = Ci(s, (this.pixelViewport.right + c) / h);
      }
      let l = [];
      r > i.from && l.push({ from: i.from, to: r }), o < i.to && l.push({ from: o, to: i.to });
      let a = this.state.selection.main;
      a.from >= i.from && a.from <= i.to && $o(l, a.from - 10, a.from + 10), !a.empty && a.to >= i.from && a.to <= i.to && $o(l, a.to - 10, a.to + 10);
      for (let { from: h, to: c } of l)
        c - h > 1e3 && t.push(Lf(e, (f) => f.from >= i.from && f.to <= i.to && Math.abs(f.from - h) < 1e3 && Math.abs(f.to - c) < 1e3) || new Hn(h, c, this.gapSize(i, h, c, s)));
    }
    return t;
  }
  gapSize(e, t, i, s) {
    let r = xo(s, i) - xo(s, t);
    return this.heightOracle.lineWrapping ? e.height * r : s.total * this.heightOracle.charWidth * r;
  }
  updateLineGaps(e) {
    Hn.same(e, this.lineGaps) || (this.lineGaps = e, this.lineGapDeco = T.set(e.map((t) => t.draw(this.heightOracle.lineWrapping))));
  }
  computeVisibleRanges() {
    let e = this.stateDeco;
    this.lineGaps.length && (e = e.concat(this.lineGapDeco));
    let t = [];
    j.spans(e, this.viewport.from, this.viewport.to, {
      span(s, r) {
        t.push({ from: s, to: r });
      },
      point() {
      }
    }, 20);
    let i = t.length != this.visibleRanges.length || this.visibleRanges.some((s, r) => s.from != t[r].from || s.to != t[r].to);
    return this.visibleRanges = t, i ? 4 : 0;
  }
  lineBlockAt(e) {
    return e >= this.viewport.from && e <= this.viewport.to && this.viewportLines.find((t) => t.from <= e && t.to >= e) || ei(this.heightMap.lineAt(e, E.ByPos, this.state.doc, 0, 0), this.scaler);
  }
  lineBlockAtHeight(e) {
    return ei(this.heightMap.lineAt(this.scaler.fromDOM(e), E.ByHeight, this.state.doc, 0, 0), this.scaler);
  }
  elementAtHeight(e) {
    return ei(this.heightMap.blockAt(this.scaler.fromDOM(e), this.state.doc, 0, 0), this.scaler);
  }
  get docHeight() {
    return this.scaler.toDOM(this.heightMap.height);
  }
  get contentHeight() {
    return this.docHeight + this.paddingTop + this.paddingBottom;
  }
}
class Pi {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
function Gf(n, e, t) {
  let i = [], s = n, r = 0;
  return j.spans(t, n, e, {
    span() {
    },
    point(o, l) {
      o > s && (i.push({ from: s, to: o }), r += o - s), s = l;
    }
  }, 20), s < e && (i.push({ from: s, to: e }), r += e - s), { total: r, ranges: i };
}
function Ci({ total: n, ranges: e }, t) {
  if (t <= 0)
    return e[0].from;
  if (t >= 1)
    return e[e.length - 1].to;
  let i = Math.floor(n * t);
  for (let s = 0; ; s++) {
    let { from: r, to: o } = e[s], l = o - r;
    if (i <= l)
      return r + i;
    i -= l;
  }
}
function xo(n, e) {
  let t = 0;
  for (let { from: i, to: s } of n.ranges) {
    if (e <= s) {
      t += e - i;
      break;
    }
    t += s - i;
  }
  return t / n.total;
}
function $o(n, e, t) {
  for (let i = 0; i < n.length; i++) {
    let s = n[i];
    if (s.from < t && s.to > e) {
      let r = [];
      s.from < e && r.push({ from: s.from, to: e }), s.to > t && r.push({ from: t, to: s.to }), n.splice(i, 1, ...r), i += r.length - 1;
    }
  }
}
function Lf(n, e) {
  for (let t of n)
    if (e(t))
      return t;
}
const ko = {
  toDOM(n) {
    return n;
  },
  fromDOM(n) {
    return n;
  },
  scale: 1
};
class _f {
  constructor(e, t, i) {
    let s = 0, r = 0, o = 0;
    this.viewports = i.map(({ from: l, to: a }) => {
      let h = t.lineAt(l, E.ByPos, e, 0, 0).top, c = t.lineAt(a, E.ByPos, e, 0, 0).bottom;
      return s += c - h, { from: l, to: a, top: h, bottom: c, domTop: 0, domBottom: 0 };
    }), this.scale = (7e6 - s) / (t.height - s);
    for (let l of this.viewports)
      l.domTop = o + (l.top - r) * this.scale, o = l.domBottom = l.domTop + (l.bottom - l.top), r = l.bottom;
  }
  toDOM(e) {
    for (let t = 0, i = 0, s = 0; ; t++) {
      let r = t < this.viewports.length ? this.viewports[t] : null;
      if (!r || e < r.top)
        return s + (e - i) * this.scale;
      if (e <= r.bottom)
        return r.domTop + (e - r.top);
      i = r.bottom, s = r.domBottom;
    }
  }
  fromDOM(e) {
    for (let t = 0, i = 0, s = 0; ; t++) {
      let r = t < this.viewports.length ? this.viewports[t] : null;
      if (!r || e < r.domTop)
        return i + (e - s) / this.scale;
      if (e <= r.domBottom)
        return r.top + (e - r.domTop);
      i = r.bottom, s = r.domBottom;
    }
  }
}
function ei(n, e) {
  if (e.scale == 1)
    return n;
  let t = e.toDOM(n.top), i = e.toDOM(n.bottom);
  return new nt(n.from, n.length, t, i - t, Array.isArray(n.type) ? n.type.map((s) => ei(s, e)) : n.type);
}
const Ri = /* @__PURE__ */ x.define({ combine: (n) => n.join(" ") }), Gs = /* @__PURE__ */ x.define({ combine: (n) => n.indexOf(!0) > -1 }), Ls = /* @__PURE__ */ lt.newName(), Wa = /* @__PURE__ */ lt.newName(), Za = /* @__PURE__ */ lt.newName(), Da = { "&light": "." + Wa, "&dark": "." + Za };
function _s(n, e, t) {
  return new lt(e, {
    finish(i) {
      return /&/.test(i) ? i.replace(/&\w*/, (s) => {
        if (s == "&")
          return n;
        if (!t || !t[s])
          throw new RangeError(`Unsupported selector: ${s}`);
        return t[s];
      }) : n + " " + i;
    }
  });
}
const Nf = /* @__PURE__ */ _s("." + Ls, {
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
}, Da), Vf = {
  childList: !0,
  characterData: !0,
  subtree: !0,
  attributes: !0,
  characterDataOldValue: !0
}, Jn = b.ie && b.ie_version <= 11;
class Uf {
  constructor(e, t, i) {
    this.view = e, this.onChange = t, this.onScrollChanged = i, this.active = !1, this.selectionRange = new Nc(), this.selectionChanged = !1, this.delayedFlush = -1, this.resizeTimeout = -1, this.queue = [], this.delayedAndroidKey = null, this.scrollTargets = [], this.intersection = null, this.resize = null, this.intersecting = !1, this.gapIntersection = null, this.gaps = [], this.parentCheck = -1, this.dom = e.contentDOM, this.observer = new MutationObserver((s) => {
      for (let r of s)
        this.queue.push(r);
      (b.ie && b.ie_version <= 11 || b.ios && e.composing) && s.some((r) => r.type == "childList" && r.removedNodes.length || r.type == "characterData" && r.oldValue.length > r.target.nodeValue.length) ? this.flushSoon() : this.flush();
    }), Jn && (this.onCharData = (s) => {
      this.queue.push({
        target: s.target,
        type: "characterData",
        oldValue: s.prevValue
      }), this.flushSoon();
    }), this.onSelectionChange = this.onSelectionChange.bind(this), window.addEventListener("resize", this.onResize = this.onResize.bind(this)), typeof ResizeObserver == "function" && (this.resize = new ResizeObserver(() => {
      this.view.docView.lastUpdate < Date.now() - 75 && this.onResize();
    }), this.resize.observe(e.scrollDOM)), window.addEventListener("beforeprint", this.onPrint = this.onPrint.bind(this)), this.start(), window.addEventListener("scroll", this.onScroll = this.onScroll.bind(this)), typeof IntersectionObserver == "function" && (this.intersection = new IntersectionObserver((s) => {
      this.parentCheck < 0 && (this.parentCheck = setTimeout(this.listenForScroll.bind(this), 1e3)), s.length > 0 && s[s.length - 1].intersectionRatio > 0 != this.intersecting && (this.intersecting = !this.intersecting, this.intersecting != this.view.inView && this.onScrollChanged(document.createEvent("Event")));
    }, {}), this.intersection.observe(this.dom), this.gapIntersection = new IntersectionObserver((s) => {
      s.length > 0 && s[s.length - 1].intersectionRatio > 0 && this.onScrollChanged(document.createEvent("Event"));
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
    if (t.state.facet(Mn) ? t.root.activeElement != this.dom : !Li(t.dom, i))
      return;
    let s = i.anchorNode && t.docView.nearest(i.anchorNode);
    s && s.ignoreEvent(e) || ((b.ie && b.ie_version <= 11 || b.android && b.chrome) && !t.state.selection.main.empty && i.focusNode && en(i.focusNode, i.focusOffset, i.anchorNode, i.anchorOffset) ? this.flushSoon() : this.flush(!1));
  }
  readSelectionRange() {
    let { view: e } = this, t = b.safari && e.root.nodeType == 11 && Gc() == this.dom && Ff(this.view) || Ki(e.root);
    if (!t || this.selectionRange.eq(t))
      return !1;
    let i = Li(this.dom, t);
    return i && !this.selectionChanged && this.selectionRange.focusNode && e.inputState.lastFocusTime > Date.now() - 200 && e.inputState.lastTouchTime < Date.now() - 300 && Uc(this.dom, t) ? (e.docView.updateSelection(), !1) : (this.selectionRange.setRange(t), i && (this.selectionChanged = !0), !0);
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
    this.active || (this.observer.observe(this.dom, Vf), Jn && this.dom.addEventListener("DOMCharacterDataModified", this.onCharData), this.active = !0);
  }
  stop() {
    !this.active || (this.active = !1, this.observer.disconnect(), Jn && this.dom.removeEventListener("DOMCharacterDataModified", this.onCharData));
  }
  clear() {
    this.processRecords(), this.queue.length = 0, this.selectionChanged = !1;
  }
  delayAndroidKey(e, t) {
    this.delayedAndroidKey || requestAnimationFrame(() => {
      let i = this.delayedAndroidKey;
      this.delayedAndroidKey = null, this.delayedFlush = -1, this.flush() || ni(this.dom, i.key, i.keyCode);
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
    for (let r of this.observer.takeRecords())
      e.push(r);
    e.length && (this.queue = []);
    let t = -1, i = -1, s = !1;
    for (let r of e) {
      let o = this.readMutation(r);
      !o || (o.typeOver && (s = !0), t == -1 ? { from: t, to: i } = o : (t = Math.min(o.from, t), i = Math.max(o.to, i)));
    }
    return { from: t, to: i, typeOver: s };
  }
  flush(e = !0) {
    if (this.delayedFlush >= 0 || this.delayedAndroidKey)
      return;
    e && this.readSelectionRange();
    let { from: t, to: i, typeOver: s } = this.processRecords(), r = this.selectionChanged && Li(this.dom, this.selectionRange);
    if (t < 0 && !r)
      return;
    this.view.inputState.lastFocusTime = 0, this.selectionChanged = !1;
    let o = this.view.state, l = this.onChange(t, i, s);
    return this.view.state == o && this.view.update([]), l;
  }
  readMutation(e) {
    let t = this.view.docView.nearest(e.target);
    if (!t || t.ignoreMutation(e))
      return null;
    if (t.markDirty(e.type == "attributes"), e.type == "attributes" && (t.dirty |= 4), e.type == "childList") {
      let i = wo(t, e.previousSibling || e.target.previousSibling, -1), s = wo(t, e.nextSibling || e.target.nextSibling, 1);
      return {
        from: i ? t.posAfter(i) : t.posAtStart,
        to: s ? t.posBefore(s) : t.posAtEnd,
        typeOver: !1
      };
    } else
      return e.type == "characterData" ? { from: t.posAtStart, to: t.posAtEnd, typeOver: e.target.nodeValue == e.oldValue } : null;
  }
  destroy() {
    var e, t, i;
    this.stop(), (e = this.intersection) === null || e === void 0 || e.disconnect(), (t = this.gapIntersection) === null || t === void 0 || t.disconnect(), (i = this.resize) === null || i === void 0 || i.disconnect();
    for (let s of this.scrollTargets)
      s.removeEventListener("scroll", this.onScroll);
    window.removeEventListener("scroll", this.onScroll), window.removeEventListener("resize", this.onResize), window.removeEventListener("beforeprint", this.onPrint), this.dom.ownerDocument.removeEventListener("selectionchange", this.onSelectionChange), clearTimeout(this.parentCheck), clearTimeout(this.resizeTimeout);
  }
}
function wo(n, e, t) {
  for (; e; ) {
    let i = q.get(e);
    if (i && i.parent == n)
      return i;
    let s = e.parentNode;
    e = s != n.dom ? s : t > 0 ? e.nextSibling : e.previousSibling;
  }
  return null;
}
function Ff(n) {
  let e = null;
  function t(a) {
    a.preventDefault(), a.stopImmediatePropagation(), e = a.getTargetRanges()[0];
  }
  if (n.contentDOM.addEventListener("beforeinput", t, !0), document.execCommand("indent"), n.contentDOM.removeEventListener("beforeinput", t, !0), !e)
    return null;
  let i = e.startContainer, s = e.startOffset, r = e.endContainer, o = e.endOffset, l = n.docView.domAtPos(n.state.selection.main.anchor);
  return en(l.node, l.offset, r, o) && ([i, s, r, o] = [r, o, i, s]), { anchorNode: i, anchorOffset: s, focusNode: r, focusOffset: o };
}
function Yf(n, e, t, i) {
  let s, r, o = n.state.selection.main;
  if (e > -1) {
    let l = n.docView.domBoundsAround(e, t, 0);
    if (!l || n.state.readOnly)
      return !1;
    let { from: a, to: h } = l, c = n.docView.impreciseHead || n.docView.impreciseAnchor ? [] : Jf(n), f = new ba(c, n.state);
    f.readRange(l.startDOM, l.endDOM);
    let u = o.from, d = null;
    (n.inputState.lastKeyCode === 8 && n.inputState.lastKeyTime > Date.now() - 100 || b.android && f.text.length < h - a) && (u = o.to, d = "end");
    let O = Hf(n.state.doc.sliceString(a, h, it), f.text, u - a, d);
    O && (b.chrome && n.inputState.lastKeyCode == 13 && O.toB == O.from + 2 && f.text.slice(O.from, O.toB) == it + it && O.toB--, s = {
      from: a + O.from,
      to: a + O.toA,
      insert: D.of(f.text.slice(O.from, O.toB).split(it))
    }), r = Kf(c, a);
  } else if (n.hasFocus || !n.state.facet(Mn)) {
    let l = n.observer.selectionRange, { impreciseHead: a, impreciseAnchor: h } = n.docView, c = a && a.node == l.focusNode && a.offset == l.focusOffset || !jt(n.contentDOM, l.focusNode) ? n.state.selection.main.head : n.docView.posFromDOM(l.focusNode, l.focusOffset), f = h && h.node == l.anchorNode && h.offset == l.anchorOffset || !jt(n.contentDOM, l.anchorNode) ? n.state.selection.main.anchor : n.docView.posFromDOM(l.anchorNode, l.anchorOffset);
    (c != o.head || f != o.anchor) && (r = g.single(f, c));
  }
  if (!s && !r)
    return !1;
  if (!s && i && !o.empty && r && r.main.empty ? s = { from: o.from, to: o.to, insert: n.state.doc.slice(o.from, o.to) } : s && s.from >= o.from && s.to <= o.to && (s.from != o.from || s.to != o.to) && o.to - o.from - (s.to - s.from) <= 4 ? s = {
    from: o.from,
    to: o.to,
    insert: n.state.doc.slice(o.from, s.from).append(s.insert).append(n.state.doc.slice(s.to, o.to))
  } : (b.mac || b.android) && s && s.from == s.to && s.from == o.head - 1 && s.insert.toString() == "." && (s = { from: o.from, to: o.to, insert: D.of([" "]) }), s) {
    let l = n.state;
    if (b.ios && n.inputState.flushIOSKey(n) || b.android && (s.from == o.from && s.to == o.to && s.insert.length == 1 && s.insert.lines == 2 && ni(n.contentDOM, "Enter", 13) || s.from == o.from - 1 && s.to == o.to && s.insert.length == 0 && ni(n.contentDOM, "Backspace", 8) || s.from == o.from && s.to == o.to + 1 && s.insert.length == 0 && ni(n.contentDOM, "Delete", 46)))
      return !0;
    let a = s.insert.toString();
    if (n.state.facet(ua).some((f) => f(n, s.from, s.to, a)))
      return !0;
    n.inputState.composing >= 0 && n.inputState.composing++;
    let h;
    if (s.from >= o.from && s.to <= o.to && s.to - s.from >= (o.to - o.from) / 3 && (!r || r.main.empty && r.main.from == s.from + s.insert.length) && n.inputState.composing < 0) {
      let f = o.from < s.from ? l.sliceDoc(o.from, s.from) : "", u = o.to > s.to ? l.sliceDoc(s.to, o.to) : "";
      h = l.replaceSelection(n.state.toText(f + s.insert.sliceString(0, void 0, n.state.lineBreak) + u));
    } else {
      let f = l.changes(s), u = r && !l.selection.main.eq(r.main) && r.main.to <= f.newLength ? r.main : void 0;
      if (l.selection.ranges.length > 1 && n.inputState.composing >= 0 && s.to <= o.to && s.to >= o.to - 10) {
        let d = n.state.sliceDoc(s.from, s.to), O = xa(n) || n.state.doc.lineAt(o.head), m = o.to - s.to, Q = o.to - o.from;
        h = l.changeByRange((S) => {
          if (S.from == o.from && S.to == o.to)
            return { changes: f, range: u || S.map(f) };
          let $ = S.to - m, A = $ - d.length;
          if (S.to - S.from != Q || n.state.sliceDoc(A, $) != d || O && S.to >= O.from && S.from <= O.to)
            return { range: S };
          let w = l.changes({ from: A, to: $, insert: s.insert }), v = S.to - o.to;
          return {
            changes: w,
            range: u ? g.range(Math.max(0, u.anchor + v), Math.max(0, u.head + v)) : S.map(w)
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
  } else if (r && !r.main.eq(o)) {
    let l = !1, a = "select";
    return n.inputState.lastSelectionTime > Date.now() - 50 && (n.inputState.lastSelectionOrigin == "select" && (l = !0), a = n.inputState.lastSelectionOrigin), n.dispatch({ selection: r, scrollIntoView: l, userEvent: a }), !0;
  } else
    return !1;
}
function Hf(n, e, t, i) {
  let s = Math.min(n.length, e.length), r = 0;
  for (; r < s && n.charCodeAt(r) == e.charCodeAt(r); )
    r++;
  if (r == s && n.length == e.length)
    return null;
  let o = n.length, l = e.length;
  for (; o > 0 && l > 0 && n.charCodeAt(o - 1) == e.charCodeAt(l - 1); )
    o--, l--;
  if (i == "end") {
    let a = Math.max(0, r - Math.min(o, l));
    t -= o + a - r;
  }
  return o < r && n.length < e.length ? (r -= t <= r && t >= o ? r - t : 0, l = r + (l - o), o = r) : l < r && (r -= t <= r && t >= l ? r - t : 0, o = r + (o - l), l = r), { from: r, toA: o, toB: l };
}
function Jf(n) {
  let e = [];
  if (n.root.activeElement != n.contentDOM)
    return e;
  let { anchorNode: t, anchorOffset: i, focusNode: s, focusOffset: r } = n.observer.selectionRange;
  return t && (e.push(new io(t, i)), (s != t || r != i) && e.push(new io(s, r))), e;
}
function Kf(n, e) {
  if (n.length == 0)
    return null;
  let t = n[0].pos, i = n.length == 2 ? n[1].pos : t;
  return t > -1 && i > -1 ? g.single(t + e, i + e) : null;
}
class k {
  constructor(e = {}) {
    this.plugins = [], this.pluginMap = /* @__PURE__ */ new Map(), this.editorAttrs = {}, this.contentAttrs = {}, this.bidiCache = [], this.destroyed = !1, this.updateState = 2, this.measureScheduled = -1, this.measureRequests = [], this.contentDOM = document.createElement("div"), this.scrollDOM = document.createElement("div"), this.scrollDOM.tabIndex = -1, this.scrollDOM.className = "cm-scroller", this.scrollDOM.appendChild(this.contentDOM), this.announceDOM = document.createElement("div"), this.announceDOM.style.cssText = "position: absolute; top: -10000px", this.announceDOM.setAttribute("aria-live", "polite"), this.dom = document.createElement("div"), this.dom.appendChild(this.announceDOM), this.dom.appendChild(this.scrollDOM), this._dispatch = e.dispatch || ((t) => this.update([t])), this.dispatch = this.dispatch.bind(this), this.root = e.root || Vc(e.parent) || document, this.viewState = new bo(e.state || Z.create(e)), this.plugins = this.state.facet(Jt).map((t) => new Un(t));
    for (let t of this.plugins)
      t.update(this);
    this.observer = new Uf(this, (t, i, s) => Yf(this, t, i, s), (t) => {
      this.inputState.runScrollHandlers(this, t), this.observer.intersecting && this.measure();
    }), this.inputState = new xf(this), this.inputState.ensureHandlers(this, this.plugins), this.docView = new no(this), this.mountStyles(), this.updateAttrs(), this.updateState = 0, this.requestMeasure(), e.parent && e.parent.appendChild(this.dom);
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
    this._dispatch(e.length == 1 && e[0] instanceof N ? e[0] : this.state.update(...e));
  }
  update(e) {
    if (this.updateState != 0)
      throw new Error("Calls to EditorView.update are not allowed while an update is in progress");
    let t = !1, i = !1, s, r = this.state;
    for (let l of e) {
      if (l.startState != r)
        throw new RangeError("Trying to update state with a transaction that doesn't start from the previous state.");
      r = l.state;
    }
    if (this.destroyed) {
      this.viewState.state = r;
      return;
    }
    if (this.observer.clear(), r.facet(Z.phrases) != this.state.facet(Z.phrases))
      return this.setState(r);
    s = sn.create(this, r, e);
    let o = this.viewState.scrollTarget;
    try {
      this.updateState = 2;
      for (let l of e) {
        if (o && (o = o.map(l.changes)), l.scrollIntoView) {
          let { main: a } = l.state.selection;
          o = new nn(a.empty ? a : g.cursor(a.head, a.head > a.anchor ? -1 : 1));
        }
        for (let a of l.effects)
          a.is(eo) && (o = a.value);
      }
      this.viewState.update(s, o), this.bidiCache = rn.update(this.bidiCache, s.changes), s.empty || (this.updatePlugins(s), this.inputState.update(s)), t = this.docView.update(s), this.state.facet(Kt) != this.styleModules && this.mountStyles(), i = this.updateAttrs(), this.showAnnouncements(e), this.docView.updateSelection(t, e.some((l) => l.isUserEvent("select.pointer")));
    } finally {
      this.updateState = 0;
    }
    if (s.startState.facet(Ri) != s.state.facet(Ri) && (this.viewState.mustMeasureContent = !0), (t || i || o || this.viewState.mustEnforceCursorAssoc || this.viewState.mustMeasureContent) && this.requestMeasure(), !s.empty)
      for (let l of this.state.facet(js))
        l(s);
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
      this.viewState = new bo(e), this.plugins = e.facet(Jt).map((i) => new Un(i)), this.pluginMap.clear();
      for (let i of this.plugins)
        i.update(this);
      this.docView = new no(this), this.inputState.ensureHandlers(this, this.plugins), this.mountStyles(), this.updateAttrs(), this.bidiCache = [];
    } finally {
      this.updateState = 0;
    }
    t && this.focus(), this.requestMeasure();
  }
  updatePlugins(e) {
    let t = e.startState.facet(Jt), i = e.state.facet(Jt);
    if (t != i) {
      let s = [];
      for (let r of i) {
        let o = t.indexOf(r);
        if (o < 0)
          s.push(new Un(r));
        else {
          let l = this.plugins[o];
          l.mustUpdate = e, s.push(l);
        }
      }
      for (let r of this.plugins)
        r.mustUpdate != e && r.destroy(this);
      this.plugins = s, this.pluginMap.clear(), this.inputState.ensureHandlers(this, this.plugins);
    } else
      for (let s of this.plugins)
        s.mustUpdate = e;
    for (let s = 0; s < this.plugins.length; s++)
      this.plugins[s].update(this);
  }
  measure(e = !0) {
    if (this.destroyed)
      return;
    this.measureScheduled > -1 && cancelAnimationFrame(this.measureScheduled), this.measureScheduled = 0, e && this.observer.forceFlush();
    let t = null;
    try {
      for (let i = 0; ; i++) {
        this.updateState = 1;
        let s = this.viewport, r = this.viewState.measure(this);
        if (!r && !this.measureRequests.length && this.viewState.scrollTarget == null)
          break;
        if (i > 5) {
          console.warn(this.measureRequests.length ? "Measure loop restarted more than 5 times" : "Viewport failed to stabilize");
          break;
        }
        let o = [];
        r & 4 || ([this.measureRequests, o] = [o, this.measureRequests]);
        let l = o.map((f) => {
          try {
            return f.read(this);
          } catch (u) {
            return ve(this.state, u), To;
          }
        }), a = sn.create(this, this.state, []), h = !1, c = !1;
        a.flags |= r, t ? t.flags |= r : t = a, this.updateState = 2, a.empty || (this.updatePlugins(a), this.inputState.update(a), this.updateAttrs(), h = this.docView.update(a));
        for (let f = 0; f < o.length; f++)
          if (l[f] != To)
            try {
              let u = o[f];
              u.write && u.write(l[f], this);
            } catch (u) {
              ve(this.state, u);
            }
        if (this.viewState.scrollTarget && (this.docView.scrollIntoView(this.viewState.scrollTarget), this.viewState.scrollTarget = null, c = !0), h && this.docView.updateSelection(!0), this.viewport.from == s.from && this.viewport.to == s.to && !c && this.measureRequests.length == 0)
          break;
      }
    } finally {
      this.updateState = 0, this.measureScheduled = -1;
    }
    if (t && !t.empty)
      for (let i of this.state.facet(js))
        i(t);
  }
  get themeClasses() {
    return Ls + " " + (this.state.facet(Gs) ? Za : Wa) + " " + this.state.facet(Ri);
  }
  updateAttrs() {
    let e = vo(this, Oa, {
      class: "cm-editor" + (this.hasFocus ? " cm-focused " : " ") + this.themeClasses
    }), t = {
      spellcheck: "false",
      autocorrect: "off",
      autocapitalize: "off",
      translate: "no",
      contenteditable: this.state.facet(Mn) ? "true" : "false",
      class: "cm-content",
      style: `${b.tabSize}: ${this.state.tabSize}`,
      role: "textbox",
      "aria-multiline": "true"
    };
    this.state.readOnly && (t["aria-readonly"] = "true"), vo(this, pa, t);
    let i = this.observer.ignore(() => {
      let s = Ds(this.contentDOM, this.contentAttrs, t), r = Ds(this.dom, this.editorAttrs, e);
      return s || r;
    });
    return this.editorAttrs = e, this.contentAttrs = t, i;
  }
  showAnnouncements(e) {
    let t = !0;
    for (let i of e)
      for (let s of i.effects)
        if (s.is(k.announce)) {
          t && (this.announceDOM.textContent = ""), t = !1;
          let r = this.announceDOM.appendChild(document.createElement("div"));
          r.textContent = s.value;
        }
  }
  mountStyles() {
    this.styleModules = this.state.facet(Kt), lt.mount(this.root, this.styleModules.concat(Nf).reverse());
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
    return Yn(this, e, ho(this, e, t, i));
  }
  moveByGroup(e, t) {
    return Yn(this, e, ho(this, e, t, (i) => Sf(this, e.head, i)));
  }
  moveToLineBoundary(e, t, i = !0) {
    return yf(this, e, t, i);
  }
  moveVertically(e, t, i) {
    return Yn(this, e, bf(this, e, t, i));
  }
  domAtPos(e) {
    return this.docView.domAtPos(e);
  }
  posAtDOM(e, t = 0) {
    return this.docView.posFromDOM(e, t);
  }
  posAtCoords(e, t = !0) {
    return this.readMeasured(), ka(this, e, t);
  }
  coordsAtPos(e, t = 1) {
    this.readMeasured();
    let i = this.docView.coordsAt(e, t);
    if (!i || i.left == i.right)
      return i;
    let s = this.state.doc.lineAt(e), r = this.bidiSpans(s), o = r[Zt.find(r, e - s.from, -1, t)];
    return Cn(i, o.dir == V.LTR == t > 0);
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
    return !this.state.facet(da) || e < this.viewport.from || e > this.viewport.to ? this.textDirection : (this.readMeasured(), this.docView.textDirectionAt(e));
  }
  get lineWrapping() {
    return this.viewState.heightOracle.lineWrapping;
  }
  bidiSpans(e) {
    if (e.length > eu)
      return ya(e.length);
    let t = this.textDirectionAt(e.from);
    for (let s of this.bidiCache)
      if (s.from == e.from && s.dir == t)
        return s.order;
    let i = rf(e.text, t);
    return this.bidiCache.push(new rn(e.from, e.to, t, i)), i;
  }
  get hasFocus() {
    var e;
    return (document.hasFocus() || b.safari && ((e = this.inputState) === null || e === void 0 ? void 0 : e.lastContextMenu) > Date.now() - 3e4) && this.root.activeElement == this.contentDOM;
  }
  focus() {
    this.observer.ignore(() => {
      Fl(this.contentDOM), this.docView.updateSelection();
    });
  }
  destroy() {
    for (let e of this.plugins)
      e.destroy(this);
    this.plugins = [], this.inputState.destroy(), this.dom.remove(), this.observer.destroy(), this.measureScheduled > -1 && cancelAnimationFrame(this.measureScheduled), this.destroyed = !0;
  }
  static scrollIntoView(e, t = {}) {
    return eo.of(new nn(typeof e == "number" ? g.cursor(e) : e, t.y, t.x, t.yMargin, t.xMargin));
  }
  static domEventHandlers(e) {
    return oe.define(() => ({}), { eventHandlers: e });
  }
  static theme(e, t) {
    let i = lt.newName(), s = [Ri.of(i), Kt.of(_s(`.${i}`, e))];
    return t && t.dark && s.push(Gs.of(!0)), s;
  }
  static baseTheme(e) {
    return Gt.lowest(Kt.of(_s("." + Ls, e, Da)));
  }
  static findFromDOM(e) {
    var t;
    let i = e.querySelector(".cm-content"), s = i && q.get(i) || q.get(e);
    return ((t = s == null ? void 0 : s.rootView) === null || t === void 0 ? void 0 : t.view) || null;
  }
}
k.styleModule = Kt;
k.inputHandler = ua;
k.perLineTextDirection = da;
k.exceptionSink = fa;
k.updateListener = js;
k.editable = Mn;
k.mouseSelectionStyle = ca;
k.dragMovesSelection = ha;
k.clickAddsSelectionRange = aa;
k.decorations = ui;
k.atomicRanges = ga;
k.scrollMargins = ma;
k.darkTheme = Gs;
k.contentAttributes = pa;
k.editorAttributes = Oa;
k.lineWrapping = /* @__PURE__ */ k.contentAttributes.of({ class: "cm-lineWrapping" });
k.announce = /* @__PURE__ */ C.define();
const eu = 4096, To = {};
class rn {
  constructor(e, t, i, s) {
    this.from = e, this.to = t, this.dir = i, this.order = s;
  }
  static update(e, t) {
    if (t.empty)
      return e;
    let i = [], s = e.length ? e[e.length - 1].dir : V.LTR;
    for (let r = Math.max(0, e.length - 10); r < e.length; r++) {
      let o = e[r];
      o.dir == s && !t.touchesRange(o.from, o.to) && i.push(new rn(t.mapPos(o.from, 1), t.mapPos(o.to, -1), o.dir, o.order));
    }
    return i;
  }
}
function vo(n, e, t) {
  for (let i = n.state.facet(e), s = i.length - 1; s >= 0; s--) {
    let r = i[s], o = typeof r == "function" ? r(n) : r;
    o && Zs(o, t);
  }
  return t;
}
const tu = b.mac ? "mac" : b.windows ? "win" : b.linux ? "linux" : "key";
function iu(n, e) {
  const t = n.split(/-(?!$)/);
  let i = t[t.length - 1];
  i == "Space" && (i = " ");
  let s, r, o, l;
  for (let a = 0; a < t.length - 1; ++a) {
    const h = t[a];
    if (/^(cmd|meta|m)$/i.test(h))
      l = !0;
    else if (/^a(lt)?$/i.test(h))
      s = !0;
    else if (/^(c|ctrl|control)$/i.test(h))
      r = !0;
    else if (/^s(hift)?$/i.test(h))
      o = !0;
    else if (/^mod$/i.test(h))
      e == "mac" ? l = !0 : r = !0;
    else
      throw new Error("Unrecognized modifier name: " + h);
  }
  return s && (i = "Alt-" + i), r && (i = "Ctrl-" + i), l && (i = "Meta-" + i), o && (i = "Shift-" + i), i;
}
function Ai(n, e, t) {
  return e.altKey && (n = "Alt-" + n), e.ctrlKey && (n = "Ctrl-" + n), e.metaKey && (n = "Meta-" + n), t !== !1 && e.shiftKey && (n = "Shift-" + n), n;
}
const nu = /* @__PURE__ */ Gt.default(/* @__PURE__ */ k.domEventHandlers({
  keydown(n, e) {
    return ja(Xa(e.state), n, e, "editor");
  }
})), Wn = /* @__PURE__ */ x.define({ enables: nu }), Po = /* @__PURE__ */ new WeakMap();
function Xa(n) {
  let e = n.facet(Wn), t = Po.get(e);
  return t || Po.set(e, t = ou(e.reduce((i, s) => i.concat(s), []))), t;
}
function su(n, e, t) {
  return ja(Xa(n.state), e, n, t);
}
let Ke = null;
const ru = 4e3;
function ou(n, e = tu) {
  let t = /* @__PURE__ */ Object.create(null), i = /* @__PURE__ */ Object.create(null), s = (o, l) => {
    let a = i[o];
    if (a == null)
      i[o] = l;
    else if (a != l)
      throw new Error("Key binding " + o + " is used both as a regular binding and as a multi-stroke prefix");
  }, r = (o, l, a, h) => {
    let c = t[o] || (t[o] = /* @__PURE__ */ Object.create(null)), f = l.split(/ (?!$)/).map((O) => iu(O, e));
    for (let O = 1; O < f.length; O++) {
      let m = f.slice(0, O).join(" ");
      s(m, !0), c[m] || (c[m] = {
        preventDefault: !0,
        commands: [(Q) => {
          let S = Ke = { view: Q, prefix: m, scope: o };
          return setTimeout(() => {
            Ke == S && (Ke = null);
          }, ru), !0;
        }]
      });
    }
    let u = f.join(" ");
    s(u, !1);
    let d = c[u] || (c[u] = { preventDefault: !1, commands: [] });
    d.commands.push(a), h && (d.preventDefault = !0);
  };
  for (let o of n) {
    let l = o[e] || o.key;
    if (!!l)
      for (let a of o.scope ? o.scope.split(" ") : ["editor"])
        r(a, l, o.run, o.preventDefault), o.shift && r(a, "Shift-" + l, o.shift, o.preventDefault);
  }
  return t;
}
function ja(n, e, t, i) {
  let s = Bc(e), r = K(s, 0), o = pe(r) == s.length && s != " ", l = "", a = !1;
  Ke && Ke.view == t && Ke.scope == i && (l = Ke.prefix + " ", (a = Ta.indexOf(e.keyCode) < 0) && (Ke = null));
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
    if (h(c[l + Ai(s, e, !o)]))
      return !0;
    if (o && (e.shiftKey || e.altKey || e.metaKey || r > 127) && (f = at[e.keyCode]) && f != s) {
      if (h(c[l + Ai(f, e, !0)]))
        return !0;
      if (e.shiftKey && Xt[e.keyCode] != f && h(c[l + Ai(Xt[e.keyCode], e, !1)]))
        return !0;
    } else if (o && e.shiftKey && h(c[l + Ai(s, e, !0)]))
      return !0;
  }
  return a;
}
const lu = !b.ios, au = {
  ".cm-line": {
    "& ::selection": { backgroundColor: "transparent !important" },
    "&::selection": { backgroundColor: "transparent !important" }
  }
};
lu && (au[".cm-line"].caretColor = "transparent !important");
function Co(n, e, t, i, s) {
  e.lastIndex = 0;
  for (let r = n.iterRange(t, i), o = t, l; !r.next().done; o += r.value.length)
    if (!r.lineBreak)
      for (; l = e.exec(r.value); )
        s(o + l.index, l);
}
function hu(n, e) {
  let t = n.visibleRanges;
  if (t.length == 1 && t[0].from == n.viewport.from && t[0].to == n.viewport.to)
    return t;
  let i = [];
  for (let { from: s, to: r } of t)
    s = Math.max(n.state.doc.lineAt(s).from, s - e), r = Math.min(n.state.doc.lineAt(r).to, r + e), i.length && i[i.length - 1].to >= s ? i[i.length - 1].to = r : i.push({ from: s, to: r });
  return i;
}
class cu {
  constructor(e) {
    const { regexp: t, decoration: i, decorate: s, boundary: r, maxLength: o = 1e3 } = e;
    if (!t.global)
      throw new RangeError("The regular expression given to MatchDecorator should have its 'g' flag set");
    if (this.regexp = t, s)
      this.addMatch = (l, a, h, c) => s(c, h, h + l[0].length, l, a);
    else if (i) {
      let l = typeof i == "function" ? i : () => i;
      this.addMatch = (a, h, c, f) => f(c, c + a[0].length, l(a, h, c));
    } else
      throw new RangeError("Either 'decorate' or 'decoration' should be provided to MatchDecorator");
    this.boundary = r, this.maxLength = o;
  }
  createDeco(e) {
    let t = new ot(), i = t.add.bind(t);
    for (let { from: s, to: r } of hu(e, this.maxLength))
      Co(e.state.doc, this.regexp, s, r, (o, l) => this.addMatch(l, e, o, i));
    return t.finish();
  }
  updateDeco(e, t) {
    let i = 1e9, s = -1;
    return e.docChanged && e.changes.iterChanges((r, o, l, a) => {
      a > e.view.viewport.from && l < e.view.viewport.to && (i = Math.min(l, i), s = Math.max(a, s));
    }), e.viewportChanged || s - i > 1e3 ? this.createDeco(e.view) : s > -1 ? this.updateRange(e.view, t.map(e.changes), i, s) : t;
  }
  updateRange(e, t, i, s) {
    for (let r of e.visibleRanges) {
      let o = Math.max(r.from, i), l = Math.min(r.to, s);
      if (l > o) {
        let a = e.state.doc.lineAt(o), h = a.to < l ? e.state.doc.lineAt(l) : a, c = Math.max(r.from, a.from), f = Math.min(r.to, h.to);
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
        let u = [], d, O = (m, Q, S) => u.push(S.range(m, Q));
        if (a == h)
          for (this.regexp.lastIndex = c - a.from; (d = this.regexp.exec(a.text)) && d.index < f - a.from; )
            this.addMatch(d, e, d.index + a.from, O);
        else
          Co(e.state.doc, this.regexp, c, f, (m, Q) => this.addMatch(Q, e, m, O));
        t = t.update({ filterFrom: c, filterTo: f, filter: (m, Q) => m < c || Q > f, add: u });
      }
    }
    return t;
  }
}
const Ns = /x/.unicode != null ? "gu" : "g", fu = /* @__PURE__ */ new RegExp(`[\0-\b
-\x7F-\x9F\xAD\u061C\u200B\u200E\u200F\u2028\u2029\u202D\u202E\u2066\u2067\u2069\uFEFF\uFFF9-\uFFFC]`, Ns), uu = {
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
let Kn = null;
function du() {
  var n;
  if (Kn == null && typeof document < "u" && document.body) {
    let e = document.body.style;
    Kn = ((n = e.tabSize) !== null && n !== void 0 ? n : e.MozTabSize) != null;
  }
  return Kn || !1;
}
const Ni = /* @__PURE__ */ x.define({
  combine(n) {
    let e = $t(n, {
      render: null,
      specialChars: fu,
      addSpecialChars: null
    });
    return (e.replaceTabs = !du()) && (e.specialChars = new RegExp("	|" + e.specialChars.source, Ns)), e.addSpecialChars && (e.specialChars = new RegExp(e.specialChars.source + "|" + e.addSpecialChars.source, Ns)), e;
  }
});
function Ou(n = {}) {
  return [Ni.of(n), pu()];
}
let Ro = null;
function pu() {
  return Ro || (Ro = oe.fromClass(class {
    constructor(n) {
      this.view = n, this.decorations = T.none, this.decorationCache = /* @__PURE__ */ Object.create(null), this.decorator = this.makeDecorator(n.state.facet(Ni)), this.decorations = this.decorator.createDeco(n);
    }
    makeDecorator(n) {
      return new cu({
        regexp: n.specialChars,
        decoration: (e, t, i) => {
          let { doc: s } = t.state, r = K(e[0], 0);
          if (r == 9) {
            let o = s.lineAt(i), l = t.state.tabSize, a = Pn(o.text, l, i - o.from);
            return T.replace({ widget: new yu((l - a % l) * this.view.defaultCharacterWidth) });
          }
          return this.decorationCache[r] || (this.decorationCache[r] = T.replace({ widget: new Qu(n, r) }));
        },
        boundary: n.replaceTabs ? void 0 : /[^]/
      });
    }
    update(n) {
      let e = n.state.facet(Ni);
      n.startState.facet(Ni) != e ? (this.decorator = this.makeDecorator(e), this.decorations = this.decorator.createDeco(n.view)) : this.decorations = this.decorator.updateDeco(n, this.decorations);
    }
  }, {
    decorations: (n) => n.decorations
  }));
}
const gu = "\u2022";
function mu(n) {
  return n >= 32 ? gu : n == 10 ? "\u2424" : String.fromCharCode(9216 + n);
}
class Qu extends ft {
  constructor(e, t) {
    super(), this.options = e, this.code = t;
  }
  eq(e) {
    return e.code == this.code;
  }
  toDOM(e) {
    let t = mu(this.code), i = e.state.phrase("Control character") + " " + (uu[this.code] || "0x" + this.code.toString(16)), s = this.options.render && this.options.render(this.code, i, t);
    if (s)
      return s;
    let r = document.createElement("span");
    return r.textContent = t, r.title = i, r.setAttribute("aria-label", i), r.className = "cm-specialChar", r;
  }
  ignoreEvent() {
    return !1;
  }
}
class yu extends ft {
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
function Su() {
  return xu;
}
const bu = /* @__PURE__ */ T.line({ class: "cm-activeLine" }), xu = /* @__PURE__ */ oe.fromClass(class {
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
        return T.none;
      let s = n.lineBlockAt(i.head);
      s.from > e && (t.push(bu.range(s.from)), e = s.from);
    }
    return T.set(t);
  }
}, {
  decorations: (n) => n.decorations
}), es = "-10000px";
class $u {
  constructor(e, t, i) {
    this.facet = t, this.createTooltipView = i, this.input = e.state.facet(t), this.tooltips = this.input.filter((s) => s), this.tooltipViews = this.tooltips.map(i);
  }
  update(e) {
    let t = e.state.facet(this.facet), i = t.filter((r) => r);
    if (t === this.input) {
      for (let r of this.tooltipViews)
        r.update && r.update(e);
      return !1;
    }
    let s = [];
    for (let r = 0; r < i.length; r++) {
      let o = i[r], l = -1;
      if (!!o) {
        for (let a = 0; a < this.tooltips.length; a++) {
          let h = this.tooltips[a];
          h && h.create == o.create && (l = a);
        }
        if (l < 0)
          s[r] = this.createTooltipView(o);
        else {
          let a = s[r] = this.tooltipViews[l];
          a.update && a.update(e);
        }
      }
    }
    for (let r of this.tooltipViews)
      s.indexOf(r) < 0 && r.dom.remove();
    return this.input = t, this.tooltips = i, this.tooltipViews = s, !0;
  }
}
function ku() {
  return { top: 0, left: 0, bottom: innerHeight, right: innerWidth };
}
const ts = /* @__PURE__ */ x.define({
  combine: (n) => {
    var e, t, i;
    return {
      position: b.ios ? "absolute" : ((e = n.find((s) => s.position)) === null || e === void 0 ? void 0 : e.position) || "fixed",
      parent: ((t = n.find((s) => s.parent)) === null || t === void 0 ? void 0 : t.parent) || null,
      tooltipSpace: ((i = n.find((s) => s.tooltipSpace)) === null || i === void 0 ? void 0 : i.tooltipSpace) || ku
    };
  }
}), Ea = /* @__PURE__ */ oe.fromClass(class {
  constructor(n) {
    var e;
    this.view = n, this.inView = !0, this.lastTransaction = 0, this.measureTimeout = -1;
    let t = n.state.facet(ts);
    this.position = t.position, this.parent = t.parent, this.classes = n.themeClasses, this.createContainer(), this.measureReq = { read: this.readMeasure.bind(this), write: this.writeMeasure.bind(this), key: this }, this.manager = new $u(n, qa, (i) => this.createTooltip(i)), this.intersectionObserver = typeof IntersectionObserver == "function" ? new IntersectionObserver((i) => {
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
    let t = e || n.geometryChanged, i = n.state.facet(ts);
    if (i.position != this.position) {
      this.position = i.position;
      for (let s of this.manager.tooltipViews)
        s.dom.style.position = this.position;
      t = !0;
    }
    if (i.parent != this.parent) {
      this.parent && this.container.remove(), this.parent = i.parent, this.createContainer();
      for (let s of this.manager.tooltipViews)
        this.container.appendChild(s.dom);
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
    return e.dom.style.position = this.position, e.dom.style.top = es, this.container.appendChild(e.dom), e.mount && e.mount(this.view), e;
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
      space: this.view.state.facet(ts).tooltipSpace(this.view)
    };
  }
  writeMeasure(n) {
    let { editor: e, space: t } = n, i = [];
    for (let s = 0; s < this.manager.tooltips.length; s++) {
      let r = this.manager.tooltips[s], o = this.manager.tooltipViews[s], { dom: l } = o, a = n.pos[s], h = n.size[s];
      if (!a || a.bottom <= Math.max(e.top, t.top) || a.top >= Math.min(e.bottom, t.bottom) || a.right < Math.max(e.left, t.left) - 0.1 || a.left > Math.min(e.right, t.right) + 0.1) {
        l.style.top = es;
        continue;
      }
      let c = r.arrow ? o.dom.querySelector(".cm-tooltip-arrow") : null, f = c ? 7 : 0, u = h.right - h.left, d = h.bottom - h.top, O = o.offset || Tu, m = this.view.textDirection == V.LTR, Q = h.width > t.right - t.left ? m ? t.left : t.right - h.width : m ? Math.min(a.left - (c ? 14 : 0) + O.x, t.right - u) : Math.max(t.left, a.left - u + (c ? 14 : 0) - O.x), S = !!r.above;
      !r.strictSide && (S ? a.top - (h.bottom - h.top) - O.y < t.top : a.bottom + (h.bottom - h.top) + O.y > t.bottom) && S == t.bottom - a.bottom > a.top - t.top && (S = !S);
      let $ = S ? a.top - d - f - O.y : a.bottom + f + O.y, A = Q + u;
      if (o.overlap !== !0)
        for (let w of i)
          w.left < A && w.right > Q && w.top < $ + d && w.bottom > $ && ($ = S ? w.top - d - 2 - f : w.bottom + f + 2);
      this.position == "absolute" ? (l.style.top = $ - n.parent.top + "px", l.style.left = Q - n.parent.left + "px") : (l.style.top = $ + "px", l.style.left = Q + "px"), c && (c.style.left = `${a.left + (m ? O.x : -O.x) - (Q + 14 - 7)}px`), o.overlap !== !0 && i.push({ left: Q, top: $, right: A, bottom: $ + d }), l.classList.toggle("cm-tooltip-above", S), l.classList.toggle("cm-tooltip-below", !S), o.positioned && o.positioned();
    }
  }
  maybeMeasure() {
    if (this.manager.tooltips.length && (this.view.inView && this.view.requestMeasure(this.measureReq), this.inView != this.view.inView && (this.inView = this.view.inView, !this.inView)))
      for (let n of this.manager.tooltipViews)
        n.dom.style.top = es;
  }
}, {
  eventHandlers: {
    scroll() {
      this.maybeMeasure();
    }
  }
}), wu = /* @__PURE__ */ k.baseTheme({
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
}), Tu = { x: 0, y: 0 }, qa = /* @__PURE__ */ x.define({
  enables: [Ea, wu]
});
function vu(n, e) {
  let t = n.plugin(Ea);
  if (!t)
    return null;
  let i = t.manager.tooltips.indexOf(e);
  return i < 0 ? null : t.manager.tooltipViews[i];
}
const Ao = /* @__PURE__ */ x.define({
  combine(n) {
    let e, t;
    for (let i of n)
      e = e || i.topContainer, t = t || i.bottomContainer;
    return { topContainer: e, bottomContainer: t };
  }
});
function on(n, e) {
  let t = n.plugin(Ia), i = t ? t.specs.indexOf(e) : -1;
  return i > -1 ? t.panels[i] : null;
}
const Ia = /* @__PURE__ */ oe.fromClass(class {
  constructor(n) {
    this.input = n.state.facet(ln), this.specs = this.input.filter((t) => t), this.panels = this.specs.map((t) => t(n));
    let e = n.state.facet(Ao);
    this.top = new Mi(n, !0, e.topContainer), this.bottom = new Mi(n, !1, e.bottomContainer), this.top.sync(this.panels.filter((t) => t.top)), this.bottom.sync(this.panels.filter((t) => !t.top));
    for (let t of this.panels)
      t.dom.classList.add("cm-panel"), t.mount && t.mount();
  }
  update(n) {
    let e = n.state.facet(Ao);
    this.top.container != e.topContainer && (this.top.sync([]), this.top = new Mi(n.view, !0, e.topContainer)), this.bottom.container != e.bottomContainer && (this.bottom.sync([]), this.bottom = new Mi(n.view, !1, e.bottomContainer)), this.top.syncClasses(), this.bottom.syncClasses();
    let t = n.state.facet(ln);
    if (t != this.input) {
      let i = t.filter((a) => a), s = [], r = [], o = [], l = [];
      for (let a of i) {
        let h = this.specs.indexOf(a), c;
        h < 0 ? (c = a(n.view), l.push(c)) : (c = this.panels[h], c.update && c.update(n)), s.push(c), (c.top ? r : o).push(c);
      }
      this.specs = i, this.panels = s, this.top.sync(r), this.bottom.sync(o);
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
  provide: (n) => k.scrollMargins.of((e) => {
    let t = e.plugin(n);
    return t && { top: t.top.scrollMargin(), bottom: t.bottom.scrollMargin() };
  })
});
class Mi {
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
          e = Mo(e);
        e = e.nextSibling;
      } else
        this.dom.insertBefore(t.dom, e);
    for (; e; )
      e = Mo(e);
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
function Mo(n) {
  let e = n.nextSibling;
  return n.remove(), e;
}
const ln = /* @__PURE__ */ x.define({
  enables: Ia
});
class Ve extends yt {
  compare(e) {
    return this == e || this.constructor == e.constructor && this.eq(e);
  }
  eq(e) {
    return !1;
  }
  destroy(e) {
  }
}
Ve.prototype.elementClass = "";
Ve.prototype.toDOM = void 0;
Ve.prototype.mapMode = ne.TrackBefore;
Ve.prototype.startSide = Ve.prototype.endSide = -1;
Ve.prototype.point = !0;
const Vi = /* @__PURE__ */ x.define(), Pu = {
  class: "",
  renderEmptyElements: !1,
  elementStyle: "",
  markers: () => j.empty,
  lineMarker: () => null,
  lineMarkerChange: null,
  initialSpacer: null,
  updateSpacer: null,
  domEventHandlers: {}
}, si = /* @__PURE__ */ x.define();
function Cu(n) {
  return [za(), si.of(Object.assign(Object.assign({}, Pu), n))];
}
const Vs = /* @__PURE__ */ x.define({
  combine: (n) => n.some((e) => e)
});
function za(n) {
  let e = [
    Ru
  ];
  return n && n.fixed === !1 && e.push(Vs.of(!0)), e;
}
const Ru = /* @__PURE__ */ oe.fromClass(class {
  constructor(n) {
    this.view = n, this.prevViewport = n.viewport, this.dom = document.createElement("div"), this.dom.className = "cm-gutters", this.dom.setAttribute("aria-hidden", "true"), this.dom.style.minHeight = this.view.contentHeight + "px", this.gutters = n.state.facet(si).map((e) => new Zo(n, e));
    for (let e of this.gutters)
      this.dom.appendChild(e.dom);
    this.fixed = !n.state.facet(Vs), this.fixed && (this.dom.style.position = "sticky"), this.syncGutters(!1), n.scrollDOM.insertBefore(this.dom, n.contentDOM);
  }
  update(n) {
    if (this.updateGutters(n)) {
      let e = this.prevViewport, t = n.view.viewport, i = Math.min(e.to, t.to) - Math.max(e.from, t.from);
      this.syncGutters(i < (t.to - t.from) * 0.8);
    }
    n.geometryChanged && (this.dom.style.minHeight = this.view.contentHeight + "px"), this.view.state.facet(Vs) != !this.fixed && (this.fixed = !this.fixed, this.dom.style.position = this.fixed ? "sticky" : ""), this.prevViewport = n.view.viewport;
  }
  syncGutters(n) {
    let e = this.dom.nextSibling;
    n && this.dom.remove();
    let t = j.iter(this.view.state.facet(Vi), this.view.viewport.from), i = [], s = this.gutters.map((r) => new Au(r, this.view.viewport, -this.view.documentPadding.top));
    for (let r of this.view.viewportLineBlocks) {
      let o;
      if (Array.isArray(r.type)) {
        for (let l of r.type)
          if (l.type == G.Text) {
            o = l;
            break;
          }
      } else
        o = r.type == G.Text ? r : void 0;
      if (!!o) {
        i.length && (i = []), Ba(t, i, r.from);
        for (let l of s)
          l.line(this.view, o, i);
      }
    }
    for (let r of s)
      r.finish();
    n && this.view.scrollDOM.insertBefore(this.dom, e);
  }
  updateGutters(n) {
    let e = n.startState.facet(si), t = n.state.facet(si), i = n.docChanged || n.heightChanged || n.viewportChanged || !j.eq(n.startState.facet(Vi), n.state.facet(Vi), n.view.viewport.from, n.view.viewport.to);
    if (e == t)
      for (let s of this.gutters)
        s.update(n) && (i = !0);
    else {
      i = !0;
      let s = [];
      for (let r of t) {
        let o = e.indexOf(r);
        o < 0 ? s.push(new Zo(this.view, r)) : (this.gutters[o].update(n), s.push(this.gutters[o]));
      }
      for (let r of this.gutters)
        r.dom.remove(), s.indexOf(r) < 0 && r.destroy();
      for (let r of s)
        this.dom.appendChild(r.dom);
      this.gutters = s;
    }
    return i;
  }
  destroy() {
    for (let n of this.gutters)
      n.destroy();
    this.dom.remove();
  }
}, {
  provide: (n) => k.scrollMargins.of((e) => {
    let t = e.plugin(n);
    return !t || t.gutters.length == 0 || !t.fixed ? null : e.textDirection == V.LTR ? { left: t.dom.offsetWidth } : { right: t.dom.offsetWidth };
  })
});
function Wo(n) {
  return Array.isArray(n) ? n : [n];
}
function Ba(n, e, t) {
  for (; n.value && n.from <= t; )
    n.from == t && e.push(n.value), n.next();
}
class Au {
  constructor(e, t, i) {
    this.gutter = e, this.height = i, this.localMarkers = [], this.i = 0, this.cursor = j.iter(e.markers, t.from);
  }
  line(e, t, i) {
    this.localMarkers.length && (this.localMarkers = []), Ba(this.cursor, this.localMarkers, t.from);
    let s = i.length ? this.localMarkers.concat(i) : this.localMarkers, r = this.gutter.config.lineMarker(e, t, s);
    r && s.unshift(r);
    let o = this.gutter;
    if (s.length == 0 && !o.config.renderEmptyElements)
      return;
    let l = t.top - this.height;
    if (this.i == o.elements.length) {
      let a = new Ga(e, t.height, l, s);
      o.elements.push(a), o.dom.appendChild(a.dom);
    } else
      o.elements[this.i].update(e, t.height, l, s);
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
class Zo {
  constructor(e, t) {
    this.view = e, this.config = t, this.elements = [], this.spacer = null, this.dom = document.createElement("div"), this.dom.className = "cm-gutter" + (this.config.class ? " " + this.config.class : "");
    for (let i in t.domEventHandlers)
      this.dom.addEventListener(i, (s) => {
        let r = e.lineBlockAtHeight(s.clientY - e.documentTop);
        t.domEventHandlers[i](e, r, s) && s.preventDefault();
      });
    this.markers = Wo(t.markers(e)), t.initialSpacer && (this.spacer = new Ga(e, 0, 0, [t.initialSpacer(e)]), this.dom.appendChild(this.spacer.dom), this.spacer.dom.style.cssText += "visibility: hidden; pointer-events: none");
  }
  update(e) {
    let t = this.markers;
    if (this.markers = Wo(this.config.markers(e.view)), this.spacer && this.config.updateSpacer) {
      let s = this.config.updateSpacer(this.spacer.markers[0], e);
      s != this.spacer.markers[0] && this.spacer.update(e.view, 0, 0, [s]);
    }
    let i = e.view.viewport;
    return !j.eq(this.markers, t, i.from, i.to) || (this.config.lineMarkerChange ? this.config.lineMarkerChange(e) : !1);
  }
  destroy() {
    for (let e of this.elements)
      e.destroy();
  }
}
class Ga {
  constructor(e, t, i, s) {
    this.height = -1, this.above = 0, this.markers = [], this.dom = document.createElement("div"), this.dom.className = "cm-gutterElement", this.update(e, t, i, s);
  }
  update(e, t, i, s) {
    this.height != t && (this.dom.style.height = (this.height = t) + "px"), this.above != i && (this.dom.style.marginTop = (this.above = i) ? i + "px" : ""), Mu(this.markers, s) || this.setMarkers(e, s);
  }
  setMarkers(e, t) {
    let i = "cm-gutterElement", s = this.dom.firstChild;
    for (let r = 0, o = 0; ; ) {
      let l = o, a = r < t.length ? t[r++] : null, h = !1;
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
          c.destroy(s);
          let f = s.nextSibling;
          s.remove(), s = f;
        }
      }
      if (!a)
        break;
      a.toDOM && (h ? s = s.nextSibling : this.dom.insertBefore(a.toDOM(e), s)), h && o++;
    }
    this.dom.className = i, this.markers = t;
  }
  destroy() {
    this.setMarkers(null, []);
  }
}
function Mu(n, e) {
  if (n.length != e.length)
    return !1;
  for (let t = 0; t < n.length; t++)
    if (!n[t].compare(e[t]))
      return !1;
  return !0;
}
const Wu = /* @__PURE__ */ x.define(), At = /* @__PURE__ */ x.define({
  combine(n) {
    return $t(n, { formatNumber: String, domEventHandlers: {} }, {
      domEventHandlers(e, t) {
        let i = Object.assign({}, e);
        for (let s in t) {
          let r = i[s], o = t[s];
          i[s] = r ? (l, a, h) => r(l, a, h) || o(l, a, h) : o;
        }
        return i;
      }
    });
  }
});
class is extends Ve {
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
function ns(n, e) {
  return n.state.facet(At).formatNumber(e, n.state);
}
const Zu = /* @__PURE__ */ si.compute([At], (n) => ({
  class: "cm-lineNumbers",
  renderEmptyElements: !1,
  markers(e) {
    return e.state.facet(Wu);
  },
  lineMarker(e, t, i) {
    return i.some((s) => s.toDOM) ? null : new is(ns(e, e.state.doc.lineAt(t.from).number));
  },
  lineMarkerChange: (e) => e.startState.facet(At) != e.state.facet(At),
  initialSpacer(e) {
    return new is(ns(e, Do(e.state.doc.lines)));
  },
  updateSpacer(e, t) {
    let i = ns(t.view, Do(t.view.state.doc.lines));
    return i == e.number ? e : new is(i);
  },
  domEventHandlers: n.facet(At).domEventHandlers
}));
function Du(n = {}) {
  return [
    At.of(n),
    za(),
    Zu
  ];
}
function Do(n) {
  let e = 9;
  for (; e < n; )
    e = e * 10 + 9;
  return e;
}
const Xu = /* @__PURE__ */ new class extends Ve {
  constructor() {
    super(...arguments), this.elementClass = "cm-activeLineGutter";
  }
}(), ju = /* @__PURE__ */ Vi.compute(["selection"], (n) => {
  let e = [], t = -1;
  for (let i of n.selection.ranges)
    if (i.empty) {
      let s = n.doc.lineAt(i.head).from;
      s > t && (t = s, e.push(Xu.range(s)));
    }
  return j.of(e);
});
function Eu() {
  return ju;
}
const La = 1024;
let qu = 0;
class ss {
  constructor(e, t) {
    this.from = e, this.to = t;
  }
}
class R {
  constructor(e = {}) {
    this.id = qu++, this.perNode = !!e.perNode, this.deserialize = e.deserialize || (() => {
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
R.closedBy = new R({ deserialize: (n) => n.split(" ") });
R.openedBy = new R({ deserialize: (n) => n.split(" ") });
R.group = new R({ deserialize: (n) => n.split(" ") });
R.contextHash = new R({ perNode: !0 });
R.lookAhead = new R({ perNode: !0 });
R.mounted = new R({ perNode: !0 });
const Iu = /* @__PURE__ */ Object.create(null);
class de {
  constructor(e, t, i, s = 0) {
    this.name = e, this.props = t, this.id = i, this.flags = s;
  }
  static define(e) {
    let t = e.props && e.props.length ? /* @__PURE__ */ Object.create(null) : Iu, i = (e.top ? 1 : 0) | (e.skipped ? 2 : 0) | (e.error ? 4 : 0) | (e.name == null ? 8 : 0), s = new de(e.name || "", t, e.id, i);
    if (e.props) {
      for (let r of e.props)
        if (Array.isArray(r) || (r = r(s)), r) {
          if (r[0].perNode)
            throw new RangeError("Can't store a per-node prop on a node type");
          t[r[0].id] = r[1];
        }
    }
    return s;
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
      let t = this.prop(R.group);
      return t ? t.indexOf(e) > -1 : !1;
    }
    return this.id == e;
  }
  static match(e) {
    let t = /* @__PURE__ */ Object.create(null);
    for (let i in e)
      for (let s of i.split(" "))
        t[s] = e[i];
    return (i) => {
      for (let s = i.prop(R.group), r = -1; r < (s ? s.length : 0); r++) {
        let o = t[r < 0 ? i.name : s[r]];
        if (o)
          return o;
      }
    };
  }
}
de.none = new de("", /* @__PURE__ */ Object.create(null), 0, 8);
class dr {
  constructor(e) {
    this.types = e;
    for (let t = 0; t < e.length; t++)
      if (e[t].id != t)
        throw new RangeError("Node type ids should correspond to array positions when creating a node set");
  }
  extend(...e) {
    let t = [];
    for (let i of this.types) {
      let s = null;
      for (let r of e) {
        let o = r(i);
        o && (s || (s = Object.assign({}, i.props)), s[o[0].id] = o[1]);
      }
      t.push(s ? new de(i.name, s, i.id, i.flags) : i);
    }
    return new dr(t);
  }
}
const Wi = /* @__PURE__ */ new WeakMap(), Xo = /* @__PURE__ */ new WeakMap();
var F;
(function(n) {
  n[n.ExcludeBuffers = 1] = "ExcludeBuffers", n[n.IncludeAnonymous = 2] = "IncludeAnonymous", n[n.IgnoreMounts = 4] = "IgnoreMounts", n[n.IgnoreOverlays = 8] = "IgnoreOverlays";
})(F || (F = {}));
class L {
  constructor(e, t, i, s, r) {
    if (this.type = e, this.children = t, this.positions = i, this.length = s, this.props = null, r && r.length) {
      this.props = /* @__PURE__ */ Object.create(null);
      for (let [o, l] of r)
        this.props[typeof o == "number" ? o : o.id] = l;
    }
  }
  toString() {
    let e = this.prop(R.mounted);
    if (e && !e.overlay)
      return e.tree.toString();
    let t = "";
    for (let i of this.children) {
      let s = i.toString();
      s && (t && (t += ","), t += s);
    }
    return this.type.name ? (/\W/.test(this.type.name) && !this.type.isError ? JSON.stringify(this.type.name) : this.type.name) + (t.length ? "(" + t + ")" : "") : t;
  }
  cursor(e = 0) {
    return new cn(this.topNode, e);
  }
  cursorAt(e, t = 0, i = 0) {
    let s = Wi.get(this) || this.topNode, r = new cn(s);
    return r.moveTo(e, t), Wi.set(this, r._tree), r;
  }
  get topNode() {
    return new Pe(this, 0, 0, null);
  }
  resolve(e, t = 0) {
    let i = It(Wi.get(this) || this.topNode, e, t, !1);
    return Wi.set(this, i), i;
  }
  resolveInner(e, t = 0) {
    let i = It(Xo.get(this) || this.topNode, e, t, !0);
    return Xo.set(this, i), i;
  }
  iterate(e) {
    let { enter: t, leave: i, from: s = 0, to: r = this.length } = e;
    for (let o = this.cursor((e.mode || 0) | F.IncludeAnonymous); ; ) {
      let l = !1;
      if (o.from <= r && o.to >= s && (o.type.isAnonymous || t(o) !== !1)) {
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
    return this.children.length <= 8 ? this : gr(de.none, this.children, this.positions, 0, this.children.length, 0, this.length, (t, i, s) => new L(this.type, t, i, s, this.propValues), e.makeTree || ((t, i, s) => new L(de.none, t, i, s)));
  }
  static build(e) {
    return Bu(e);
  }
}
L.empty = new L(de.none, [], [], 0);
class Or {
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
    return new Or(this.buffer, this.index);
  }
}
class kt {
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
    let t = this.buffer[e], i = this.buffer[e + 3], s = this.set.types[t], r = s.name;
    if (/\W/.test(r) && !s.isError && (r = JSON.stringify(r)), e += 4, i == e)
      return r;
    let o = [];
    for (; e < i; )
      o.push(this.childString(e)), e = this.buffer[e + 3];
    return r + "(" + o.join(",") + ")";
  }
  findChild(e, t, i, s, r) {
    let { buffer: o } = this, l = -1;
    for (let a = e; a != t && !(_a(r, s, o[a + 1], o[a + 2]) && (l = a, i > 0)); a = o[a + 3])
      ;
    return l;
  }
  slice(e, t, i, s) {
    let r = this.buffer, o = new Uint16Array(t - e);
    for (let l = e, a = 0; l < t; )
      o[a++] = r[l++], o[a++] = r[l++] - i, o[a++] = r[l++] - i, o[a++] = r[l++] - e;
    return new kt(o, s - i, this.set);
  }
}
function _a(n, e, t, i) {
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
function Na(n, e) {
  let t = n.childBefore(e);
  for (; t; ) {
    let i = t.lastChild;
    if (!i || i.to != t.to)
      break;
    i.type.isError && i.from == i.to ? (n = t, t = i.prevSibling) : t = i;
  }
  return n;
}
function It(n, e, t, i) {
  for (var s; n.from == n.to || (t < 1 ? n.from >= e : n.from > e) || (t > -1 ? n.to <= e : n.to < e); ) {
    let o = !i && n instanceof Pe && n.index < 0 ? null : n.parent;
    if (!o)
      return n;
    n = o;
  }
  let r = i ? 0 : F.IgnoreOverlays;
  if (i)
    for (let o = n, l = o.parent; l; o = l, l = o.parent)
      o instanceof Pe && o.index < 0 && ((s = l.enter(e, t, r)) === null || s === void 0 ? void 0 : s.from) != o.from && (n = l);
  for (; ; ) {
    let o = n.enter(e, t, r);
    if (!o)
      return n;
    n = o;
  }
}
class Pe {
  constructor(e, t, i, s) {
    this._tree = e, this.from = t, this.index = i, this._parent = s;
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
  nextChild(e, t, i, s, r = 0) {
    for (let o = this; ; ) {
      for (let { children: l, positions: a } = o._tree, h = t > 0 ? l.length : -1; e != h; e += t) {
        let c = l[e], f = a[e] + o.from;
        if (!!_a(s, i, f, f + c.length)) {
          if (c instanceof kt) {
            if (r & F.ExcludeBuffers)
              continue;
            let u = c.findChild(0, c.buffer.length, t, i - f, s);
            if (u > -1)
              return new De(new zu(o, c, e, f), null, u);
          } else if (r & F.IncludeAnonymous || !c.type.isAnonymous || pr(c)) {
            let u;
            if (!(r & F.IgnoreMounts) && c.props && (u = c.prop(R.mounted)) && !u.overlay)
              return new Pe(u.tree, f, e, o);
            let d = new Pe(c, f, e, o);
            return r & F.IncludeAnonymous || !d.type.isAnonymous ? d : d.nextChild(t < 0 ? c.children.length - 1 : 0, t, i, s);
          }
        }
      }
      if (r & F.IncludeAnonymous || !o.type.isAnonymous || (o.index >= 0 ? e = o.index + t : e = t < 0 ? -1 : o._parent._tree.children.length, o = o._parent, !o))
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
    let s;
    if (!(i & F.IgnoreOverlays) && (s = this._tree.prop(R.mounted)) && s.overlay) {
      let r = e - this.from;
      for (let { from: o, to: l } of s.overlay)
        if ((t > 0 ? o <= r : o < r) && (t < 0 ? l >= r : l > r))
          return new Pe(s.tree, s.overlay[0].from + this.from, -1, this);
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
    return new cn(this, e);
  }
  get tree() {
    return this._tree;
  }
  toTree() {
    return this._tree;
  }
  resolve(e, t = 0) {
    return It(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return It(this, e, t, !0);
  }
  enterUnfinishedNodesBefore(e) {
    return Na(this, e);
  }
  getChild(e, t = null, i = null) {
    let s = an(this, e, t, i);
    return s.length ? s[0] : null;
  }
  getChildren(e, t = null, i = null) {
    return an(this, e, t, i);
  }
  toString() {
    return this._tree.toString();
  }
  get node() {
    return this;
  }
  matchContext(e) {
    return hn(this, e);
  }
}
function an(n, e, t, i) {
  let s = n.cursor(), r = [];
  if (!s.firstChild())
    return r;
  if (t != null) {
    for (; !s.type.is(t); )
      if (!s.nextSibling())
        return r;
  }
  for (; ; ) {
    if (i != null && s.type.is(i))
      return r;
    if (s.type.is(e) && r.push(s.node), !s.nextSibling())
      return i == null ? r : [];
  }
}
function hn(n, e, t = e.length - 1) {
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
class zu {
  constructor(e, t, i, s) {
    this.parent = e, this.buffer = t, this.index = i, this.start = s;
  }
}
class De {
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
    let { buffer: s } = this.context, r = s.findChild(this.index + 4, s.buffer[this.index + 3], e, t - this.context.start, i);
    return r < 0 ? null : new De(this.context, this, r);
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
    if (i & F.ExcludeBuffers)
      return null;
    let { buffer: s } = this.context, r = s.findChild(this.index + 4, s.buffer[this.index + 3], t > 0 ? 1 : -1, e - this.context.start, t);
    return r < 0 ? null : new De(this.context, this, r);
  }
  get parent() {
    return this._parent || this.context.parent.nextSignificantParent();
  }
  externalSibling(e) {
    return this._parent ? null : this.context.parent.nextChild(this.context.index + e, e, 0, 4);
  }
  get nextSibling() {
    let { buffer: e } = this.context, t = e.buffer[this.index + 3];
    return t < (this._parent ? e.buffer[this._parent.index + 3] : e.buffer.length) ? new De(this.context, this._parent, t) : this.externalSibling(1);
  }
  get prevSibling() {
    let { buffer: e } = this.context, t = this._parent ? this._parent.index + 4 : 0;
    return this.index == t ? this.externalSibling(-1) : new De(this.context, this._parent, e.findChild(t, this.index, -1, 0, 4));
  }
  cursor(e = 0) {
    return new cn(this, e);
  }
  get tree() {
    return null;
  }
  toTree() {
    let e = [], t = [], { buffer: i } = this.context, s = this.index + 4, r = i.buffer[this.index + 3];
    if (r > s) {
      let o = i.buffer[this.index + 1], l = i.buffer[this.index + 2];
      e.push(i.slice(s, r, o, l)), t.push(0);
    }
    return new L(this.type, e, t, this.to - this.from);
  }
  resolve(e, t = 0) {
    return It(this, e, t, !1);
  }
  resolveInner(e, t = 0) {
    return It(this, e, t, !0);
  }
  enterUnfinishedNodesBefore(e) {
    return Na(this, e);
  }
  toString() {
    return this.context.buffer.childString(this.index);
  }
  getChild(e, t = null, i = null) {
    let s = an(this, e, t, i);
    return s.length ? s[0] : null;
  }
  getChildren(e, t = null, i = null) {
    return an(this, e, t, i);
  }
  get node() {
    return this;
  }
  matchContext(e) {
    return hn(this, e);
  }
}
class cn {
  constructor(e, t = 0) {
    if (this.mode = t, this.buffer = null, this.stack = [], this.index = 0, this.bufferNode = null, e instanceof Pe)
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
    let { start: i, buffer: s } = this.buffer;
    return this.type = t || s.set.types[s.buffer[e]], this.from = i + s.buffer[e + 1], this.to = i + s.buffer[e + 2], !0;
  }
  yield(e) {
    return e ? e instanceof Pe ? (this.buffer = null, this.yieldNode(e)) : (this.buffer = e.context, this.yieldBuf(e.index, e.type)) : !1;
  }
  toString() {
    return this.buffer ? this.buffer.buffer.childString(this.index) : this._tree.toString();
  }
  enterChild(e, t, i) {
    if (!this.buffer)
      return this.yield(this._tree.nextChild(e < 0 ? this._tree._tree.children.length - 1 : 0, e, t, i, this.mode));
    let { buffer: s } = this.buffer, r = s.findChild(this.index + 4, s.buffer[this.index + 3], e, t - this.buffer.start, i);
    return r < 0 ? !1 : (this.stack.push(this.index), this.yieldBuf(r));
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
    return this.buffer ? i & F.ExcludeBuffers ? !1 : this.enterChild(1, e, t) : this.yield(this._tree.enter(e, t, i));
  }
  parent() {
    if (!this.buffer)
      return this.yieldNode(this.mode & F.IncludeAnonymous ? this._tree._parent : this._tree.parent);
    if (this.stack.length)
      return this.yieldBuf(this.stack.pop());
    let e = this.mode & F.IncludeAnonymous ? this.buffer.parent : this.buffer.parent.nextSignificantParent();
    return this.buffer = null, this.yieldNode(e);
  }
  sibling(e) {
    if (!this.buffer)
      return this._tree._parent ? this.yield(this._tree.index < 0 ? null : this._tree._parent.nextChild(this._tree.index + e, e, 0, 4, this.mode)) : !1;
    let { buffer: t } = this.buffer, i = this.stack.length - 1;
    if (e < 0) {
      let s = i < 0 ? 0 : this.stack[i] + 4;
      if (this.index != s)
        return this.yieldBuf(t.findChild(s, this.index, -1, 0, 4));
    } else {
      let s = t.buffer[this.index + 3];
      if (s < (i < 0 ? t.buffer.length : t.buffer[this.stack[i] + 3]))
        return this.yieldBuf(s);
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
    let t, i, { buffer: s } = this;
    if (s) {
      if (e > 0) {
        if (this.index < s.buffer.buffer.length)
          return !1;
      } else
        for (let r = 0; r < this.index; r++)
          if (s.buffer.buffer[r + 3] < this.index)
            return !1;
      ({ index: t, parent: i } = s);
    } else
      ({ index: t, _parent: i } = this._tree);
    for (; i; { index: t, _parent: i } = i)
      if (t > -1)
        for (let r = t + e, o = e < 0 ? -1 : i._tree.children.length; r != o; r += e) {
          let l = i._tree.children[r];
          if (this.mode & F.IncludeAnonymous || l instanceof kt || !l.type.isAnonymous || pr(l))
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
        for (let s = this.index, r = this.stack.length; r >= 0; ) {
          for (let o = e; o; o = o._parent)
            if (o.index == s) {
              if (s == this.index)
                return o;
              t = o, i = r + 1;
              break e;
            }
          s = this.stack[--r];
        }
    }
    for (let s = i; s < this.stack.length; s++)
      t = new De(this.buffer, t, this.stack[s]);
    return this.bufferNode = new De(this.buffer, t, this.index);
  }
  get tree() {
    return this.buffer ? null : this._tree._tree;
  }
  iterate(e, t) {
    for (let i = 0; ; ) {
      let s = !1;
      if (this.type.isAnonymous || e(this) !== !1) {
        if (this.firstChild()) {
          i++;
          continue;
        }
        this.type.isAnonymous || (s = !0);
      }
      for (; s && t && t(this), s = this.type.isAnonymous, !this.nextSibling(); ) {
        if (!i)
          return;
        this.parent(), i--, s = !0;
      }
    }
  }
  matchContext(e) {
    if (!this.buffer)
      return hn(this.node, e);
    let { buffer: t } = this.buffer, { types: i } = t.set;
    for (let s = e.length - 1, r = this.stack.length - 1; s >= 0; r--) {
      if (r < 0)
        return hn(this.node, e, s);
      let o = i[t.buffer[this.stack[r]]];
      if (!o.isAnonymous) {
        if (e[s] && e[s] != o.name)
          return !1;
        s--;
      }
    }
    return !0;
  }
}
function pr(n) {
  return n.children.some((e) => e instanceof kt || !e.type.isAnonymous || pr(e));
}
function Bu(n) {
  var e;
  let { buffer: t, nodeSet: i, maxBufferLength: s = La, reused: r = [], minRepeatType: o = i.types.length } = n, l = Array.isArray(t) ? new Or(t, t.length) : t, a = i.types, h = 0, c = 0;
  function f(w, v, P, M, H) {
    let { id: X, start: W, end: z, size: ae } = l, xe = c;
    for (; ae < 0; )
      if (l.next(), ae == -1) {
        let Ye = r[X];
        P.push(Ye), M.push(W - w);
        return;
      } else if (ae == -3) {
        h = X;
        return;
      } else if (ae == -4) {
        c = X;
        return;
      } else
        throw new RangeError(`Unrecognized record size: ${ae}`);
    let wt = a[X], Fe, Ge, Wr = W - w;
    if (z - W <= s && (Ge = m(l.pos - v, H))) {
      let Ye = new Uint16Array(Ge.size - Ge.skip), $e = l.pos - Ge.size, Le = Ye.length;
      for (; l.pos > $e; )
        Le = Q(Ge.start, Ye, Le);
      Fe = new kt(Ye, z - Ge.start, i), Wr = Ge.start - w;
    } else {
      let Ye = l.pos - ae;
      l.next();
      let $e = [], Le = [], ut = X >= o ? X : -1, Tt = 0, $i = z;
      for (; l.pos > Ye; )
        ut >= 0 && l.id == ut && l.size >= 0 ? (l.end <= $i - s && (d($e, Le, W, Tt, l.end, $i, ut, xe), Tt = $e.length, $i = l.end), l.next()) : f(W, Ye, $e, Le, ut);
      if (ut >= 0 && Tt > 0 && Tt < $e.length && d($e, Le, W, Tt, W, $i, ut, xe), $e.reverse(), Le.reverse(), ut > -1 && Tt > 0) {
        let Zr = u(wt);
        Fe = gr(wt, $e, Le, 0, $e.length, 0, z - W, Zr, Zr);
      } else
        Fe = O(wt, $e, Le, z - W, xe - z);
    }
    P.push(Fe), M.push(Wr);
  }
  function u(w) {
    return (v, P, M) => {
      let H = 0, X = v.length - 1, W, z;
      if (X >= 0 && (W = v[X]) instanceof L) {
        if (!X && W.type == w && W.length == M)
          return W;
        (z = W.prop(R.lookAhead)) && (H = P[X] + W.length + z);
      }
      return O(w, v, P, M, H);
    };
  }
  function d(w, v, P, M, H, X, W, z) {
    let ae = [], xe = [];
    for (; w.length > M; )
      ae.push(w.pop()), xe.push(v.pop() + P - H);
    w.push(O(i.types[W], ae, xe, X - H, z - X)), v.push(H - P);
  }
  function O(w, v, P, M, H = 0, X) {
    if (h) {
      let W = [R.contextHash, h];
      X = X ? [W].concat(X) : [W];
    }
    if (H > 25) {
      let W = [R.lookAhead, H];
      X = X ? [W].concat(X) : [W];
    }
    return new L(w, v, P, M, X);
  }
  function m(w, v) {
    let P = l.fork(), M = 0, H = 0, X = 0, W = P.end - s, z = { size: 0, start: 0, skip: 0 };
    e:
      for (let ae = P.pos - w; P.pos > ae; ) {
        let xe = P.size;
        if (P.id == v && xe >= 0) {
          z.size = M, z.start = H, z.skip = X, X += 4, M += 4, P.next();
          continue;
        }
        let wt = P.pos - xe;
        if (xe < 0 || wt < ae || P.start < W)
          break;
        let Fe = P.id >= o ? 4 : 0, Ge = P.start;
        for (P.next(); P.pos > wt; ) {
          if (P.size < 0)
            if (P.size == -3)
              Fe += 4;
            else
              break e;
          else
            P.id >= o && (Fe += 4);
          P.next();
        }
        H = Ge, M += xe, X += Fe;
      }
    return (v < 0 || M == w) && (z.size = M, z.start = H, z.skip = X), z.size > 4 ? z : void 0;
  }
  function Q(w, v, P) {
    let { id: M, start: H, end: X, size: W } = l;
    if (l.next(), W >= 0 && M < o) {
      let z = P;
      if (W > 4) {
        let ae = l.pos - (W - 4);
        for (; l.pos > ae; )
          P = Q(w, v, P);
      }
      v[--P] = z, v[--P] = X - w, v[--P] = H - w, v[--P] = M;
    } else
      W == -3 ? h = M : W == -4 && (c = M);
    return P;
  }
  let S = [], $ = [];
  for (; l.pos > 0; )
    f(n.start || 0, n.bufferStart || 0, S, $, -1);
  let A = (e = n.length) !== null && e !== void 0 ? e : S.length ? $[0] + S[0].length : 0;
  return new L(a[n.topID], S.reverse(), $.reverse(), A);
}
const jo = /* @__PURE__ */ new WeakMap();
function Ui(n, e) {
  if (!n.isAnonymous || e instanceof kt || e.type != n)
    return 1;
  let t = jo.get(e);
  if (t == null) {
    t = 1;
    for (let i of e.children) {
      if (i.type != n || !(i instanceof L)) {
        t = 1;
        break;
      }
      t += Ui(n, i);
    }
    jo.set(e, t);
  }
  return t;
}
function gr(n, e, t, i, s, r, o, l, a) {
  let h = 0;
  for (let O = i; O < s; O++)
    h += Ui(n, e[O]);
  let c = Math.ceil(h * 1.5 / 8), f = [], u = [];
  function d(O, m, Q, S, $) {
    for (let A = Q; A < S; ) {
      let w = A, v = m[A], P = Ui(n, O[A]);
      for (A++; A < S; A++) {
        let M = Ui(n, O[A]);
        if (P + M >= c)
          break;
        P += M;
      }
      if (A == w + 1) {
        if (P > c) {
          let M = O[w];
          d(M.children, M.positions, 0, M.children.length, m[w] + $);
          continue;
        }
        f.push(O[w]);
      } else {
        let M = m[A - 1] + O[A - 1].length - v;
        f.push(gr(n, O, m, w, A, v, M, null, a));
      }
      u.push(v + $ - r);
    }
  }
  return d(e, t, i, s, 0), (l || a)(f, u, o);
}
class Gu {
  constructor() {
    this.map = /* @__PURE__ */ new WeakMap();
  }
  setBuffer(e, t, i) {
    let s = this.map.get(e);
    s || this.map.set(e, s = /* @__PURE__ */ new Map()), s.set(t, i);
  }
  getBuffer(e, t) {
    let i = this.map.get(e);
    return i && i.get(t);
  }
  set(e, t) {
    e instanceof De ? this.setBuffer(e.context.buffer, e.index, t) : e instanceof Pe && this.map.set(e.tree, t);
  }
  get(e) {
    return e instanceof De ? this.getBuffer(e.context.buffer, e.index) : e instanceof Pe ? this.map.get(e.tree) : void 0;
  }
  cursorSet(e, t) {
    e.buffer ? this.setBuffer(e.buffer.buffer, e.index, t) : this.map.set(e.tree, t);
  }
  cursorGet(e) {
    return e.buffer ? this.getBuffer(e.buffer.buffer, e.index) : this.map.get(e.tree);
  }
}
class mt {
  constructor(e, t, i, s, r = !1, o = !1) {
    this.from = e, this.to = t, this.tree = i, this.offset = s, this.open = (r ? 1 : 0) | (o ? 2 : 0);
  }
  get openStart() {
    return (this.open & 1) > 0;
  }
  get openEnd() {
    return (this.open & 2) > 0;
  }
  static addTree(e, t = [], i = !1) {
    let s = [new mt(0, e.length, e, 0, !1, i)];
    for (let r of t)
      r.to > e.length && s.push(r);
    return s;
  }
  static applyChanges(e, t, i = 128) {
    if (!t.length)
      return e;
    let s = [], r = 1, o = e.length ? e[0] : null;
    for (let l = 0, a = 0, h = 0; ; l++) {
      let c = l < t.length ? t[l] : null, f = c ? c.fromA : 1e9;
      if (f - a >= i)
        for (; o && o.from < f; ) {
          let u = o;
          if (a >= u.from || f <= u.to || h) {
            let d = Math.max(u.from, a) - h, O = Math.min(u.to, f) - h;
            u = d >= O ? null : new mt(d, O, u.tree, u.offset + h, l > 0, !!c);
          }
          if (u && s.push(u), o.to > f)
            break;
          o = r < e.length ? e[r++] : null;
        }
      if (!c)
        break;
      a = c.toA, h = c.toA - c.toB;
    }
    return s;
  }
}
class Va {
  startParse(e, t, i) {
    return typeof e == "string" && (e = new Lu(e)), i = i ? i.length ? i.map((s) => new ss(s.from, s.to)) : [new ss(0, 0)] : [new ss(0, e.length)], this.createParse(e, t || [], i);
  }
  parse(e, t, i) {
    let s = this.startParse(e, t, i);
    for (; ; ) {
      let r = s.advance();
      if (r)
        return r;
    }
  }
}
class Lu {
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
new R({ perNode: !0 });
class fn {
  constructor(e, t, i, s, r, o, l, a, h, c = 0, f) {
    this.p = e, this.stack = t, this.state = i, this.reducePos = s, this.pos = r, this.score = o, this.buffer = l, this.bufferBase = a, this.curContext = h, this.lookAhead = c, this.parent = f;
  }
  toString() {
    return `[${this.stack.filter((e, t) => t % 3 == 0).concat(this.state)}]@${this.pos}${this.score ? "!" + this.score : ""}`;
  }
  static start(e, t, i = 0) {
    let s = e.parser.context;
    return new fn(e, [], t, i, i, 0, [], 0, s ? new Eo(s, s.start) : null, 0, null);
  }
  get context() {
    return this.curContext ? this.curContext.context : null;
  }
  pushState(e, t) {
    this.stack.push(this.state, t, this.bufferBase + this.buffer.length), this.state = e;
  }
  reduce(e) {
    let t = e >> 19, i = e & 65535, { parser: s } = this.p, r = s.dynamicPrecedence(i);
    if (r && (this.score += r), t == 0) {
      this.pushState(s.getGoto(this.state, i, !0), this.reducePos), i < s.minRepeatTerm && this.storeNode(i, this.reducePos, this.reducePos, 4, !0), this.reduceContext(i, this.reducePos);
      return;
    }
    let o = this.stack.length - (t - 1) * 3 - (e & 262144 ? 6 : 0), l = this.stack[o - 2], a = this.stack[o - 1], h = this.bufferBase + this.buffer.length - a;
    if (i < s.minRepeatTerm || e & 131072) {
      let c = s.stateFlag(this.state, 1) ? this.pos : this.reducePos;
      this.storeNode(i, l, c, h + 4, !0);
    }
    if (e & 262144)
      this.state = this.stack[o];
    else {
      let c = this.stack[o - 3];
      this.state = s.getGoto(c, i, !0);
    }
    for (; this.stack.length > o; )
      this.stack.pop();
    this.reduceContext(i, l);
  }
  storeNode(e, t, i, s = 4, r = !1) {
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
    if (!r || this.pos == i)
      this.buffer.push(e, t, i, s);
    else {
      let o = this.buffer.length;
      if (o > 0 && this.buffer[o - 4] != 0)
        for (; o > 0 && this.buffer[o - 2] > i; )
          this.buffer[o] = this.buffer[o - 4], this.buffer[o + 1] = this.buffer[o - 3], this.buffer[o + 2] = this.buffer[o - 2], this.buffer[o + 3] = this.buffer[o - 1], o -= 4, s > 4 && (s -= 4);
      this.buffer[o] = e, this.buffer[o + 1] = t, this.buffer[o + 2] = i, this.buffer[o + 3] = s;
    }
  }
  shift(e, t, i) {
    let s = this.pos;
    if (e & 131072)
      this.pushState(e & 65535, this.pos);
    else if ((e & 262144) == 0) {
      let r = e, { parser: o } = this.p;
      (i > this.pos || t <= o.maxNode) && (this.pos = i, o.stateFlag(r, 1) || (this.reducePos = i)), this.pushState(r, s), this.shiftContext(t, s), t <= o.maxNode && this.buffer.push(t, s, i, 4);
    } else
      this.pos = i, this.shiftContext(t, s), t <= this.p.parser.maxNode && this.buffer.push(t, s, i, 4);
  }
  apply(e, t, i) {
    e & 65536 ? this.reduce(e) : this.shift(e, t, i);
  }
  useNode(e, t) {
    let i = this.p.reused.length - 1;
    (i < 0 || this.p.reused[i] != e) && (this.p.reused.push(e), i++);
    let s = this.pos;
    this.reducePos = this.pos = s + e.length, this.pushState(t, s), this.buffer.push(i, s, this.reducePos, -1), this.curContext && this.updateContext(this.curContext.tracker.reuse(this.curContext.context, e, this, this.p.stream.reset(this.pos - e.length)));
  }
  split() {
    let e = this, t = e.buffer.length;
    for (; t > 0 && e.buffer[t - 2] > e.reducePos; )
      t -= 4;
    let i = e.buffer.slice(t), s = e.bufferBase + t;
    for (; e && s == e.bufferBase; )
      e = e.parent;
    return new fn(this.p, this.stack.slice(), this.state, this.reducePos, this.pos, this.score, i, s, this.curContext, this.lookAhead, e);
  }
  recoverByDelete(e, t) {
    let i = e <= this.p.parser.maxNode;
    i && this.storeNode(e, this.pos, t, 4), this.storeNode(0, this.pos, t, i ? 8 : 4), this.pos = this.reducePos = t, this.score -= 190;
  }
  canShift(e) {
    for (let t = new _u(this); ; ) {
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
      let s = [];
      for (let r = 0, o; r < t.length; r += 2)
        (o = t[r + 1]) != this.state && this.p.parser.hasAction(o, e) && s.push(t[r], o);
      if (this.stack.length < 120)
        for (let r = 0; s.length < 4 << 1 && r < t.length; r += 2) {
          let o = t[r + 1];
          s.some((l, a) => a & 1 && l == o) || s.push(t[r], o);
        }
      t = s;
    }
    let i = [];
    for (let s = 0; s < t.length && i.length < 4; s += 2) {
      let r = t[s + 1];
      if (r == this.state)
        continue;
      let o = this.split();
      o.pushState(r, this.pos), o.storeNode(0, o.pos, o.pos, 4, !0), o.shiftContext(t[s], this.pos), o.score -= 200, i.push(o);
    }
    return i;
  }
  forceReduce() {
    let e = this.p.parser.stateSlot(this.state, 5);
    if ((e & 65536) == 0)
      return !1;
    let { parser: t } = this.p;
    if (!t.validAction(this.state, e)) {
      let i = e >> 19, s = e & 65535, r = this.stack.length - i * 3;
      if (r < 0 || t.getGoto(this.stack[r], s, !1) < 0)
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
      let t = new Eo(this.curContext.tracker, e);
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
class Eo {
  constructor(e, t) {
    this.tracker = e, this.context = t, this.hash = e.strict ? e.hash(t) : 0;
  }
}
var qo;
(function(n) {
  n[n.Insert = 200] = "Insert", n[n.Delete = 190] = "Delete", n[n.Reduce = 100] = "Reduce", n[n.MaxNext = 4] = "MaxNext", n[n.MaxInsertStackDepth = 300] = "MaxInsertStackDepth", n[n.DampenInsertStackDepth = 120] = "DampenInsertStackDepth";
})(qo || (qo = {}));
class _u {
  constructor(e) {
    this.start = e, this.state = e.state, this.stack = e.stack, this.base = this.stack.length;
  }
  reduce(e) {
    let t = e & 65535, i = e >> 19;
    i == 0 ? (this.stack == this.start.stack && (this.stack = this.stack.slice()), this.stack.push(this.state, 0, 0), this.base += 3) : this.base -= (i - 1) * 3;
    let s = this.start.p.parser.getGoto(this.stack[this.base - 3], t, !0);
    this.state = s;
  }
}
class un {
  constructor(e, t, i) {
    this.stack = e, this.pos = t, this.index = i, this.buffer = e.buffer, this.index == 0 && this.maybeNext();
  }
  static create(e, t = e.bufferBase + e.buffer.length) {
    return new un(e, t, t - e.bufferBase);
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
    return new un(this.stack, this.pos, this.index);
  }
}
class Fi {
  constructor() {
    this.start = -1, this.value = -1, this.end = -1, this.extended = -1, this.lookAhead = 0, this.mask = 0, this.context = 0;
  }
}
const Io = new Fi();
class Nu {
  constructor(e, t) {
    this.input = e, this.ranges = t, this.chunk = "", this.chunkOff = 0, this.chunk2 = "", this.chunk2Pos = 0, this.next = -1, this.token = Io, this.rangeIndex = 0, this.pos = this.chunkPos = t[0].from, this.range = t[0], this.end = t[t.length - 1].to, this.readNext();
  }
  resolveOffset(e, t) {
    let i = this.range, s = this.rangeIndex, r = this.pos + e;
    for (; r < i.from; ) {
      if (!s)
        return null;
      let o = this.ranges[--s];
      r -= i.from - o.to, i = o;
    }
    for (; t < 0 ? r > i.to : r >= i.to; ) {
      if (s == this.ranges.length - 1)
        return null;
      let o = this.ranges[++s];
      r += o.from - i.to, i = o;
    }
    return r;
  }
  peek(e) {
    let t = this.chunkOff + e, i, s;
    if (t >= 0 && t < this.chunk.length)
      i = this.pos + e, s = this.chunk.charCodeAt(t);
    else {
      let r = this.resolveOffset(e, 1);
      if (r == null)
        return -1;
      if (i = r, i >= this.chunk2Pos && i < this.chunk2Pos + this.chunk2.length)
        s = this.chunk2.charCodeAt(i - this.chunk2Pos);
      else {
        let o = this.rangeIndex, l = this.range;
        for (; l.to <= i; )
          l = this.ranges[++o];
        this.chunk2 = this.input.chunk(this.chunk2Pos = i), i + this.chunk2.length > l.to && (this.chunk2 = this.chunk2.slice(0, l.to - i)), s = this.chunk2.charCodeAt(0);
      }
    }
    return i >= this.token.lookAhead && (this.token.lookAhead = i + 1), s;
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
    if (t ? (this.token = t, t.start = e, t.lookAhead = e + 1, t.value = t.extended = -1) : this.token = Io, this.pos != e) {
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
    for (let s of this.ranges) {
      if (s.from >= t)
        break;
      s.to > e && (i += this.input.read(Math.max(s.from, e), Math.min(s.to, t)));
    }
    return i;
  }
}
class Yi {
  constructor(e, t) {
    this.data = e, this.id = t;
  }
  token(e, t) {
    Vu(this.data, e, t, this.id);
  }
}
Yi.prototype.contextual = Yi.prototype.fallback = Yi.prototype.extend = !1;
class Qi {
  constructor(e, t = {}) {
    this.token = e, this.contextual = !!t.contextual, this.fallback = !!t.fallback, this.extend = !!t.extend;
  }
}
function Vu(n, e, t, i) {
  let s = 0, r = 1 << i, { parser: o } = t.p, { dialect: l } = o;
  e:
    for (; (r & n[s]) != 0; ) {
      let a = n[s + 1];
      for (let u = s + 3; u < a; u += 2)
        if ((n[u + 1] & r) > 0) {
          let d = n[u];
          if (l.allows(d) && (e.token.value == -1 || e.token.value == d || o.overrides(d, e.token.value))) {
            e.acceptToken(d);
            break;
          }
        }
      let h = e.next, c = 0, f = n[s + 2];
      if (e.next < 0 && f > c && n[a + f * 3 - 3] == 65535) {
        s = n[a + f * 3 - 1];
        continue e;
      }
      for (; c < f; ) {
        let u = c + f >> 1, d = a + u + (u << 1), O = n[d], m = n[d + 1];
        if (h < O)
          f = u;
        else if (h >= m)
          c = u + 1;
        else {
          s = n[d + 2], e.advance();
          continue e;
        }
      }
      break;
    }
}
function Zi(n, e = Uint16Array) {
  if (typeof n != "string")
    return n;
  let t = null;
  for (let i = 0, s = 0; i < n.length; ) {
    let r = 0;
    for (; ; ) {
      let o = n.charCodeAt(i++), l = !1;
      if (o == 126) {
        r = 65535;
        break;
      }
      o >= 92 && o--, o >= 34 && o--;
      let a = o - 32;
      if (a >= 46 && (a -= 46, l = !0), r += a, l)
        break;
      r *= 46;
    }
    t ? t[s++] = r : t = new e(r);
  }
  return t;
}
const ke = typeof process < "u" && process.env && /\bparse\b/.test(process.env.LOG);
let rs = null;
var zo;
(function(n) {
  n[n.Margin = 25] = "Margin";
})(zo || (zo = {}));
function Bo(n, e, t) {
  let i = n.cursor(F.IncludeAnonymous);
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
class Uu {
  constructor(e, t) {
    this.fragments = e, this.nodeSet = t, this.i = 0, this.fragment = null, this.safeFrom = -1, this.safeTo = -1, this.trees = [], this.start = [], this.index = [], this.nextFragment();
  }
  nextFragment() {
    let e = this.fragment = this.i == this.fragments.length ? null : this.fragments[this.i++];
    if (e) {
      for (this.safeFrom = e.openStart ? Bo(e.tree, e.from + e.offset, 1) - e.offset : e.from, this.safeTo = e.openEnd ? Bo(e.tree, e.to + e.offset, -1) - e.offset : e.to; this.trees.length; )
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
      let i = this.trees[t], s = this.index[t];
      if (s == i.children.length) {
        this.trees.pop(), this.start.pop(), this.index.pop();
        continue;
      }
      let r = i.children[s], o = this.start[t] + i.positions[s];
      if (o > e)
        return this.nextStart = o, null;
      if (r instanceof L) {
        if (o == e) {
          if (o < this.safeFrom)
            return null;
          let l = o + r.length;
          if (l <= this.safeTo) {
            let a = r.prop(R.lookAhead);
            if (!a || l + a < this.fragment.to)
              return r;
          }
        }
        this.index[t]++, o + r.length >= Math.max(this.safeFrom, e) && (this.trees.push(r), this.start.push(o), this.index.push(0));
      } else
        this.index[t]++, this.nextStart = o + r.length;
    }
  }
}
class Fu {
  constructor(e, t) {
    this.stream = t, this.tokens = [], this.mainToken = null, this.actions = [], this.tokens = e.tokenizers.map((i) => new Fi());
  }
  getActions(e) {
    let t = 0, i = null, { parser: s } = e.p, { tokenizers: r } = s, o = s.stateSlot(e.state, 3), l = e.curContext ? e.curContext.hash : 0, a = 0;
    for (let h = 0; h < r.length; h++) {
      if ((1 << h & o) == 0)
        continue;
      let c = r[h], f = this.tokens[h];
      if (!(i && !c.fallback) && ((c.contextual || f.start != e.pos || f.mask != o || f.context != l) && (this.updateCachedToken(f, c, e), f.mask = o, f.context = l), f.lookAhead > f.end + 25 && (a = Math.max(f.lookAhead, a)), f.value != 0)) {
        let u = t;
        if (f.extended > -1 && (t = this.addActions(e, f.extended, f.end, t)), t = this.addActions(e, f.value, f.end, t), !c.extend && (i = f, t > u))
          break;
      }
    }
    for (; this.actions.length > t; )
      this.actions.pop();
    return a && e.setLookAhead(a), !i && e.pos == this.stream.end && (i = new Fi(), i.value = e.p.parser.eofTerm, i.start = i.end = e.pos, t = this.addActions(e, i.value, i.end, t)), this.mainToken = i, this.actions;
  }
  getMainToken(e) {
    if (this.mainToken)
      return this.mainToken;
    let t = new Fi(), { pos: i, p: s } = e;
    return t.start = i, t.end = Math.min(i + 1, s.stream.end), t.value = i == s.stream.end ? s.parser.eofTerm : 0, t;
  }
  updateCachedToken(e, t, i) {
    if (t.token(this.stream.reset(i.pos, e), i), e.value > -1) {
      let { parser: s } = i.p;
      for (let r = 0; r < s.specialized.length; r++)
        if (s.specialized[r] == e.value) {
          let o = s.specializers[r](this.stream.read(e.start, e.end), i);
          if (o >= 0 && i.p.parser.dialect.allows(o >> 1)) {
            (o & 1) == 0 ? e.value = o >> 1 : e.extended = o >> 1;
            break;
          }
        }
    } else
      e.value = 0, e.end = Math.min(i.p.stream.end, i.pos + 1);
  }
  putAction(e, t, i, s) {
    for (let r = 0; r < s; r += 3)
      if (this.actions[r] == e)
        return s;
    return this.actions[s++] = e, this.actions[s++] = t, this.actions[s++] = i, s;
  }
  addActions(e, t, i, s) {
    let { state: r } = e, { parser: o } = e.p, { data: l } = o;
    for (let a = 0; a < 2; a++)
      for (let h = o.stateSlot(r, a ? 2 : 1); ; h += 3) {
        if (l[h] == 65535)
          if (l[h + 1] == 1)
            h = _e(l, h + 2);
          else {
            s == 0 && l[h + 1] == 2 && (s = this.putAction(_e(l, h + 2), t, i, s));
            break;
          }
        l[h] == t && (s = this.putAction(_e(l, h + 1), t, i, s));
      }
    return s;
  }
}
var Go;
(function(n) {
  n[n.Distance = 5] = "Distance", n[n.MaxRemainingPerStep = 3] = "MaxRemainingPerStep", n[n.MinBufferLengthPrune = 500] = "MinBufferLengthPrune", n[n.ForceReduceLimit = 10] = "ForceReduceLimit", n[n.CutDepth = 15e3] = "CutDepth", n[n.CutTo = 9e3] = "CutTo";
})(Go || (Go = {}));
class Yu {
  constructor(e, t, i, s) {
    this.parser = e, this.input = t, this.ranges = s, this.recovering = 0, this.nextStackID = 9812, this.minStackPos = 0, this.reused = [], this.stoppedAt = null, this.stream = new Nu(t, s), this.tokens = new Fu(e, this.stream), this.topTerm = e.top[1];
    let { from: r } = s[0];
    this.stacks = [fn.start(this, e.top[0], r)], this.fragments = i.length && this.stream.end - r > e.bufferLength * 4 ? new Uu(i, e.nodeSet) : null;
  }
  get parsedPos() {
    return this.minStackPos;
  }
  advance() {
    let e = this.stacks, t = this.minStackPos, i = this.stacks = [], s, r;
    for (let o = 0; o < e.length; o++) {
      let l = e[o];
      for (; ; ) {
        if (this.tokens.mainToken = null, l.pos > t)
          i.push(l);
        else {
          if (this.advanceStack(l, i, e))
            continue;
          {
            s || (s = [], r = []), s.push(l);
            let a = this.tokens.getMainToken(l);
            r.push(a.value, a.end);
          }
        }
        break;
      }
    }
    if (!i.length) {
      let o = s && Ku(s);
      if (o)
        return this.stackToTree(o);
      if (this.parser.strict)
        throw ke && s && console.log("Stuck with token " + (this.tokens.mainToken ? this.parser.getName(this.tokens.mainToken.value) : "none")), new SyntaxError("No parse at " + t);
      this.recovering || (this.recovering = 5);
    }
    if (this.recovering && s) {
      let o = this.stoppedAt != null && s[0].pos > this.stoppedAt ? s[0] : this.runRecovery(s, r, i);
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
    let s = e.pos, { parser: r } = this, o = ke ? this.stackID(e) + " -> " : "";
    if (this.stoppedAt != null && s > this.stoppedAt)
      return e.forceReduce() ? e : null;
    if (this.fragments) {
      let h = e.curContext && e.curContext.tracker.strict, c = h ? e.curContext.hash : 0;
      for (let f = this.fragments.nodeAt(s); f; ) {
        let u = this.parser.nodeSet.types[f.type.id] == f.type ? r.getGoto(e.state, f.type.id) : -1;
        if (u > -1 && f.length && (!h || (f.prop(R.contextHash) || 0) == c))
          return e.useNode(f, u), ke && console.log(o + this.stackID(e) + ` (via reuse of ${r.getName(f.type.id)})`), !0;
        if (!(f instanceof L) || f.children.length == 0 || f.positions[0] > 0)
          break;
        let d = f.children[0];
        if (d instanceof L && f.positions[0] == 0)
          f = d;
        else
          break;
      }
    }
    let l = r.stateSlot(e.state, 4);
    if (l > 0)
      return e.reduce(l), ke && console.log(o + this.stackID(e) + ` (via always-reduce ${r.getName(l & 65535)})`), !0;
    if (e.stack.length >= 15e3)
      for (; e.stack.length > 9e3 && e.forceReduce(); )
        ;
    let a = this.tokens.getActions(e);
    for (let h = 0; h < a.length; ) {
      let c = a[h++], f = a[h++], u = a[h++], d = h == a.length || !i, O = d ? e : e.split();
      if (O.apply(c, f, u), ke && console.log(o + this.stackID(O) + ` (via ${(c & 65536) == 0 ? "shift" : `reduce of ${r.getName(c & 65535)}`} for ${r.getName(f)} @ ${s}${O == e ? "" : ", split"})`), d)
        return !0;
      O.pos > s ? t.push(O) : i.push(O);
    }
    return !1;
  }
  advanceFully(e, t) {
    let i = e.pos;
    for (; ; ) {
      if (!this.advanceStack(e, null, null))
        return !1;
      if (e.pos > i)
        return Lo(e, t), !0;
    }
  }
  runRecovery(e, t, i) {
    let s = null, r = !1;
    for (let o = 0; o < e.length; o++) {
      let l = e[o], a = t[o << 1], h = t[(o << 1) + 1], c = ke ? this.stackID(l) + " -> " : "";
      if (l.deadEnd && (r || (r = !0, l.restart(), ke && console.log(c + this.stackID(l) + " (restarted)"), this.advanceFully(l, i))))
        continue;
      let f = l.split(), u = c;
      for (let d = 0; f.forceReduce() && d < 10 && (ke && console.log(u + this.stackID(f) + " (via force-reduce)"), !this.advanceFully(f, i)); d++)
        ke && (u = this.stackID(f) + " -> ");
      for (let d of l.recoverByInsert(a))
        ke && console.log(c + this.stackID(d) + " (via recover-insert)"), this.advanceFully(d, i);
      this.stream.end > l.pos ? (h == l.pos && (h++, a = 0), l.recoverByDelete(a, h), ke && console.log(c + this.stackID(l) + ` (via recover-delete ${this.parser.getName(a)})`), Lo(l, i)) : (!s || s.score < l.score) && (s = l);
    }
    return s;
  }
  stackToTree(e) {
    return e.close(), L.build({
      buffer: un.create(e),
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
    let t = (rs || (rs = /* @__PURE__ */ new WeakMap())).get(e);
    return t || rs.set(e, t = String.fromCodePoint(this.nextStackID++)), t + e;
  }
}
function Lo(n, e) {
  for (let t = 0; t < e.length; t++) {
    let i = e[t];
    if (i.pos == n.pos && i.sameState(n)) {
      e[t].score < n.score && (e[t] = n);
      return;
    }
  }
  e.push(n);
}
class Hu {
  constructor(e, t, i) {
    this.source = e, this.flags = t, this.disabled = i;
  }
  allows(e) {
    return !this.disabled || this.disabled[e] == 0;
  }
}
const os = (n) => n;
class Ju {
  constructor(e) {
    this.start = e.start, this.shift = e.shift || os, this.reduce = e.reduce || os, this.reuse = e.reuse || os, this.hash = e.hash || (() => 0), this.strict = e.strict !== !1;
  }
}
class dn extends Va {
  constructor(e) {
    if (super(), this.wrappers = [], e.version != 14)
      throw new RangeError(`Parser version (${e.version}) doesn't match runtime version (${14})`);
    let t = e.nodeNames.split(" ");
    this.minRepeatTerm = t.length;
    for (let l = 0; l < e.repeatNodeCount; l++)
      t.push("");
    let i = Object.keys(e.topRules).map((l) => e.topRules[l][1]), s = [];
    for (let l = 0; l < t.length; l++)
      s.push([]);
    function r(l, a, h) {
      s[l].push([a, a.deserialize(String(h))]);
    }
    if (e.nodeProps)
      for (let l of e.nodeProps) {
        let a = l[0];
        typeof a == "string" && (a = R[a]);
        for (let h = 1; h < l.length; ) {
          let c = l[h++];
          if (c >= 0)
            r(c, a, l[h++]);
          else {
            let f = l[h + -c];
            for (let u = -c; u > 0; u--)
              r(l[h++], a, f);
            h++;
          }
        }
      }
    this.nodeSet = new dr(t.map((l, a) => de.define({
      name: a >= this.minRepeatTerm ? void 0 : l,
      id: a,
      props: s[a],
      top: i.indexOf(a) > -1,
      error: a == 0,
      skipped: e.skippedNodes && e.skippedNodes.indexOf(a) > -1
    }))), e.propSources && (this.nodeSet = this.nodeSet.extend(...e.propSources)), this.strict = !1, this.bufferLength = La;
    let o = Zi(e.tokenData);
    if (this.context = e.context, this.specialized = new Uint16Array(e.specialized ? e.specialized.length : 0), this.specializers = [], e.specialized)
      for (let l = 0; l < e.specialized.length; l++)
        this.specialized[l] = e.specialized[l].term, this.specializers[l] = e.specialized[l].get;
    this.states = Zi(e.states, Uint32Array), this.data = Zi(e.stateData), this.goto = Zi(e.goto), this.maxTerm = e.maxTerm, this.tokenizers = e.tokenizers.map((l) => typeof l == "number" ? new Yi(o, l) : l), this.topRules = e.topRules, this.dialects = e.dialects || {}, this.dynamicPrecedences = e.dynamicPrecedences || null, this.tokenPrecTable = e.tokenPrec, this.termNames = e.termNames || null, this.maxNode = this.nodeSet.types.length - 1, this.dialect = this.parseDialect(), this.top = this.topRules[Object.keys(this.topRules)[0]];
  }
  createParse(e, t, i) {
    let s = new Yu(this, e, t, i);
    for (let r of this.wrappers)
      s = r(s, e, t, i);
    return s;
  }
  getGoto(e, t, i = !1) {
    let s = this.goto;
    if (t >= s[0])
      return -1;
    for (let r = s[t + 1]; ; ) {
      let o = s[r++], l = o & 1, a = s[r++];
      if (l && i)
        return a;
      for (let h = r + (o >> 1); r < h; r++)
        if (s[r] == e)
          return a;
      if (l)
        return -1;
    }
  }
  hasAction(e, t) {
    let i = this.data;
    for (let s = 0; s < 2; s++)
      for (let r = this.stateSlot(e, s ? 2 : 1), o; ; r += 3) {
        if ((o = i[r]) == 65535)
          if (i[r + 1] == 1)
            o = i[r = _e(i, r + 2)];
          else {
            if (i[r + 1] == 2)
              return _e(i, r + 2);
            break;
          }
        if (o == t || o == 0)
          return _e(i, r + 1);
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
          i = _e(this.data, i + 2);
        else
          return !1;
      if (t == _e(this.data, i + 1))
        return !0;
    }
  }
  nextStates(e) {
    let t = [];
    for (let i = this.stateSlot(e, 1); ; i += 3) {
      if (this.data[i] == 65535)
        if (this.data[i + 1] == 1)
          i = _e(this.data, i + 2);
        else
          break;
      if ((this.data[i + 2] & 1) == 0) {
        let s = this.data[i + 1];
        t.some((r, o) => o & 1 && r == s) || t.push(this.data[i], s);
      }
    }
    return t;
  }
  overrides(e, t) {
    let i = _o(this.data, this.tokenPrecTable, t);
    return i < 0 || _o(this.data, this.tokenPrecTable, e) < i;
  }
  configure(e) {
    let t = Object.assign(Object.create(dn.prototype), this);
    if (e.props && (t.nodeSet = this.nodeSet.extend(...e.props)), e.top) {
      let i = this.topRules[e.top];
      if (!i)
        throw new RangeError(`Invalid top rule name ${e.top}`);
      t.top = i;
    }
    return e.tokenizers && (t.tokenizers = this.tokenizers.map((i) => {
      let s = e.tokenizers.find((r) => r.from == i);
      return s ? s.to : i;
    })), e.specializers && (t.specializers = this.specializers.map((i) => {
      let s = e.specializers.find((r) => r.from == i);
      return s ? s.to : i;
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
      for (let r of e.split(" ")) {
        let o = t.indexOf(r);
        o >= 0 && (i[o] = !0);
      }
    let s = null;
    for (let r = 0; r < t.length; r++)
      if (!i[r])
        for (let o = this.dialects[t[r]], l; (l = this.data[o++]) != 65535; )
          (s || (s = new Uint8Array(this.maxTerm + 1)))[l] = 1;
    return new Hu(e, i, s);
  }
  static deserialize(e) {
    return new dn(e);
  }
}
function _e(n, e) {
  return n[e] | n[e + 1] << 16;
}
function _o(n, e, t) {
  for (let i = e, s; (s = n[i]) != 65535; i++)
    if (s == t)
      return i - e;
  return -1;
}
function Ku(n) {
  let e = null;
  for (let t of n) {
    let i = t.p.stoppedAt;
    (t.pos == t.p.stream.end || i != null && t.pos > i) && t.p.parser.stateFlag(t.state, 2) && (!e || e.score < t.score) && (e = t);
  }
  return e;
}
let ed = 0;
class We {
  constructor(e, t, i) {
    this.set = e, this.base = t, this.modified = i, this.id = ed++;
  }
  static define(e) {
    if (e != null && e.base)
      throw new Error("Can not derive from a modified tag");
    let t = new We([], null, []);
    if (t.set.push(t), e)
      for (let i of e.set)
        t.set.push(i);
    return t;
  }
  static defineModifier() {
    let e = new On();
    return (t) => t.modified.indexOf(e) > -1 ? t : On.get(t.base || t, t.modified.concat(e).sort((i, s) => i.id - s.id));
  }
}
let td = 0;
class On {
  constructor() {
    this.instances = [], this.id = td++;
  }
  static get(e, t) {
    if (!t.length)
      return e;
    let i = t[0].instances.find((l) => l.base == e && id(t, l.modified));
    if (i)
      return i;
    let s = [], r = new We(s, e, t);
    for (let l of t)
      l.instances.push(r);
    let o = Ua(t);
    for (let l of e.set)
      for (let a of o)
        s.push(On.get(l, a));
    return r;
  }
}
function id(n, e) {
  return n.length == e.length && n.every((t, i) => t == e[i]);
}
function Ua(n) {
  let e = [n];
  for (let t = 0; t < n.length; t++)
    for (let i of Ua(n.slice(0, t).concat(n.slice(t + 1))))
      e.push(i);
  return e;
}
function Fa(n) {
  let e = /* @__PURE__ */ Object.create(null);
  for (let t in n) {
    let i = n[t];
    Array.isArray(i) || (i = [i]);
    for (let s of t.split(" "))
      if (s) {
        let r = [], o = 2, l = s;
        for (let f = 0; ; ) {
          if (l == "..." && f > 0 && f + 3 == s.length) {
            o = 1;
            break;
          }
          let u = /^"(?:[^"\\]|\\.)*?"|[^\/!]+/.exec(l);
          if (!u)
            throw new RangeError("Invalid path: " + s);
          if (r.push(u[0] == "*" ? "" : u[0][0] == '"' ? JSON.parse(u[0]) : u[0]), f += u[0].length, f == s.length)
            break;
          let d = s[f++];
          if (f == s.length && d == "!") {
            o = 0;
            break;
          }
          if (d != "/")
            throw new RangeError("Invalid path: " + s);
          l = s.slice(f);
        }
        let a = r.length - 1, h = r[a];
        if (!h)
          throw new RangeError("Invalid path: " + s);
        let c = new nd(i, o, a > 0 ? r.slice(0, a) : null);
        e[h] = c.sort(e[h]);
      }
  }
  return Ya.add(e);
}
const Ya = new R();
class nd {
  constructor(e, t, i, s) {
    this.tags = e, this.mode = t, this.context = i, this.next = s;
  }
  sort(e) {
    return !e || e.depth < this.depth ? (this.next = e, this) : (e.next = this.sort(e.next), e);
  }
  get depth() {
    return this.context ? this.context.length : 0;
  }
}
function Ha(n, e) {
  let t = /* @__PURE__ */ Object.create(null);
  for (let r of n)
    if (!Array.isArray(r.tag))
      t[r.tag.id] = r.class;
    else
      for (let o of r.tag)
        t[o.id] = r.class;
  let { scope: i, all: s = null } = e || {};
  return {
    style: (r) => {
      let o = s;
      for (let l of r)
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
function sd(n, e) {
  let t = null;
  for (let i of n) {
    let s = i.style(e);
    s && (t = t ? t + " " + s : s);
  }
  return t;
}
function rd(n, e, t, i = 0, s = n.length) {
  let r = new od(i, Array.isArray(e) ? e : [e], t);
  r.highlightRange(n.cursor(), i, s, "", r.highlighters), r.flush(s);
}
class od {
  constructor(e, t, i) {
    this.at = e, this.highlighters = t, this.span = i, this.class = "";
  }
  startSpan(e, t) {
    t != this.class && (this.flush(e), e > this.at && (this.at = e), this.class = t);
  }
  flush(e) {
    e > this.at && this.class && this.span(this.at, e, this.class);
  }
  highlightRange(e, t, i, s, r) {
    let { type: o, from: l, to: a } = e;
    if (l >= i || a <= t)
      return;
    o.isTop && (r = this.highlighters.filter((d) => !d.scope || d.scope(o)));
    let h = s, c = o.prop(Ya), f = !1;
    for (; c; ) {
      if (!c.context || e.matchContext(c.context)) {
        let d = sd(r, c.tags);
        d && (h && (h += " "), h += d, c.mode == 1 ? s += (s ? " " : "") + d : c.mode == 0 && (f = !0));
        break;
      }
      c = c.next;
    }
    if (this.startSpan(e.from, h), f)
      return;
    let u = e.tree && e.tree.prop(R.mounted);
    if (u && u.overlay) {
      let d = e.node.enter(u.overlay[0].from + l, 1), O = this.highlighters.filter((Q) => !Q.scope || Q.scope(u.tree.type)), m = e.firstChild();
      for (let Q = 0, S = l; ; Q++) {
        let $ = Q < u.overlay.length ? u.overlay[Q] : null, A = $ ? $.from + l : a, w = Math.max(t, S), v = Math.min(i, A);
        if (w < v && m)
          for (; e.from < v && (this.highlightRange(e, w, v, s, r), this.startSpan(Math.min(i, e.to), h), !(e.to >= A || !e.nextSibling())); )
            ;
        if (!$ || A > i)
          break;
        S = $.to + l, S > t && (this.highlightRange(d.cursor(), Math.max(t, $.from + l), Math.min(i, S), s, O), this.startSpan(S, h));
      }
      m && e.parent();
    } else if (e.firstChild()) {
      do
        if (!(e.to <= t)) {
          if (e.from >= i)
            break;
          this.highlightRange(e, t, i, s, r), this.startSpan(Math.min(i, e.to), h);
        }
      while (e.nextSibling());
      e.parent();
    }
  }
}
const y = We.define, Di = y(), He = y(), No = y(He), Vo = y(He), Je = y(), Xi = y(Je), ls = y(Je), Me = y(), dt = y(Me), Re = y(), Ae = y(), Us = y(), Ut = y(Us), ji = y(), p = {
  comment: Di,
  lineComment: y(Di),
  blockComment: y(Di),
  docComment: y(Di),
  name: He,
  variableName: y(He),
  typeName: No,
  tagName: y(No),
  propertyName: Vo,
  attributeName: y(Vo),
  className: y(He),
  labelName: y(He),
  namespace: y(He),
  macroName: y(He),
  literal: Je,
  string: Xi,
  docString: y(Xi),
  character: y(Xi),
  attributeValue: y(Xi),
  number: ls,
  integer: y(ls),
  float: y(ls),
  bool: y(Je),
  regexp: y(Je),
  escape: y(Je),
  color: y(Je),
  url: y(Je),
  keyword: Re,
  self: y(Re),
  null: y(Re),
  atom: y(Re),
  unit: y(Re),
  modifier: y(Re),
  operatorKeyword: y(Re),
  controlKeyword: y(Re),
  definitionKeyword: y(Re),
  moduleKeyword: y(Re),
  operator: Ae,
  derefOperator: y(Ae),
  arithmeticOperator: y(Ae),
  logicOperator: y(Ae),
  bitwiseOperator: y(Ae),
  compareOperator: y(Ae),
  updateOperator: y(Ae),
  definitionOperator: y(Ae),
  typeOperator: y(Ae),
  controlOperator: y(Ae),
  punctuation: Us,
  separator: y(Us),
  bracket: Ut,
  angleBracket: y(Ut),
  squareBracket: y(Ut),
  paren: y(Ut),
  brace: y(Ut),
  content: Me,
  heading: dt,
  heading1: y(dt),
  heading2: y(dt),
  heading3: y(dt),
  heading4: y(dt),
  heading5: y(dt),
  heading6: y(dt),
  contentSeparator: y(Me),
  list: y(Me),
  quote: y(Me),
  emphasis: y(Me),
  strong: y(Me),
  link: y(Me),
  monospace: y(Me),
  strikethrough: y(Me),
  inserted: y(),
  deleted: y(),
  changed: y(),
  invalid: y(),
  meta: ji,
  documentMeta: y(ji),
  annotation: y(ji),
  processingInstruction: y(ji),
  definition: We.defineModifier(),
  constant: We.defineModifier(),
  function: We.defineModifier(),
  standard: We.defineModifier(),
  local: We.defineModifier(),
  special: We.defineModifier()
};
Ha([
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
const ld = 1, Uo = 281, Fo = 2, ad = 3, Ei = 282, hd = 4, cd = 283, Yo = 284, fd = 286, ud = 287, dd = 5, Od = 6, pd = 1, gd = [
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
], Ja = 125, md = 123, Qd = 59, Ho = 47, yd = 42, Sd = 43, bd = 45, xd = 36, $d = 96, kd = 92, wd = new Ju({
  start: !1,
  shift(n, e) {
    return e == dd || e == Od || e == fd ? n : e == ud;
  },
  strict: !1
}), Td = new Qi((n, e) => {
  let { next: t } = n;
  (t == Ja || t == -1 || e.context) && e.canShift(Yo) && n.acceptToken(Yo);
}, { contextual: !0, fallback: !0 }), vd = new Qi((n, e) => {
  let { next: t } = n, i;
  gd.indexOf(t) > -1 || t == Ho && ((i = n.peek(1)) == Ho || i == yd) || t != Ja && t != Qd && t != -1 && !e.context && e.canShift(Uo) && n.acceptToken(Uo);
}, { contextual: !0 }), Pd = new Qi((n, e) => {
  let { next: t } = n;
  if ((t == Sd || t == bd) && (n.advance(), t == n.next)) {
    n.advance();
    let i = !e.context && e.canShift(Fo);
    n.acceptToken(i ? Fo : ad);
  }
}, { contextual: !0 }), Cd = new Qi((n) => {
  for (let e = !1, t = 0; ; t++) {
    let { next: i } = n;
    if (i < 0) {
      t && n.acceptToken(Ei);
      break;
    } else if (i == $d) {
      t ? n.acceptToken(Ei) : n.acceptToken(cd, 1);
      break;
    } else if (i == md && e) {
      t == 1 ? n.acceptToken(hd, 1) : n.acceptToken(Ei, -1);
      break;
    } else if (i == 10 && t) {
      n.advance(), n.acceptToken(Ei);
      break;
    } else
      i == kd && n.advance();
    e = i == xd, n.advance();
  }
}), Rd = new Qi((n, e) => {
  if (!(n.next != 101 || !e.dialectEnabled(pd))) {
    n.advance();
    for (let t = 0; t < 6; t++) {
      if (n.next != "xtends".charCodeAt(t))
        return;
      n.advance();
    }
    n.next >= 57 && n.next <= 65 || n.next >= 48 && n.next <= 90 || n.next == 95 || n.next >= 97 && n.next <= 122 || n.next > 160 || n.acceptToken(ld);
  }
}), Ad = Fa({
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
}), Md = { __proto__: null, export: 18, as: 23, from: 29, default: 32, async: 37, function: 38, this: 48, true: 56, false: 56, void: 66, typeof: 70, null: 86, super: 88, new: 122, await: 139, yield: 141, delete: 142, class: 152, extends: 154, public: 197, private: 197, protected: 197, readonly: 199, instanceof: 220, in: 222, const: 224, import: 256, keyof: 307, unique: 311, infer: 317, is: 351, abstract: 371, implements: 373, type: 375, let: 378, var: 380, interface: 387, enum: 391, namespace: 397, module: 399, declare: 403, global: 407, for: 428, of: 437, while: 440, with: 444, do: 448, if: 452, else: 454, switch: 458, case: 464, try: 470, catch: 474, finally: 478, return: 482, throw: 486, break: 490, continue: 494, debugger: 498 }, Wd = { __proto__: null, async: 109, get: 111, set: 113, public: 161, private: 161, protected: 161, static: 163, abstract: 165, override: 167, readonly: 173, new: 355 }, Zd = { __proto__: null, "<": 129 }, Dd = dn.deserialize({
  version: 14,
  states: "$8SO`QdOOO'QQ(C|O'#ChO'XOWO'#DVO)dQdO'#D]O)tQdO'#DhO){QdO'#DrO-xQdO'#DxOOQO'#E]'#E]O.]Q`O'#E[O.bQ`O'#E[OOQ(C['#Ef'#EfO0aQ(C|O'#ItO2wQ(C|O'#IuO3eQ`O'#EzO3jQ!bO'#FaOOQ(C['#FS'#FSO3rO#tO'#FSO4QQ&jO'#FhO5bQ`O'#FgOOQ(C['#Iu'#IuOOQ(CW'#It'#ItOOQS'#J^'#J^O5gQ`O'#HpO5lQ(ChO'#HqOOQS'#Ih'#IhOOQS'#Hr'#HrQ`QdOOO){QdO'#DjO5tQ`O'#G[O5yQ&jO'#CmO6XQ`O'#EZO6dQ`O'#EgO6iQ,UO'#FRO7TQ`O'#G[O7YQ`O'#G`O7eQ`O'#G`O7sQ`O'#GcO7sQ`O'#GdO7sQ`O'#GfO5tQ`O'#GiO8dQ`O'#GlO9rQ`O'#CdO:SQ`O'#GyO:[Q`O'#HPO:[Q`O'#HRO`QdO'#HTO:[Q`O'#HVO:[Q`O'#HYO:aQ`O'#H`O:fQ(CjO'#HfO){QdO'#HhO:qQ(CjO'#HjO:|Q(CjO'#HlO5lQ(ChO'#HnO){QdO'#DWOOOW'#Ht'#HtO;XOWO,59qOOQ(C[,59q,59qO=jQtO'#ChO=tQdO'#HuO>XQ`O'#IvO@WQtO'#IvO'dQdO'#IvO@_Q`O,59wO@uQ7[O'#DbOAnQ`O'#E]OA{Q`O'#JROBWQ`O'#JQOBWQ`O'#JQOB`Q`O,5:yOBeQ`O'#JPOBlQaO'#DyO5yQ&jO'#EZOBzQ`O'#EZOCVQpO'#FROOQ(C[,5:S,5:SOC_QdO,5:SOE]Q(C|O,5:^OEyQ`O,5:dOFdQ(ChO'#JOO7YQ`O'#I}OFkQ`O'#I}OFsQ`O,5:xOFxQ`O'#I}OGWQdO,5:vOIWQ&jO'#EWOJeQ`O,5:vOKwQ&jO'#DlOLOQdO'#DqOLYQ7[O,5;PO){QdO,5;POOQS'#Er'#ErOOQS'#Et'#EtO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;RO){QdO,5;ROOQS'#Ex'#ExOLbQdO,5;cOOQ(C[,5;h,5;hOOQ(C[,5;i,5;iONbQ`O,5;iOOQ(C[,5;j,5;jO){QdO'#IPONgQ(ChO,5<TO! RQ&jO,5;RO){QdO,5;fO! kQ!bO'#JVO! YQ!bO'#JVO! rQ!bO'#JVO!!TQ!bO,5;qOOOO,5;{,5;{O!!cQdO'#FcOOOO'#IO'#IOO3rO#tO,5;nO!!jQ!bO'#FeOOQ(C[,5;n,5;nO!#WQ,VO'#CrOOQ(C]'#Cu'#CuO!#kQ`O'#CuO!#pOWO'#CyO!$^Q,VO,5<QO!$eQ`O,5<SO!%tQ&jO'#FrO!&RQ`O'#FsO!&WQ`O'#FsO!&]Q&jO'#FwO!'[Q7[O'#F{O!'}Q,VO'#IqOOQ(C]'#Iq'#IqO!(XQaO'#IpO!(gQ`O'#IoO!(oQ`O'#CqOOQ(C]'#Cs'#CsOOQ(C]'#C|'#C|O!(wQ`O'#DOOJjQ&jO'#FjOJjQ&jO'#FlO!(|Q`O'#FnO!)RQ`O'#FoO!&WQ`O'#FuOJjQ&jO'#FzO!)WQ`O'#E^O!)oQ`O,5<RO`QdO,5>[OOQS'#Ik'#IkOOQS,5>],5>]OOQS-E;p-E;pO!+kQ(C|O,5:UOOQ(CX'#Cp'#CpO!,[Q&kO,5<vOOQO'#Cf'#CfO!,mQ(ChO'#IlO5bQ`O'#IlO:aQ`O,59XO!-OQ!bO,59XO!-WQ&jO,59XO5yQ&jO,59XO!-cQ`O,5:vO!-kQ`O'#GxO!-yQ`O'#JbO){QdO,5;kO!.RQ7[O,5;mO!.WQ`O,5=cO!.]Q`O,5=cO!.bQ`O,5=cO5lQ(ChO,5=cO5tQ`O,5<vO!.pQ`O'#E_O!/UQ7[O'#E`OOQ(CW'#JP'#JPO!/gQ(ChO'#J_O5lQ(ChO,5<zO7sQ`O,5=QOOQP'#Cr'#CrO!/rQ!bO,5<}O!/zQ!cO,5=OO!0VQ`O,5=QO!0[QpO,5=TO:aQ`O'#GnO5tQ`O'#GpO!0dQ`O'#GpO5yQ&jO'#GsO!0iQ`O'#GsOOQS,5=W,5=WO!0nQ`O'#GtO!0vQ`O'#CmO!0{Q`O,59OO!1VQ`O,59OO!3XQdO,59OOOQS,59O,59OO!3fQ(ChO,59OO){QdO,59OO!3qQdO'#G{OOQS'#G|'#G|OOQS'#G}'#G}O`QdO,5=eO!4RQ`O,5=eO){QdO'#DxO`QdO,5=kO`QdO,5=mO!4WQ`O,5=oO`QdO,5=qO!4]Q`O,5=tO!4bQdO,5=zOOQS,5>Q,5>QO){QdO,5>QO5lQ(ChO,5>SOOQS,5>U,5>UO!8cQ`O,5>UOOQS,5>W,5>WO!8cQ`O,5>WOOQS,5>Y,5>YO!8hQpO,59rOOOW-E;r-E;rOOQ(C[1G/]1G/]O!8mQtO,5>aO'dQdO,5>aOOQO,5>f,5>fO!8wQdO'#HuOOQO-E;s-E;sO!9UQ`O,5?bO!9^QtO,5?bO!9eQ`O,5?lOOQ(C[1G/c1G/cO!9mQ!bO'#DTOOQO'#Ix'#IxO){QdO'#IxO!:[Q!bO'#IxO!:yQ!bO'#DcO!;[Q7[O'#DcO!=gQdO'#DcO!=nQ`O'#IwO!=vQ`O,59|O!={Q`O'#EaO!>ZQ`O'#JSO!>cQ`O,5:zO!>yQ7[O'#DcO){QdO,5?mO!?TQ`O'#HzOOQO-E;x-E;xO!9eQ`O,5?lOOQ(CW1G0e1G0eO!@aQ7[O'#D|OOQ(C[,5:e,5:eO){QdO,5:eOIWQ&jO,5:eO!@hQaO,5:eO:aQ`O,5:uO!-OQ!bO,5:uO!-WQ&jO,5:uO5yQ&jO,5:uOOQ(C[1G/n1G/nOOQ(C[1G0O1G0OOOQ(CW'#EV'#EVO){QdO,5?jO!@sQ(ChO,5?jO!AUQ(ChO,5?jO!A]Q`O,5?iO!AeQ`O'#H|O!A]Q`O,5?iOOQ(CW1G0d1G0dO7YQ`O,5?iOOQ(C[1G0b1G0bO!BPQ(C|O1G0bO!CRQ(CyO,5:rOOQ(C]'#Fq'#FqO!CoQ(C}O'#IqOGWQdO1G0bO!EqQ,VO'#IyO!E{Q`O,5:WO!FQQtO'#IzO){QdO'#IzO!F[Q`O,5:]OOQ(C]'#DT'#DTOOQ(C[1G0k1G0kO!FaQ`O1G0kO!HrQ(C|O1G0mO!HyQ(C|O1G0mO!K^Q(C|O1G0mO!KeQ(C|O1G0mO!MlQ(C|O1G0mO!NPQ(C|O1G0mO#!pQ(C|O1G0mO#!wQ(C|O1G0mO#%[Q(C|O1G0mO#%cQ(C|O1G0mO#'WQ(C|O1G0mO#*QQMlO'#ChO#+{QMlO1G0}O#-vQMlO'#IuOOQ(C[1G1T1G1TO#.ZQ(C|O,5>kOOQ(CW-E;}-E;}O#.zQ(C}O1G0mOOQ(C[1G0m1G0mO#1PQ(C|O1G1QO#1pQ!bO,5;sO#1uQ!bO,5;tO#1zQ!bO'#F[O#2`Q`O'#FZOOQO'#JW'#JWOOQO'#H}'#H}O#2eQ!bO1G1]OOQ(C[1G1]1G1]OOOO1G1f1G1fO#2sQMlO'#ItO#2}Q`O,5;}OLbQdO,5;}OOOO-E;|-E;|OOQ(C[1G1Y1G1YOOQ(C[,5<P,5<PO#3SQ!bO,5<POOQ(C],59a,59aOIWQ&jO'#C{OOOW'#Hs'#HsO#3XOWO,59eOOQ(C],59e,59eO){QdO1G1lO!)RQ`O'#IRO#3dQ`O,5<eOOQ(C],5<b,5<bOOQO'#GV'#GVOJjQ&jO,5<pOOQO'#GX'#GXOJjQ&jO,5<rOIWQ&jO,5<tOOQO1G1n1G1nO#3oQqO'#CpO#4SQqO,5<^O#4ZQ`O'#JZO5tQ`O'#JZO#4iQ`O,5<`OJjQ&jO,5<_O#4nQ`O'#FtO#4yQ`O,5<_O#5OQqO'#FqO#5]QqO'#J[O#5gQ`O'#J[OIWQ&jO'#J[O#5lQ`O,5<cOOQ(CW'#Dg'#DgO#5qQ!bO'#F|O!'VQ7[O'#F|O!'VQ7[O'#GOO#6SQ`O'#GPO!&WQ`O'#GSO#6XQ(ChO'#ITO#6dQ7[O,5<gOOQ(C],5<g,5<gO#6kQ7[O'#F|O#6yQ7[O'#F}O#7RQ7[O'#F}OOQ(C],5<u,5<uOJjQ&jO,5?[OJjQ&jO,5?[O#7WQ`O'#IUO#7cQ`O,5?ZO#7kQ`O,59]OOQ(C]'#Ch'#ChO#8[Q,VO,59jOOQ(C],59j,59jO#8}Q,VO,5<UO#9pQ,VO,5<WO#9zQ`O,5<YOOQ(C],5<Z,5<ZO#:PQ`O,5<aO#:UQ,VO,5<fOGWQdO1G1mO#:fQ`O1G1mOOQS1G3v1G3vOOQ(C[1G/p1G/pONbQ`O1G/pOOQS1G2b1G2bOIWQ&jO1G2bO){QdO1G2bOIWQ&jO1G2bO#:kQaO1G2bO#<QQ&jO'#EWOOQ(CW,5?W,5?WO#<[Q(ChO,5?WOOQS1G.s1G.sO:aQ`O1G.sO!-OQ!bO1G.sO!-WQ&jO1G.sO#<mQ`O1G0bO#<rQ`O'#ChO#<}Q`O'#JcO#=VQ`O,5=dO#=[Q`O'#JcO#=aQ`O'#JcO#=iQ`O'#I^O#=wQ`O,5?|O#>PQtO1G1VOOQ(C[1G1X1G1XO5tQ`O1G2}O#>WQ`O1G2}O#>]Q`O1G2}O#>bQ`O1G2}OOQS1G2}1G2}O#>gQ&kO1G2bO7YQ`O'#JQO7YQ`O'#EaO7YQ`O'#IWO#>xQ(ChO,5?yOOQS1G2f1G2fO!0VQ`O1G2lOIWQ&jO1G2iO#?TQ`O1G2iOOQS1G2j1G2jOIWQ&jO1G2jO#?YQaO1G2jO#?bQ7[O'#GhOOQS1G2l1G2lO!'VQ7[O'#IYO!0[QpO1G2oOOQS1G2o1G2oOOQS,5=Y,5=YO#?jQ&kO,5=[O5tQ`O,5=[O#6SQ`O,5=_O5bQ`O,5=_O!-OQ!bO,5=_O!-WQ&jO,5=_O5yQ&jO,5=_O#?{Q`O'#JaO#@WQ`O,5=`OOQS1G.j1G.jO#@]Q(ChO1G.jO#@hQ`O1G.jO#@mQ`O1G.jO5lQ(ChO1G.jO#@uQtO,5@OO#APQ`O,5@OO#A[QdO,5=gO#AcQ`O,5=gO7YQ`O,5@OOOQS1G3P1G3PO`QdO1G3POOQS1G3V1G3VOOQS1G3X1G3XO:[Q`O1G3ZO#AhQdO1G3]O#EcQdO'#H[OOQS1G3`1G3`O#EpQ`O'#HbO:aQ`O'#HdOOQS1G3f1G3fO#ExQdO1G3fO5lQ(ChO1G3lOOQS1G3n1G3nOOQ(CW'#Fx'#FxO5lQ(ChO1G3pO5lQ(ChO1G3rOOOW1G/^1G/^O#IvQpO,5<TO#JOQtO1G3{OOQO1G4Q1G4QO){QdO,5>aO#JYQ`O1G4|O#JbQ`O1G5WO#JjQ`O,5?dOLbQdO,5:{O7YQ`O,5:{O:aQ`O,59}OLbQdO,59}O!-OQ!bO,59}O#JoQMlO,59}OOQO,5:{,5:{O#JyQ7[O'#HvO#KaQ`O,5?cOOQ(C[1G/h1G/hO#KiQ7[O'#H{O#K}Q`O,5?nOOQ(CW1G0f1G0fO!;[Q7[O,59}O#LVQtO1G5XO7YQ`O,5>fOOQ(CW'#ES'#ESO#LaQ(DjO'#ETO!@XQ7[O'#D}OOQO'#Hy'#HyO#L{Q7[O,5:hOOQ(C[,5:h,5:hO#MSQ7[O'#D}O#MeQ7[O'#D}O#MlQ7[O'#EYO#MoQ7[O'#ETO#M|Q7[O'#ETO!@XQ7[O'#ETO#NaQ`O1G0PO#NfQqO1G0POOQ(C[1G0P1G0PO){QdO1G0POIWQ&jO1G0POOQ(C[1G0a1G0aO:aQ`O1G0aO!-OQ!bO1G0aO!-WQ&jO1G0aO#NmQ(C|O1G5UO){QdO1G5UO#N}Q(ChO1G5UO$ `Q`O1G5TO7YQ`O,5>hOOQO,5>h,5>hO$ hQ`O,5>hOOQO-E;z-E;zO$ `Q`O1G5TO$ vQ(C}O,59jO$#xQ(C}O,5<UO$%}Q(C}O,5<WO$(SQ(C}O,5<fOOQ(C[7+%|7+%|O$*_Q(C|O7+%|O$+OQ&jO'#HwO$+YQ`O,5?eOOQ(C]1G/r1G/rO$+bQdO'#HxO$+oQ`O,5?fO$+wQtO,5?fOOQ(C[1G/w1G/wOOQ(C[7+&V7+&VO$,RQMlO,5:^O){QdO7+&iO$,]QMlO,5:UOOQO1G1_1G1_OOQO1G1`1G1`O$,jQ!LQO,5;vOLbQdO,5;uOOQO-E;{-E;{OOQ(C[7+&w7+&wOOOO7+'Q7+'QOOOO1G1i1G1iO$,uQ`O1G1iOOQ(C[1G1k1G1kO$,zQqO,59gOOOW-E;q-E;qOOQ(C]1G/P1G/PO$-RQ(C|O7+'WOOQ(C],5>m,5>mO$-rQ`O,5>mOOQ(C]1G2P1G2PP$-wQ`O'#IRPOQ(C]-E<P-E<PO$.hQ,VO1G2[O$/ZQ,VO1G2^O$/eQqO1G2`OOQ(C]1G1x1G1xO$/lQ`O'#IQO$/zQ`O,5?uO$/zQ`O,5?uO$0SQ`O,5?uO$0_Q`O,5?uOOQO1G1z1G1zO$0mQ,VO1G1yOJjQ&jO1G1yO$0}Q&jO'#ISO$1_Q`O,5?vOIWQ&jO,5?vO$1gQqO,5?vOOQ(C]1G1}1G1}OOQ(CW,5<h,5<hOOQ(CW,5<i,5<iO$1qQ`O,5<iO#5}Q`O,5<iO!-OQ!bO,5<hO$1vQ`O,5<jOOQ(CW,5<k,5<kO$1qQ`O,5<nOOQO,5>o,5>oOOQO-E<R-E<ROOQ(C]1G2R1G2RO!'VQ7[O,5<hO$2OQ`O,5<iO!'VQ7[O,5<jO!'VQ7[O,5<iO$2ZQ,VO1G4vO$2eQ,VO1G4vOOQO,5>p,5>pOOQO-E<S-E<SOOQP1G.w1G.wO!.RQ7[O,59lO){QdO,59lO$2rQ`O1G1tOJjQ&jO1G1{O$2wQ(C|O7+'XOOQ(C[7+'X7+'XOGWQdO7+'XOOQ(C[7+%[7+%[O$3hQqO'#J]O#NaQ`O7+'|O$3rQ`O7+'|O$3zQqO7+'|OOQS7+'|7+'|OIWQ&jO7+'|O){QdO7+'|OIWQ&jO7+'|O$4UQ(CyO'#ChO$4iQ(CyO,5<lO$5ZQ`O,5<lOOQ(CW1G4r1G4rOOQS7+$_7+$_O:aQ`O7+$_O!-OQ!bO7+$_OGWQdO7+%|O$5`Q`O'#I]O$5qQ`O,5?}OOQO1G3O1G3OO5tQ`O,5?}O$5qQ`O,5?}O$5yQ`O,5?}OOQO,5>x,5>xOOQO-E<[-E<[OOQ(C[7+&q7+&qO$6OQ`O7+(iO5lQ(ChO7+(iO5tQ`O7+(iO$6TQ`O7+(iO$6YQaO7+'|OOQ(CW,5>r,5>rOOQ(CW-E<U-E<UOOQS7+(W7+(WO$6hQ(CyO7+(TOIWQ&jO7+(TO$6rQqO7+(UOOQS7+(U7+(UOIWQ&jO7+(UO$6yQ`O'#J`O$7UQ`O,5=SOOQO,5>t,5>tOOQO-E<W-E<WOOQS7+(Z7+(ZO$8OQ7[O'#GqOOQS1G2v1G2vOIWQ&jO1G2vO){QdO1G2vOIWQ&jO1G2vO$8VQaO1G2vO$8eQ&kO1G2vO5lQ(ChO1G2yO#6SQ`O1G2yO5bQ`O1G2yO!-OQ!bO1G2yO!-WQ&jO1G2yO$8vQ`O'#I[O$9RQ`O,5?{O$9ZQ7[O,5?{OOQ(CW1G2z1G2zOOQS7+$U7+$UO$9cQ`O7+$UO5lQ(ChO7+$UO$9hQ`O7+$UO){QdO1G5jO){QdO1G5kO$9mQdO1G3RO$9tQ`O1G3RO$9yQdO1G3RO$:QQ(ChO1G5jOOQS7+(k7+(kO5lQ(ChO7+(uO`QdO7+(wOOQS'#Jf'#JfOOQS'#I_'#I_O$:[QdO,5=vOOQS,5=v,5=vO){QdO'#H]O$:iQ`O'#H_OOQS,5=|,5=|O7YQ`O,5=|OOQS,5>O,5>OOOQS7+)Q7+)QOOQS7+)W7+)WOOQS7+)[7+)[OOQS7+)^7+)^OOQO1G5O1G5OO$:nQMlO1G0gO$:xQ`O1G0gOOQO1G/i1G/iO$;TQMlO1G/iO:aQ`O1G/iOLbQdO'#DcOOQO,5>b,5>bOOQO-E;t-E;tOOQO,5>g,5>gOOQO-E;y-E;yO!-OQ!bO1G/iO:aQ`O,5:iOOQO,5:o,5:oO){QdO,5:oO$;_Q(ChO,5:oO$;jQ(ChO,5:oO!-OQ!bO,5:iOOQO-E;w-E;wOOQ(C[1G0S1G0SO!@XQ7[O,5:iO$;xQ7[O,5:iO$<ZQ(DjO,5:oO$<uQ7[O,5:iO!@XQ7[O,5:oOOQO,5:t,5:tO$<|Q7[O,5:oO$=ZQ(ChO,5:oOOQ(C[7+%k7+%kO#NaQ`O7+%kO#NfQqO7+%kOOQ(C[7+%{7+%{O:aQ`O7+%{O!-OQ!bO7+%{O$=oQ(C|O7+*pO){QdO7+*pOOQO1G4S1G4SO7YQ`O1G4SO$>PQ`O7+*oO$>XQ(C}O1G2[O$@^Q(C}O1G2^O$BcQ(C}O1G1yO$DnQ,VO,5>cOOQO-E;u-E;uO$DxQtO,5>dO){QdO,5>dOOQO-E;v-E;vO$ESQ`O1G5QO$E[QMlO1G0bO$GcQMlO1G0mO$GjQMlO1G0mO$IkQMlO1G0mO$IrQMlO1G0mO$KgQMlO1G0mO$KzQMlO1G0mO$NXQMlO1G0mO$N`QMlO1G0mO%!aQMlO1G0mO%!hQMlO1G0mO%$]QMlO1G0mO%$pQ(C|O<<JTO%%rQMmO1G0mO%'|QMmO'#IqO%)iQMlO1G1QOLbQdO'#F^OOQO'#JX'#JXOOQO1G1b1G1bO%)vQ`O1G1aO%){QMlO,5>kOOOO7+'T7+'TOOOW1G/R1G/ROOQ(C]1G4X1G4XOJjQ&jO7+'zO%*VQ`O,5>lO5tQ`O,5>lOOQO-E<O-E<OO%*eQ`O1G5aO%*eQ`O1G5aO%*mQ`O1G5aO%*xQ,VO7+'eO%+YQqO,5>nO%+dQ`O,5>nOIWQ&jO,5>nOOQO-E<Q-E<QO%+iQqO1G5bO%+sQ`O1G5bOOQ(CW1G2T1G2TO$1qQ`O1G2TOOQ(CW1G2S1G2SO%+{Q`O1G2UOIWQ&jO1G2UOOQ(CW1G2Y1G2YO!-OQ!bO1G2SO#5}Q`O1G2TO%,QQ`O1G2UO%,YQ`O1G2TOJjQ&jO7+*bOOQ(C]1G/W1G/WO%,eQ`O1G/WOOQ(C]7+'`7+'`O%,jQ,VO7+'gO%,zQ(C|O<<JsOOQ(C[<<Js<<JsOIWQ&jO'#IVO%-kQ`O,5?wOOQS<<Kh<<KhOIWQ&jO<<KhO#NaQ`O<<KhO%-sQ`O<<KhO%-{QqO<<KhOIWQ&jO1G2WOOQS<<Gy<<GyO:aQ`O<<GyO%.VQ(C|O<<IhOOQ(C[<<Ih<<IhOOQO,5>w,5>wO%.vQ`O,5>wO%.{Q`O,5>wOOQO-E<Z-E<ZO%/TQ`O1G5iO%/TQ`O1G5iO5tQ`O1G5iO%/]Q`O<<LTOOQS<<LT<<LTO%/bQ`O<<LTO5lQ(ChO<<LTO){QdO<<KhOIWQ&jO<<KhOOQS<<Ko<<KoO$6hQ(CyO<<KoOOQS<<Kp<<KpO$6rQqO<<KpO%/gQ7[O'#IXO%/rQ`O,5?zOLbQdO,5?zOOQS1G2n1G2nO#LaQ(DjO'#ETO!@XQ7[O'#GrOOQO'#IZ'#IZO%/zQ7[O,5=]OOQS,5=],5=]O%0RQ7[O'#ETO%0^Q7[O'#ETO%0uQ7[O'#ETO%1PQ7[O'#GrO%1bQ`O7+(bO%1gQ`O7+(bO%1oQqO7+(bOOQS7+(b7+(bOIWQ&jO7+(bO){QdO7+(bOIWQ&jO7+(bO%1yQaO7+(bOOQS7+(e7+(eO5lQ(ChO7+(eO#6SQ`O7+(eO5bQ`O7+(eO!-OQ!bO7+(eO%2XQ`O,5>vOOQO-E<Y-E<YOOQO'#Gu'#GuO%2dQ`O1G5gO5lQ(ChO<<GpOOQS<<Gp<<GpO%2lQ`O<<GpO%2qQ`O7++UO%2vQ`O7++VOOQS7+(m7+(mO%2{Q`O7+(mO%3QQdO7+(mO%3XQ`O7+(mO){QdO7++UO){QdO7++VOOQS<<La<<LaOOQS<<Lc<<LcOOQS-E<]-E<]OOQS1G3b1G3bO%3^Q`O,5=wOOQS,5=y,5=yO%3cQ`O1G3hOLbQdO7+&ROOQO7+%T7+%TO%3hQMlO1G5XO:aQ`O7+%TOOQO1G0T1G0TO%3rQ(C|O1G0ZOOQO1G0Z1G0ZO){QdO1G0ZO%3|Q(ChO1G0ZO:aQ`O1G0TO!-OQ!bO1G0TO!@XQ7[O1G0TO%4XQ(ChO1G0ZO%4gQ7[O1G0TO%4xQ(ChO1G0ZO%5^Q(DjO1G0ZO%5hQ7[O1G0TO!@XQ7[O1G0ZOOQ(C[<<IV<<IVOOQ(C[<<Ig<<IgO:aQ`O<<IgO%5oQ(C|O<<N[OOQO7+)n7+)nO%6PQ(C}O7+'eO%8[Q(C}O7+'gO%:gQtO1G4OO%:qQMlO7+%|O%;gQMmO,59jO%=hQMmO,5<UO%?lQMmO,5<WO%A[QMmO,5<fO%B}QMlO7+'WO%C[QMlO7+'XO%CiQ`O,5;xOOQO7+&{7+&{O%CnQ,VO<<KfOOQO1G4W1G4WO%CuQ`O1G4WO%DQQ`O1G4WO%D`Q`O7+*{O%D`Q`O7+*{OIWQ&jO1G4YO%DhQqO1G4YO%DrQ`O7+*|OOQ(CW7+'o7+'oO$1qQ`O7+'pO%DzQqO7+'pOOQ(CW7+'n7+'nO$1qQ`O7+'oO%ERQ`O7+'pOIWQ&jO7+'pO#5}Q`O7+'oO%EWQ,VO<<M|OOQ(C]7+$r7+$rO%EbQqO,5>qOOQO-E<T-E<TO#NaQ`OANASOOQSANASANASOIWQ&jOANASO%ElQ(CyO7+'rOOQSAN=eAN=eO5tQ`O1G4cOOQO1G4c1G4cO%E|Q`O1G4cO%FRQ`O7++TO%FRQ`O7++TO5lQ(ChOANAoO%FZQ`OANAoOOQSANAoANAoO%F`Q`OANASO%FhQqOANASOOQSANAZANAZOOQSANA[ANA[O%FrQ`O,5>sOOQO-E<V-E<VO%F}QMlO1G5fO#6SQ`O,5=^O5bQ`O,5=^O!-OQ!bO,5=^OOQO-E<X-E<XOOQS1G2w1G2wO$<ZQ(DjO,5:oO!@XQ7[O,5=^O%GXQ7[O,5=^O%GjQ7[O,5:oOOQS<<K|<<K|OIWQ&jO<<K|O%1bQ`O<<K|O%GtQ`O<<K|O%G|QqO<<K|O){QdO<<K|OIWQ&jO<<K|OOQS<<LP<<LPO5lQ(ChO<<LPO#6SQ`O<<LPO5bQ`O<<LPO%HWQ7[O1G4bO%H`Q`O7++ROOQSAN=[AN=[O5lQ(ChOAN=[OOQS<<Np<<NpOOQS<<Nq<<NqOOQS<<LX<<LXO%HhQ`O<<LXO%HmQdO<<LXO%HtQ`O<<NpO%HyQ`O<<NqOOQS1G3c1G3cO:aQ`O7+)SO%IOQMlO<<ImOOQO<<Ho<<HoOOQO7+%u7+%uO%3rQ(C|O7+%uO){QdO7+%uOOQO7+%o7+%oO:aQ`O7+%oO!-OQ!bO7+%oO%IYQ(ChO7+%uO!@XQ7[O7+%oO%IeQ(ChO7+%uO%IsQ7[O7+%oO%JUQ(ChO7+%uOOQ(C[AN?RAN?RO%JjQMlO<<JTO%JwQMmO1G1yO%MOQMmO1G2[O& SQMmO1G2^O&!rQMlO<<JsO&#PQMlO<<IhOOQO1G1d1G1dOJjQ&jOANAQOOQO7+)r7+)rO&#^Q`O7+)rO&#iQ`O<<NgO&#qQqO7+)tOOQ(CW<<K[<<K[O$1qQ`O<<K[OOQ(CW<<KZ<<KZO&#{QqO<<K[O$1qQ`O<<KZOOQSG26nG26nO#NaQ`OG26nOOQO7+)}7+)}O5tQ`O7+)}O&$SQ`O<<NoOOQSG27ZG27ZO5lQ(ChOG27ZOIWQ&jOG26nOLbQdO1G4_O&$[Q`O7++QO5lQ(ChO1G2xO#6SQ`O1G2xO5bQ`O1G2xO!-OQ!bO1G2xO!@XQ7[O1G2xO%5^Q(DjO1G0ZO&$dQ7[O1G2xO%1bQ`OANAhOOQSANAhANAhOIWQ&jOANAhO&$uQ`OANAhO&$}QqOANAhOOQSANAkANAkO5lQ(ChOANAkO#6SQ`OANAkOOQO'#Gv'#GvOOQO7+)|7+)|OOQSG22vG22vOOQSANAsANAsO&%XQ`OANAsOOQSAND[AND[OOQSAND]AND]OOQS<<Ln<<LnOOQO<<Ia<<IaO%3rQ(C|O<<IaOOQO<<IZ<<IZO:aQ`O<<IZO){QdO<<IaO!-OQ!bO<<IZO&%^Q(ChO<<IaO!@XQ7[O<<IZO&%iQ(ChO<<IaO&%wQMmO7+'eO&'jQMmO7+'gO&)]Q,VOG26lOOQO<<M^<<M^OOQ(CWAN@vAN@vO$1qQ`OAN@vOOQ(CWAN@uAN@uOOQSLD,YLD,YOOQO<<Mi<<MiOOQSLD,uLD,uO#NaQ`OLD,YO&)mQMlO7+)yOOQO7+(d7+(dO5lQ(ChO7+(dO#6SQ`O7+(dO5bQ`O7+(dO!-OQ!bO7+(dO!@XQ7[O7+(dOOQSG27SG27SO%1bQ`OG27SOIWQ&jOG27SOOQSG27VG27VO5lQ(ChOG27VOOQSG27_G27_OOQOAN>{AN>{OOQOAN>uAN>uO%3rQ(C|OAN>{O:aQ`OAN>uO){QdOAN>{O!-OQ!bOAN>uO&)wQ(ChOAN>{O&*SQ(C}OG26lOOQ(CWG26bG26bOOQS!$( t!$( tOOQO<<LO<<LOO5lQ(ChO<<LOO#6SQ`O<<LOO5bQ`O<<LOO!-OQ!bO<<LOOOQSLD,nLD,nO%1bQ`OLD,nOOQSLD,qLD,qOOQOG24gG24gOOQOG24aG24aO%3rQ(C|OG24gO:aQ`OG24aO){QdOG24gO&,pQ!LRO,5:rO&-gQ$ITO'#IqOOQOANAjANAjO5lQ(ChOANAjO#6SQ`OANAjO5bQ`OANAjOOQS!$(!Y!$(!YOOQOLD*RLD*ROOQOLD){LD){O%3rQ(C|OLD*RO&.ZQMmOG26lO&/|Q!LRO,59jO&0pQ!LRO,5<UO&1dQ!LRO,5<WO&2WQ!LRO,5<fOOQOG27UG27UO5lQ(ChOG27UO#6SQ`OG27UOOQO!$'Mm!$'MmO&2}Q!LRO1G2[O&3qQ!LRO1G2^O&4eQ!LRO1G1yOOQOLD,pLD,pO5lQ(ChOLD,pO&5[Q!LRO7+'eO&6RQ!LRO7+'gOOQO!$(![!$(![O&6xQ!LROG26lOLbQdO'#DrO&7oQtO'#ItOLbQdO'#DjO&7vQ(C|O'#ChO&8aQtO'#ChO&8qQdO,5:vO&:qQ&jO'#EWOLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO,5;ROLbQdO'#IPO&<OQ`O,5<TO&=eQ&jO,5;ROLbQdO,5;fO!(wQ`O'#DOO!(wQ`O'#DOO!(wQ`O'#DOOIWQ&jO'#FjO&:qQ&jO'#FjO&<WQ&jO'#FjOIWQ&jO'#FlO&:qQ&jO'#FlO&<WQ&jO'#FlOIWQ&jO'#FzO&:qQ&jO'#FzO&<WQ&jO'#FzOLbQdO,5?mO&8qQdO1G0bO&=lQMlO'#ChOLbQdO1G1lOIWQ&jO,5<pO&:qQ&jO,5<pO&<WQ&jO,5<pOIWQ&jO,5<rO&:qQ&jO,5<rO&<WQ&jO,5<rOIWQ&jO,5<_O&:qQ&jO,5<_O&<WQ&jO,5<_O&8qQdO1G1mOLbQdO7+&iOIWQ&jO1G1yO&:qQ&jO1G1yO&<WQ&jO1G1yOIWQ&jO1G1{O&:qQ&jO1G1{O&<WQ&jO1G1{O&8qQdO7+'XO&8qQdO7+%|O&=vQ`O7+'pOIWQ&jOANAQO&:qQ&jOANAQO&<WQ&jOANAQO&=vQ`O<<K[O&=vQ`OAN@vO&={Q`O'#E[O&>QQ`O'#E[O&>YQ`O'#EzO&>_Q`O'#EgO&>dQ`O'#JRO&>oQ`O'#JPO&>zQ`O,5:vO&?PQ,VO,5<QO&?WQ`O'#FsO&?]Q`O'#FsO&?bQ`O'#FsO&?gQ`O,5<RO&?oQ`O,5:vO&?wQMlO1G0}O&@OQ`O,5<_O&@TQ`O,5<_O&@YQ`O,5<_O&@_Q`O,5<aO&@dQ`O,5<aO&@iQ`O,5<aO&@nQ`O1G1mO&@sQ`O1G0bO&@xQ`O1G2UO&@}Q,VO<<KfO&AUQ,VO<<KfO&A]Q,VO<<KfO&AdQqO7+'pO&AkQ`O7+'pO&ApQqO<<K[O4QQ&jO'#FhO5bQ`O'#FgOBzQ`O'#EZOLbQdO,5;cO!&WQ`O'#FsO!&WQ`O'#FsO!&WQ`O'#FsO!&WQ`O'#FuO!&WQ`O'#FuO!&WQ`O'#FuO&AwQ`O,5<jOJjQ&jO7+'zOJjQ&jO7+'zOJjQ&jO7+'zOIWQ&jO1G2UO&BPQ`O1G2UOIWQ&jO7+'pO!'VQ7[O'#GOO$/eQqO1G2`O$/eQqO1G2`O$/eQqO1G2`O!'VQ7[O,5<jOIWQ&jO,5<tOIWQ&jO,5<tOIWQ&jO,5<t",
  stateData: "&B}~O'YOS'ZOSTOSUOS~OQTORTOXyO]cO_hObnOcmOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!TSO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!nlO#dsO#tpO#x^O%PqO%RtO%TrO%UrO%XuO%ZvO%^wO%_wO%axO%nzO%t{O%v|O%x}O%z!OO%}!PO&T!QO&Z!RO&]!SO&_!TO&a!UO&c!VO']PO'fQO'oYO'|aO~OQ[XZ[X_[Xj[Xu[Xv[Xx[X!R[X!a[X!b[X!d[X!j[X!{[X#WdX#[[X#][X#^[X#_[X#`[X#a[X#b[X#c[X#e[X#g[X#i[X#j[X#o[X'W[X'f[X'p[X'w[X'x[X~O!]$lX~P$zOS!WO'U!XO'V!ZO~OQTORTO]cOb!kOc!jOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!T!bO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!n!iO#t!lO#x^O']![O'fQO'oYO'|aO~O!Q!`O!R!]O!O'jP!O'tP~P'dO!S!mO~P`OQTORTO]cOb!kOc!jOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!T!bO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!n!iO#t!lO#x^O']9aO'fQO'oYO'|aO~OQTORTO]cOb!kOc!jOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!T!bO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!n!iO#t!lO#x^O'fQO'oYO'|aO~O!Q!rO#U!uO#V!rO']9bO!c'qP~P+{O#W!vO~O!]!wO#W!vO~OQ#^OZ#dOj#ROu!{Ov!{Ox!|O!R#bO!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO#i#YO#j#ZO'fQO'p#[O'w!}O'x#OO~O_'hX'W'hX!c'hX!O'hX!T'hX%Q'hX!]'hX~P.jO!{#eO#o#eOQ'iXZ'iX_'iXj'iXu'iXv'iXx'iX!R'iX!a'iX!b'iX!d'iX!j'iX#['iX#]'iX#^'iX#_'iX#`'iX#a'iX#b'iX#e'iX#g'iX#i'iX#j'iX'f'iX'p'iX'w'iX'x'iX~O#c'iX'W'iX!O'iX!c'iXn'iX!T'iX%Q'iX!]'iX~P0zO!{#eO~O#z#fO$R#jO~O!T#kO#x^O$U#lO$W#nO~O]#qOh$QOj#rOk#qOl#qOq$ROs$SOx#yO!T#zO!_$XO!d#vO#V$YO#t$VO$_$TO$a$UO$d$WO']#pO'b$PO'f#sO'a'cP~O!d$ZO~O!]$]O~O_$^O'W$^O~O']$bO~O!d$ZO']$bO'^$dO'b$PO~Oc$jO!d$ZO']$bO~O#c#TO~O]$sOu$oO!T$lO!d$nO%R$rO']$bO'^$dO^(UP~O!n$tO~Ox$uO!T$vO']$bO~Ox$uO!T$vO%Z$zO']$bO~O']${O~O#dsO%RtO%TrO%UrO%XuO%ZvO%^wO%_wO~Ob%UOc%TO!n%RO%P%SO%c%QO~P7xOb%XOcmO!T%WO!nlO#dsO%PqO%TrO%UrO%XuO%ZvO%^wO%_wO%axO~O`%[O!{%_O%R%YO'^$dO~P8wO!d%`O!g%dO~O!d%eO~O!TSO~O_$^O'T%mO'W$^O~O_$^O'T%pO'W$^O~O_$^O'T%rO'W$^O~OS!WO'U!XO'V%vO~OQ[XZ[Xj[Xu[Xv[Xx[X!R[X!RdX!a[X!b[X!d[X!j[X!{[X!{dX#WdX#[[X#][X#^[X#_[X#`[X#a[X#b[X#c[X#e[X#g[X#i[X#j[X#o[X'f[X'p[X'w[X'x[X~O!O[X!OdX~P;dO!Q%xO!O&iX!O&nX!R&iX!R&nX~P'dO!R%zO!O'jX~OQ#^OZ#dOj#ROu!{Ov!{Ox!|O!R%zO!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO#i#YO#j#ZO'fQO'p#[O'w!}O'x#OO~O!O'jX~P>aO!O&PO~Ox&SO!W&^O!X&VO!Y&VO'^$dO~O]&TOk&TO!Q&WO'g&QO!S'kP!S'vP~P@dO!O'sX!R'sX!]'sX!c'sX'p'sX~O!{'sX#W#PX!S'sX~PA]O!{&_O!O'uX!R'uX~O!R&`O!O'tX~O!O&cO~O!{#eO~PA]OP&gO!T&dO!o&fO']$bO~Oc&lO!d$ZO']$bO~Ou$oO!d$nO~O!S&mO~P`Ou!{Ov!{Ox!|O!b!yO!d!zO'fQOQ!faZ!faj!fa!R!fa!a!fa!j!fa#[!fa#]!fa#^!fa#_!fa#`!fa#a!fa#b!fa#c!fa#e!fa#g!fa#i!fa#j!fa'p!fa'w!fa'x!fa~O_!fa'W!fa!O!fa!c!fan!fa!T!fa%Q!fa!]!fa~PCfO!c&nO~O!]!wO!{&pO'p&oO!R'rX_'rX'W'rX~O!c'rX~PFOO!R&tO!c'qX~O!c&vO~Ox$uO!T$vO#V&wO']$bO~OQTORTO]cOb!kOc!jOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!TSO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!n!iO#t!lO#x^O']9aO'fQO'oYO'|aO~O]#qOh$QOj#rOk#qOl#qOq$ROs9tOx#yO!T#zO!_;eO!d#vO#V9}O#t$VO$_9wO$a9zO$d$WO']&{O'b$PO'f#sO~O#W&}O~O]#qOh$QOj#rOk#qOl#qOq$ROs$SOx#yO!T#zO!_$XO!d#vO#V$YO#t$VO$_$TO$a$UO$d$WO']&{O'b$PO'f#sO~O'a'mP~PJjO!Q'RO!c'nP~P){O'g'TO'oYO~OQ9^OR9^O]cOb;`Oc!jOhcOj9^OkcOlcOq9^Os9^OxRO{cO|cO}cO!T!bO!_9`O!dUO!g9^O!h9^O!i9^O!j9^O!k9^O!n!iO#t!lO#x^O']'cO'fQO'oYO'|;^O~O!d!zO~O!R#bO_$]a'W$]a!c$]a!O$]a!T$]a%Q$]a!]$]a~O#d'jO~PIWO!]'lO!T'yX#w'yX#z'yX$R'yX~Ou'mO~P! YOu'mO!T'yX#w'yX#z'yX$R'yX~O!T'oO#w'sO#z'nO$R'tO~O!Q'wO~PLbO#z#fO$R'zO~OP$eXu$eXx$eX!b$eX'w$eX'x$eX~OPfX!RfX!{fX'afX'a$eX~P!!rOk'|O~OS'}O'U(OO'V(QO~OP(ZOu(SOx(TO'w(VO'x(XO~O'a(RO~P!#{O'a([O~O]#qOh$QOj#rOk#qOl#qOq$ROs9tOx#yO!T#zO!_;eO!d#vO#V9}O#t$VO$_9wO$a9zO$d$WO'b$PO'f#sO~O!Q(`O'](]O!c'}P~P!$jO#W(bO~O!d(cO~O!Q(hO'](eO!O(OP~P!$jOj(uOx(mO!W(sO!X(lO!Y(lO!d(cO!x(tO$w(oO'^$dO'g(jO~O!S(rO~P!&jO!b!yOP'eXu'eXx'eX'w'eX'x'eX!R'eX!{'eX~O'a'eX#m'eX~P!'cOP(xO!{(wO!R'dX'a'dX~O!R(yO'a'cX~O']${O'a'cP~O'](|O~O!d)RO~O']&{O~Ox$uO!Q!rO!T$vO#U!uO#V!rO']$bO!c'qP~O!]!wO#W)VO~OQ#^OZ#dOj#ROu!{Ov!{Ox!|O!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO#i#YO#j#ZO'fQO'p#[O'w!}O'x#OO~O_!^a!R!^a'W!^a!O!^a!c!^an!^a!T!^a%Q!^a!]!^a~P!)wOP)_O!T&dO!o)^O%Q)]O'b$PO~O!])aO!T'`X_'`X!R'`X'W'`X~O!d$ZO'b$PO~O!d$ZO']$bO'b$PO~O!]!wO#W&}O~O])lO%R)mO'])iO!S(VP~O!R)nO^(UX~O'g'TO~OZ)rO~O^)sO~O!T$lO']$bO'^$dO^(UP~Ox$uO!Q)xO!R&`O!T$vO']$bO!O'tP~O]&ZOk&ZO!Q)yO'g'TO!S'vP~O!R)zO_(RX'W(RX~O!{*OO'b$PO~OP*RO!T#zO'b$PO~O!T*TO~Ou*VO!TSO~O!n*[O~Oc*aO~O'](|O!S(TP~Oc$jO~O%RtO']${O~P8wOZ*gO^*fO~OQTORTO]cObnOcmOhcOjTOkcOlcOqTOsTOxRO{cO|cO}cO!_kO!dUO!gTO!hTO!iTO!jTO!kTO!nlO#x^O%PqO'fQO'oYO'|aO~O!T!bO#t!lO']9aO~P!1_O^*fO_$^O'W$^O~O_*kO#d*mO%T*mO%U*mO~P){O!d%`O~O%t*rO~O!T*tO~O&V*vO&X*wOQ&SaR&SaX&Sa]&Sa_&Sab&Sac&Sah&Saj&Sak&Sal&Saq&Sas&Sax&Sa{&Sa|&Sa}&Sa!T&Sa!_&Sa!d&Sa!g&Sa!h&Sa!i&Sa!j&Sa!k&Sa!n&Sa#d&Sa#t&Sa#x&Sa%P&Sa%R&Sa%T&Sa%U&Sa%X&Sa%Z&Sa%^&Sa%_&Sa%a&Sa%n&Sa%t&Sa%v&Sa%x&Sa%z&Sa%}&Sa&T&Sa&Z&Sa&]&Sa&_&Sa&a&Sa&c&Sa'S&Sa']&Sa'f&Sa'o&Sa'|&Sa!S&Sa%{&Sa`&Sa&Q&Sa~O']*|O~On+PO~O!O&ia!R&ia~P!)wO!Q+TO!O&iX!R&iX~P){O!R%zO!O'ja~O!O'ja~P>aO!R&`O!O'ta~O!RwX!R!ZX!SwX!S!ZX!]wX!]!ZX!d!ZX!{wX'b!ZX~O!]+YO!{+XO!R#TX!R'lX!S#TX!S'lX!]'lX!d'lX'b'lX~O!]+[O!d$ZO'b$PO!R!VX!S!VX~O]&ROk&ROx&SO'g(jO~OQ9^OR9^O]cOb;`Oc!jOhcOj9^OkcOlcOq9^Os9^OxRO{cO|cO}cO!T!bO!_9`O!dUO!g9^O!h9^O!i9^O!j9^O!k9^O!n!iO#t!lO#x^O'fQO'oYO'|;^O~O']:SO~P!;jO!R+`O!S'kX~O!S+bO~O!]+YO!{+XO!R#TX!S#TX~O!R+cO!S'vX~O!S+eO~O]&ROk&ROx&SO'^$dO'g(jO~O!X+fO!Y+fO~P!>hOx$uO!Q+hO!T$vO']$bO!O&nX!R&nX~O_+lO!W+oO!X+kO!Y+kO!r+sO!s+qO!t+rO!u+pO!x+tO'^$dO'g(jO'o+iO~O!S+nO~P!?iOP+yO!T&dO!o+xO~O!{,PO!R'ra!c'ra_'ra'W'ra~O!]!wO~P!@sO!R&tO!c'qa~Ox$uO!Q,SO!T$vO#U,UO#V,SO']$bO!R&pX!c&pX~O_#Oi!R#Oi'W#Oi!O#Oi!c#Oin#Oi!T#Oi%Q#Oi!]#Oi~P!)wOP;tOu(SOx(TO'w(VO'x(XO~O#W!za!R!za!c!za!{!za!T!za_!za'W!za!O!za~P!BpO#W'eXQ'eXZ'eX_'eXj'eXv'eX!a'eX!d'eX!j'eX#['eX#]'eX#^'eX#_'eX#`'eX#a'eX#b'eX#c'eX#e'eX#g'eX#i'eX#j'eX'W'eX'f'eX'p'eX!c'eX!O'eX!T'eXn'eX%Q'eX!]'eX~P!'cO!R,_O'a'mX~P!#{O'a,aO~O!R,bO!c'nX~P!)wO!c,eO~O!O,fO~OQ#^Ou!{Ov!{Ox!|O!b!yO!d!zO!j#^O'fQOZ#Zi_#Zij#Zi!R#Zi!a#Zi#]#Zi#^#Zi#_#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi'W#Zi'p#Zi'w#Zi'x#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~O#[#Zi~P!FfO#[#PO~P!FfOQ#^Ou!{Ov!{Ox!|O!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO'fQOZ#Zi_#Zi!R#Zi!a#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi'W#Zi'p#Zi'w#Zi'x#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~Oj#Zi~P!IQOj#RO~P!IQOQ#^Oj#ROu!{Ov!{Ox!|O!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO'fQO_#Zi!R#Zi#e#Zi#g#Zi#i#Zi#j#Zi'W#Zi'p#Zi'w#Zi'x#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~OZ#Zi!a#Zi#a#Zi#b#Zi#c#Zi~P!KlOZ#dO!a#TO#a#TO#b#TO#c#TO~P!KlOQ#^OZ#dOj#ROu!{Ov!{Ox!|O!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO'fQO_#Zi!R#Zi#g#Zi#i#Zi#j#Zi'W#Zi'p#Zi'x#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~O'w#Zi~P!NdO'w!}O~P!NdOQ#^OZ#dOj#ROu!{Ov!{Ox!|O!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO'fQO'w!}O_#Zi!R#Zi#i#Zi#j#Zi'W#Zi'p#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~O'x#Zi~P##OO'x#OO~P##OOQ#^OZ#dOj#ROu!{Ov!{Ox!|O!a#TO!b!yO!d!zO!j#^O#[#PO#]#QO#^#QO#_#QO#`#SO#a#TO#b#TO#c#TO#e#UO#g#WO#i#YO'fQO'w!}O'x#OO~O_#Zi!R#Zi#j#Zi'W#Zi'p#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~P#%jOQ[XZ[Xj[Xu[Xv[Xx[X!a[X!b[X!d[X!j[X!{[X#WdX#[[X#][X#^[X#_[X#`[X#a[X#b[X#c[X#e[X#g[X#i[X#j[X#o[X'f[X'p[X'w[X'x[X!R[X!S[X~O#m[X~P#'}OQ#^OZ9rOj9gOu!{Ov!{Ox!|O!a9iO!b!yO!d!zO!j#^O#[9eO#]9fO#^9fO#_9fO#`9hO#a9iO#b9iO#c9iO#e9jO#g9lO#i9nO#j9oO'fQO'p#[O'w!}O'x#OO~O#m,hO~P#*XOQ'iXZ'iXj'iXu'iXv'iXx'iX!a'iX!b'iX!d'iX!j'iX#['iX#]'iX#^'iX#_'iX#`'iX#a'iX#b'iX#e'iX#g'iX#i'iX#j'iX'f'iX'p'iX'w'iX'x'iX!R'iX~O!{9sO#o9sO#c'iX#m'iX!S'iX~P#,SO_&sa!R&sa'W&sa!c&san&sa!O&sa!T&sa%Q&sa!]&sa~P!)wOQ#ZiZ#Zi_#Zij#Ziv#Zi!R#Zi!a#Zi!b#Zi!d#Zi!j#Zi#[#Zi#]#Zi#^#Zi#_#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi'W#Zi'f#Zi'p#Zi!O#Zi!c#Zin#Zi!T#Zi%Q#Zi!]#Zi~P!BpO_#ni!R#ni'W#ni!O#ni!c#nin#ni!T#ni%Q#ni!]#ni~P!)wO#z,jO~O#z,kO~O!]'lO!{,lO!T$OX#w$OX#z$OX$R$OX~O!Q,mO~O!T'oO#w,oO#z'nO$R,pO~O!R9pO!S'hX~P#*XO!S,qO~O$R,sO~OS'}O'U(OO'V,vO~O],yOk,yO!O,zO~O!RdX!]dX!cdX!c$eX'pdX~P!!rO!c-QO~P!BpO!R-RO!]!wO'p&oO!c'}X~O!c-WO~O!Q(`O']$bO!c'}P~O#W-YO~O!O$eX!R$eX!]$lX~P!!rO!R-ZO!O(OX~P!BpO!]-]O~O!O-_O~Oj-cO!]!wO!d$ZO'b$PO'p&oO~O!])aO~O_$^O!R-hO'W$^O~O!S-jO~P!&jO!X-kO!Y-kO'^$dO'g(jO~Ox-mO'g(jO~O!x-nO~O']${O!R&xX'a&xX~O!R(yO'a'ca~O'a-sO~Ou-tOv-tOx-uOPra'wra'xra!Rra!{ra~O'ara#mra~P#7pOu(SOx(TOP$^a'w$^a'x$^a!R$^a!{$^a~O'a$^a#m$^a~P#8fOu(SOx(TOP$`a'w$`a'x$`a!R$`a!{$`a~O'a$`a#m$`a~P#9XO]-vO~O#W-wO~O'a$na!R$na!{$na#m$na~P!#{O#W-zO~OP.TO!T&dO!o.SO%Q.RO~O]#qOj#rOk#qOl#qOq$ROs9tOx#yO!T#zO!_;eO!d#vO#V9}O#t$VO$_9wO$a9zO$d$WO'b$PO'f#sO~Oh.VO'].UO~P#:yO!])aO!T'`a_'`a!R'`a'W'`a~O#W.]O~OZ[X!RdX!SdX~O!R.^O!S(VX~O!S.`O~OZ.aO~O].cO'])iO~O!T$lO']$bO^'QX!R'QX~O!R)nO^(Ua~O!c.fO~P!)wO].hO~OZ.iO~O^.jO~OP.TO!T&dO!o.SO%Q.RO'b$PO~O!R)zO_(Ra'W(Ra~O!{.pO~OP.sO!T#zO~O'g'TO!S(SP~OP.}O!T.yO!o.|O%Q.{O'b$PO~OZ/XO!R/VO!S(TX~O!S/YO~O^/[O_$^O'W$^O~O]/]O~O]/^O'](|O~O#c/_O%r/`O~P0zO!{#eO#c/_O%r/`O~O_/aO~P){O_/cO~O%{/gOQ%yiR%yiX%yi]%yi_%yib%yic%yih%yij%yik%yil%yiq%yis%yix%yi{%yi|%yi}%yi!T%yi!_%yi!d%yi!g%yi!h%yi!i%yi!j%yi!k%yi!n%yi#d%yi#t%yi#x%yi%P%yi%R%yi%T%yi%U%yi%X%yi%Z%yi%^%yi%_%yi%a%yi%n%yi%t%yi%v%yi%x%yi%z%yi%}%yi&T%yi&Z%yi&]%yi&_%yi&a%yi&c%yi'S%yi']%yi'f%yi'o%yi'|%yi!S%yi`%yi&Q%yi~O`/mO!S/kO&Q/lO~P`O!TSO!d/oO~O&X*wOQ&SiR&SiX&Si]&Si_&Sib&Sic&Sih&Sij&Sik&Sil&Siq&Sis&Six&Si{&Si|&Si}&Si!T&Si!_&Si!d&Si!g&Si!h&Si!i&Si!j&Si!k&Si!n&Si#d&Si#t&Si#x&Si%P&Si%R&Si%T&Si%U&Si%X&Si%Z&Si%^&Si%_&Si%a&Si%n&Si%t&Si%v&Si%x&Si%z&Si%}&Si&T&Si&Z&Si&]&Si&_&Si&a&Si&c&Si'S&Si']&Si'f&Si'o&Si'|&Si!S&Si%{&Si`&Si&Q&Si~O!R#bOn$]a~O!O&ii!R&ii~P!)wO!R%zO!O'ji~O!R&`O!O'ti~O!O/uO~O!R!Va!S!Va~P#*XO]&ROk&RO!Q/{O'g(jO!R&jX!S&jX~P@dO!R+`O!S'ka~O]&ZOk&ZO!Q)yO'g'TO!R&oX!S&oX~O!R+cO!S'va~O!O'ui!R'ui~P!)wO_$^O!]!wO!d$ZO!j0VO!{0TO'W$^O'b$PO'p&oO~O!S0YO~P!?iO!X0ZO!Y0ZO'^$dO'g(jO'o+iO~O!W0[O~P#MSO!TSO!W0[O!u0^O!x0_O~P#MSO!W0[O!s0aO!t0aO!u0^O!x0_O~P#MSO!T&dO~O!T&dO~P!BpO!R'ri!c'ri_'ri'W'ri~P!)wO!{0jO!R'ri!c'ri_'ri'W'ri~O!R&tO!c'qi~Ox$uO!T$vO#V0lO']$bO~O#WraQraZra_rajra!ara!bra!dra!jra#[ra#]ra#^ra#_ra#`ra#ara#bra#cra#era#gra#ira#jra'Wra'fra'pra!cra!Ora!Tranra%Qra!]ra~P#7pO#W$^aQ$^aZ$^a_$^aj$^av$^a!a$^a!b$^a!d$^a!j$^a#[$^a#]$^a#^$^a#_$^a#`$^a#a$^a#b$^a#c$^a#e$^a#g$^a#i$^a#j$^a'W$^a'f$^a'p$^a!c$^a!O$^a!T$^an$^a%Q$^a!]$^a~P#8fO#W$`aQ$`aZ$`a_$`aj$`av$`a!a$`a!b$`a!d$`a!j$`a#[$`a#]$`a#^$`a#_$`a#`$`a#a$`a#b$`a#c$`a#e$`a#g$`a#i$`a#j$`a'W$`a'f$`a'p$`a!c$`a!O$`a!T$`an$`a%Q$`a!]$`a~P#9XO#W$naQ$naZ$na_$naj$nav$na!R$na!a$na!b$na!d$na!j$na#[$na#]$na#^$na#_$na#`$na#a$na#b$na#c$na#e$na#g$na#i$na#j$na'W$na'f$na'p$na!c$na!O$na!T$na!{$nan$na%Q$na!]$na~P!BpO_#Oq!R#Oq'W#Oq!O#Oq!c#Oqn#Oq!T#Oq%Q#Oq!]#Oq~P!)wO!R&kX'a&kX~PJjO!R,_O'a'ma~O!Q0tO!R&lX!c&lX~P){O!R,bO!c'na~O!R,bO!c'na~P!)wO#m!fa!S!fa~PCfO#m!^a!R!^a!S!^a~P#*XO!T1XO#x^O$P1YO~O!S1^O~On1_O~P!BpO_$Yq!R$Yq'W$Yq!O$Yq!c$Yqn$Yq!T$Yq%Q$Yq!]$Yq~P!)wO!O1`O~O],yOk,yO~Ou(SOx(TO'x(XOP$xi'w$xi!R$xi!{$xi~O'a$xi#m$xi~P$.POu(SOx(TOP$zi'w$zi'x$zi!R$zi!{$zi~O'a$zi#m$zi~P$.rO'p#[O~P!BpO!Q1cO']$bO!R&tX!c&tX~O!R-RO!c'}a~O!R-RO!]!wO!c'}a~O!R-RO!]!wO'p&oO!c'}a~O'a$gi!R$gi!{$gi#m$gi~P!#{O!Q1kO'](eO!O&vX!R&vX~P!$jO!R-ZO!O(Oa~O!R-ZO!O(Oa~P!BpO!]!wO~O!]!wO#c1sO~Oj1vO!]!wO'p&oO~O!R'di'a'di~P!#{O!{1yO!R'di'a'di~P!#{O!c1|O~O_$Zq!R$Zq'W$Zq!O$Zq!c$Zqn$Zq!T$Zq%Q$Zq!]$Zq~P!)wO!R2QO!T(PX~P!BpO!T&dO%Q2TO~O!T&dO%Q2TO~P!BpO!T$eX$u[X_$eX!R$eX'W$eX~P!!rO$u2XOPgXugXxgX!TgX'wgX'xgX_gX!RgX'WgX~O$u2XO~O]2_O%R2`O'])iO!R'PX!S'PX~O!R.^O!S(Va~OZ2dO~O^2eO~O]2hO~OP2jO!T&dO!o2iO%Q2TO~O_$^O'W$^O~P!BpO!T#zO~P!BpO!R2oO!{2qO!S(SX~O!S2rO~Ox;oO!W2{O!X2tO!Y2tO!r2zO!s2yO!t2yO!x2xO'^$dO'g(jO'o+iO~O!S2wO~P$7ZOP3SO!T.yO!o3RO%Q3QO~OP3SO!T.yO!o3RO%Q3QO'b$PO~O'](|O!R'OX!S'OX~O!R/VO!S(Ta~O]3^O'g3]O~O]3_O~O^3aO~O!c3dO~P){O_3fO~O_3fO~P){O#c3hO%r3iO~PFOO`/mO!S3mO&Q/lO~P`O!]3oO~O!R#Ti!S#Ti~P#*XO!{3qO!R#Ti!S#Ti~O!R!Vi!S!Vi~P#*XO_$^O!{3xO'W$^O~O_$^O!]!wO!{3xO'W$^O~O!X3|O!Y3|O'^$dO'g(jO'o+iO~O_$^O!]!wO!d$ZO!j3}O!{3xO'W$^O'b$PO'p&oO~O!W4OO~P$;xO!W4OO!u4RO!x4SO~P$;xO_$^O!]!wO!j3}O!{3xO'W$^O'p&oO~O!R'rq!c'rq_'rq'W'rq~P!)wO!R&tO!c'qq~O#W$xiQ$xiZ$xi_$xij$xiv$xi!a$xi!b$xi!d$xi!j$xi#[$xi#]$xi#^$xi#_$xi#`$xi#a$xi#b$xi#c$xi#e$xi#g$xi#i$xi#j$xi'W$xi'f$xi'p$xi!c$xi!O$xi!T$xin$xi%Q$xi!]$xi~P$.PO#W$ziQ$ziZ$zi_$zij$ziv$zi!a$zi!b$zi!d$zi!j$zi#[$zi#]$zi#^$zi#_$zi#`$zi#a$zi#b$zi#c$zi#e$zi#g$zi#i$zi#j$zi'W$zi'f$zi'p$zi!c$zi!O$zi!T$zin$zi%Q$zi!]$zi~P$.rO#W$giQ$giZ$gi_$gij$giv$gi!R$gi!a$gi!b$gi!d$gi!j$gi#[$gi#]$gi#^$gi#_$gi#`$gi#a$gi#b$gi#c$gi#e$gi#g$gi#i$gi#j$gi'W$gi'f$gi'p$gi!c$gi!O$gi!T$gi!{$gin$gi%Q$gi!]$gi~P!BpO!R&ka'a&ka~P!#{O!R&la!c&la~P!)wO!R,bO!c'ni~O#m#Oi!R#Oi!S#Oi~P#*XOQ#^Ou!{Ov!{Ox!|O!b!yO!d!zO!j#^O'fQOZ#Zij#Zi!a#Zi#]#Zi#^#Zi#_#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi#m#Zi'p#Zi'w#Zi'x#Zi!R#Zi!S#Zi~O#[#Zi~P$EiO#[9eO~P$EiOQ#^Ou!{Ov!{Ox!|O!b!yO!d!zO!j#^O#[9eO#]9fO#^9fO#_9fO'fQOZ#Zi!a#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi#m#Zi'p#Zi'w#Zi'x#Zi!R#Zi!S#Zi~Oj#Zi~P$GqOj9gO~P$GqOQ#^Oj9gOu!{Ov!{Ox!|O!b!yO!d!zO!j#^O#[9eO#]9fO#^9fO#_9fO#`9hO'fQO#e#Zi#g#Zi#i#Zi#j#Zi#m#Zi'p#Zi'w#Zi'x#Zi!R#Zi!S#Zi~OZ#Zi!a#Zi#a#Zi#b#Zi#c#Zi~P$IyOZ9rO!a9iO#a9iO#b9iO#c9iO~P$IyOQ#^OZ9rOj9gOu!{Ov!{Ox!|O!a9iO!b!yO!d!zO!j#^O#[9eO#]9fO#^9fO#_9fO#`9hO#a9iO#b9iO#c9iO#e9jO'fQO#g#Zi#i#Zi#j#Zi#m#Zi'p#Zi'x#Zi!R#Zi!S#Zi~O'w#Zi~P$L_O'w!}O~P$L_OQ#^OZ9rOj9gOu!{Ov!{Ox!|O!a9iO!b!yO!d!zO!j#^O#[9eO#]9fO#^9fO#_9fO#`9hO#a9iO#b9iO#c9iO#e9jO#g9lO'fQO'w!}O#i#Zi#j#Zi#m#Zi'p#Zi!R#Zi!S#Zi~O'x#Zi~P$NgO'x#OO~P$NgOQ#^OZ9rOj9gOu!{Ov!{Ox!|O!a9iO!b!yO!d!zO!j#^O#[9eO#]9fO#^9fO#_9fO#`9hO#a9iO#b9iO#c9iO#e9jO#g9lO#i9nO'fQO'w!}O'x#OO~O#j#Zi#m#Zi'p#Zi!R#Zi!S#Zi~P%!oO_#ky!R#ky'W#ky!O#ky!c#kyn#ky!T#ky%Q#ky!]#ky~P!)wOP;vOu(SOx(TO'w(VO'x(XO~OQ#ZiZ#Zij#Ziv#Zi!a#Zi!b#Zi!d#Zi!j#Zi#[#Zi#]#Zi#^#Zi#_#Zi#`#Zi#a#Zi#b#Zi#c#Zi#e#Zi#g#Zi#i#Zi#j#Zi#m#Zi'f#Zi'p#Zi!R#Zi!S#Zi~P%%aO!b!yOP'eXu'eXx'eX'w'eX'x'eX!S'eX~OQ'eXZ'eXj'eXv'eX!a'eX!d'eX!j'eX#['eX#]'eX#^'eX#_'eX#`'eX#a'eX#b'eX#c'eX#e'eX#g'eX#i'eX#j'eX#m'eX'f'eX'p'eX!R'eX~P%'eO#m#ni!R#ni!S#ni~P#*XO!S4eO~O!R&sa!S&sa~P#*XO!]!wO'p&oO!R&ta!c&ta~O!R-RO!c'}i~O!R-RO!]!wO!c'}i~O'a$gq!R$gq!{$gq#m$gq~P!#{O!O&va!R&va~P!BpO!]4lO~O!R-ZO!O(Oi~P!BpO!R-ZO!O(Oi~O!O4pO~O!]!wO#c4uO~Oj4vO!]!wO'p&oO~O!O4xO~O'a$iq!R$iq!{$iq#m$iq~P!#{O_$Zy!R$Zy'W$Zy!O$Zy!c$Zyn$Zy!T$Zy%Q$Zy!]$Zy~P!)wO!R2QO!T(Pa~O!T&dO%Q4}O~O!T&dO%Q4}O~P!BpO_#Oy!R#Oy'W#Oy!O#Oy!c#Oyn#Oy!T#Oy%Q#Oy!]#Oy~P!)wOZ5QO~O]5SO'])iO~O!R.^O!S(Vi~O]5VO~O^5WO~O'g'TO!R&{X!S&{X~O!R2oO!S(Sa~O!S5eO~P$7ZOx;sO'g(jO'o+iO~O!W5hO!X5gO!Y5gO!x0_O'^$dO'g(jO'o+iO~O!s5iO!t5iO~P%0^O!X5gO!Y5gO'^$dO'g(jO'o+iO~O!T.yO~O!T.yO%Q5kO~O!T.yO%Q5kO~P!BpOP5pO!T.yO!o5oO%Q5kO~OZ5uO!R'Oa!S'Oa~O!R/VO!S(Ti~O]5xO~O!c5yO~O!c5zO~O!c5{O~O!c5{O~P){O_5}O~O!]6QO~O!c6RO~O!R'ui!S'ui~P#*XO_$^O'W$^O~P!)wO_$^O!{6WO'W$^O~O_$^O!]!wO!{6WO'W$^O~O!X6]O!Y6]O'^$dO'g(jO'o+iO~O_$^O!]!wO!j6^O!{6WO'W$^O'p&oO~O!d$ZO'b$PO~P%4xO!W6_O~P%4gO!R'ry!c'ry_'ry'W'ry~P!)wO#W$gqQ$gqZ$gq_$gqj$gqv$gq!R$gq!a$gq!b$gq!d$gq!j$gq#[$gq#]$gq#^$gq#_$gq#`$gq#a$gq#b$gq#c$gq#e$gq#g$gq#i$gq#j$gq'W$gq'f$gq'p$gq!c$gq!O$gq!T$gq!{$gqn$gq%Q$gq!]$gq~P!BpO#W$iqQ$iqZ$iq_$iqj$iqv$iq!R$iq!a$iq!b$iq!d$iq!j$iq#[$iq#]$iq#^$iq#_$iq#`$iq#a$iq#b$iq#c$iq#e$iq#g$iq#i$iq#j$iq'W$iq'f$iq'p$iq!c$iq!O$iq!T$iq!{$iqn$iq%Q$iq!]$iq~P!BpO!R&li!c&li~P!)wO#m#Oq!R#Oq!S#Oq~P#*XOu-tOv-tOx-uOPra'wra'xra!Sra~OQraZrajra!ara!bra!dra!jra#[ra#]ra#^ra#_ra#`ra#ara#bra#cra#era#gra#ira#jra#mra'fra'pra!Rra~P%;OOu(SOx(TOP$^a'w$^a'x$^a!S$^a~OQ$^aZ$^aj$^av$^a!a$^a!b$^a!d$^a!j$^a#[$^a#]$^a#^$^a#_$^a#`$^a#a$^a#b$^a#c$^a#e$^a#g$^a#i$^a#j$^a#m$^a'f$^a'p$^a!R$^a~P%=SOu(SOx(TOP$`a'w$`a'x$`a!S$`a~OQ$`aZ$`aj$`av$`a!a$`a!b$`a!d$`a!j$`a#[$`a#]$`a#^$`a#_$`a#`$`a#a$`a#b$`a#c$`a#e$`a#g$`a#i$`a#j$`a#m$`a'f$`a'p$`a!R$`a~P%?WOQ$naZ$naj$nav$na!a$na!b$na!d$na!j$na#[$na#]$na#^$na#_$na#`$na#a$na#b$na#c$na#e$na#g$na#i$na#j$na#m$na'f$na'p$na!R$na!S$na~P%%aO#m$Yq!R$Yq!S$Yq~P#*XO#m$Zq!R$Zq!S$Zq~P#*XO!S6hO~O#m6iO~P!#{O!]!wO!R&ti!c&ti~O!]!wO'p&oO!R&ti!c&ti~O!R-RO!c'}q~O!O&vi!R&vi~P!BpO!R-ZO!O(Oq~O!O6oO~P!BpO!O6oO~O!R'dy'a'dy~P!#{O!R&ya!T&ya~P!BpO!T$tq_$tq!R$tq'W$tq~P!BpOZ6vO~O!R.^O!S(Vq~O]6yO~O!T&dO%Q6zO~O!T&dO%Q6zO~P!BpO!{6{O!R&{a!S&{a~O!R2oO!S(Si~P#*XO!X7RO!Y7RO'^$dO'g(jO'o+iO~O!W7TO!x4SO~P%GXO!T.yO%Q7WO~O!T.yO%Q7WO~P!BpO]7_O'g7^O~O!R/VO!S(Tq~O!c7aO~O!c7aO~P){O!c7cO~O!c7dO~O!R#Ty!S#Ty~P#*XO_$^O!{7jO'W$^O~O_$^O!]!wO!{7jO'W$^O~O!X7mO!Y7mO'^$dO'g(jO'o+iO~O_$^O!]!wO!j7nO!{7jO'W$^O'p&oO~O#m#ky!R#ky!S#ky~P#*XOQ$giZ$gij$giv$gi!a$gi!b$gi!d$gi!j$gi#[$gi#]$gi#^$gi#_$gi#`$gi#a$gi#b$gi#c$gi#e$gi#g$gi#i$gi#j$gi#m$gi'f$gi'p$gi!R$gi!S$gi~P%%aOu(SOx(TO'x(XOP$xi'w$xi!S$xi~OQ$xiZ$xij$xiv$xi!a$xi!b$xi!d$xi!j$xi#[$xi#]$xi#^$xi#_$xi#`$xi#a$xi#b$xi#c$xi#e$xi#g$xi#i$xi#j$xi#m$xi'f$xi'p$xi!R$xi~P%LjOu(SOx(TOP$zi'w$zi'x$zi!S$zi~OQ$ziZ$zij$ziv$zi!a$zi!b$zi!d$zi!j$zi#[$zi#]$zi#^$zi#_$zi#`$zi#a$zi#b$zi#c$zi#e$zi#g$zi#i$zi#j$zi#m$zi'f$zi'p$zi!R$zi~P%NnO#m$Zy!R$Zy!S$Zy~P#*XO#m#Oy!R#Oy!S#Oy~P#*XO!]!wO!R&tq!c&tq~O!R-RO!c'}y~O!O&vq!R&vq~P!BpO!O7tO~P!BpO!R.^O!S(Vy~O!R2oO!S(Sq~O!X8QO!Y8QO'^$dO'g(jO'o+iO~O!T.yO%Q8TO~O!T.yO%Q8TO~P!BpO!c8WO~O_$^O!{8]O'W$^O~O_$^O!]!wO!{8]O'W$^O~OQ$gqZ$gqj$gqv$gq!a$gq!b$gq!d$gq!j$gq#[$gq#]$gq#^$gq#_$gq#`$gq#a$gq#b$gq#c$gq#e$gq#g$gq#i$gq#j$gq#m$gq'f$gq'p$gq!R$gq!S$gq~P%%aOQ$iqZ$iqj$iqv$iq!a$iq!b$iq!d$iq!j$iq#[$iq#]$iq#^$iq#_$iq#`$iq#a$iq#b$iq#c$iq#e$iq#g$iq#i$iq#j$iq#m$iq'f$iq'p$iq!R$iq!S$iq~P%%aO'a$|!Z!R$|!Z!{$|!Z#m$|!Z~P!#{O!R&{q!S&{q~P#*XO_$^O!{8oO'W$^O~O#W$|!ZQ$|!ZZ$|!Z_$|!Zj$|!Zv$|!Z!R$|!Z!a$|!Z!b$|!Z!d$|!Z!j$|!Z#[$|!Z#]$|!Z#^$|!Z#_$|!Z#`$|!Z#a$|!Z#b$|!Z#c$|!Z#e$|!Z#g$|!Z#i$|!Z#j$|!Z'W$|!Z'f$|!Z'p$|!Z!c$|!Z!O$|!Z!T$|!Z!{$|!Zn$|!Z%Q$|!Z!]$|!Z~P!BpOP;uOu(SOx(TO'w(VO'x(XO~O!S!za!W!za!X!za!Y!za!r!za!s!za!t!za!x!za'^!za'g!za'o!za~P&,_O!W'eX!X'eX!Y'eX!r'eX!s'eX!t'eX!x'eX'^'eX'g'eX'o'eX~P%'eOQ$|!ZZ$|!Zj$|!Zv$|!Z!a$|!Z!b$|!Z!d$|!Z!j$|!Z#[$|!Z#]$|!Z#^$|!Z#_$|!Z#`$|!Z#a$|!Z#b$|!Z#c$|!Z#e$|!Z#g$|!Z#i$|!Z#j$|!Z#m$|!Z'f$|!Z'p$|!Z!R$|!Z!S$|!Z~P%%aO!Wra!Xra!Yra!rra!sra!tra!xra'^ra'gra'ora~P%;OO!W$^a!X$^a!Y$^a!r$^a!s$^a!t$^a!x$^a'^$^a'g$^a'o$^a~P%=SO!W$`a!X$`a!Y$`a!r$`a!s$`a!t$`a!x$`a'^$`a'g$`a'o$`a~P%?WO!S$na!W$na!X$na!Y$na!r$na!s$na!t$na!x$na'^$na'g$na'o$na~P&,_O!W$xi!X$xi!Y$xi!r$xi!s$xi!t$xi!x$xi'^$xi'g$xi'o$xi~P%LjO!W$zi!X$zi!Y$zi!r$zi!s$zi!t$zi!x$zi'^$zi'g$zi'o$zi~P%NnO!S$gi!W$gi!X$gi!Y$gi!r$gi!s$gi!t$gi!x$gi'^$gi'g$gi'o$gi~P&,_O!S$gq!W$gq!X$gq!Y$gq!r$gq!s$gq!t$gq!x$gq'^$gq'g$gq'o$gq~P&,_O!S$iq!W$iq!X$iq!Y$iq!r$iq!s$iq!t$iq!x$iq'^$iq'g$iq'o$iq~P&,_O!S$|!Z!W$|!Z!X$|!Z!Y$|!Z!r$|!Z!s$|!Z!t$|!Z!x$|!Z'^$|!Z'g$|!Z'o$|!Z~P&,_On'hX~P.jOn[X!O[X!c[X%r[X!T[X%Q[X!][X~P$zO!]dX!c[X!cdX'pdX~P;dOQ9^OR9^O]cOb;`Oc!jOhcOj9^OkcOlcOq9^Os9^OxRO{cO|cO}cO!TSO!_9`O!dUO!g9^O!h9^O!i9^O!j9^O!k9^O!n!iO#t!lO#x^O']'cO'fQO'oYO'|;^O~O]#qOh$QOj#rOk#qOl#qOq$ROs9uOx#yO!T#zO!_;fO!d#vO#V:OO#t$VO$_9xO$a9{O$d$WO']&{O'b$PO'f#sO~O!R9pO!S$]a~O]#qOh$QOj#rOk#qOl#qOq$ROs9vOx#yO!T#zO!_;gO!d#vO#V:PO#t$VO$_9yO$a9|O$d$WO']&{O'b$PO'f#sO~O#d'jO~P&<WO!S[X!SdX~P;dO!]9dO~O#W9cO~O!]!wO#W9cO~O!{9sO~O#c9iO~O!{:QO!R'uX!S'uX~O!{9sO!R'sX!S'sX~O#W:RO~O'a:TO~P!#{O#W:[O~O#W:]O~O#W:^O~O!]!wO#W:_O~O!]!wO#W:RO~O#m:`O~P#*XO#W:aO~O#W:bO~O#W:cO~O#W:dO~O#W:eO~O#W:fO~O#W:gO~O#W:hO~O!O:iO~O#m:jO~P!#{O#m:kO~P!#{O#m:lO~P!#{O!O:mO~P!BpO!O:mO~O!O:nO~P!BpO!]!wO#c;lO~O!]!wO#c;nO~O#x~!b!r!t!u#U#V'|$_$a$d$u%P%Q%R%X%Z%^%_%a%c~UT#x'|#]}'Y'Z#z'Y']'g~",
  goto: "#Kk(ZPPPPPPPP([P(lP*`PPPP-zPP.a3s7o8SP8SPPP8SP:U8SP8SP:YPP:`P:t?VPPPP?ZPPPP?ZA{PPPBRDdP?ZPFwPPPPHp?ZPPPPPJi?ZPPMjNgPPPPNk!!TP!!]!#^PNg?Z?Z!&n!)i!.[!.[!1kPPP!1r!4h?ZPPPPPPPPPP!7_P!8pPP?Z!9}P?ZP?Z?Z?Z?ZP?Z!;dPP!>]P!AQ!AY!A^!A^P!>YP!Ab!AbP!DVP!DZ?Z?Z!Da!GT8SP8SP8S8SP!HW8S8S!Jf8S!M_8S# g8S8S#!T#$c#$c#$g#$c#$oP#$cP8S#%k8S#'X8S8S-zPPP#(yPP#)c#)cP#)cP#)x#)cPP#*OP#)uP#)u#*b!!X#)u#+P#+V#+Y([#+]([P#+d#+d#+dP([P([P([P([PP([P#+j#+mP#+m([P#+qP#+tP([P([P([P([P([P([([#+z#,U#,[#,b#,p#,v#,|#-W#-^#-m#-s#.R#.X#._#.m#/S#0z#1Y#1`#1f#1l#1r#1|#2S#2Y#2d#2v#2|PPPPPPPP#3SPP#3v#7OPP#8f#8m#8uPP#>a#@t#Fp#Fs#Fv#GR#GUPP#GX#G]#Gz#Hq#Hu#IZPP#I_#Ie#IiP#Il#Ip#Is#Jc#Jy#KO#KR#KU#K[#K_#Kc#KgmhOSj}!n$]%c%f%g%i*o*t/g/jQ$imQ$ppQ%ZyS&V!b+`Q&k!jS(l#z(qQ)g$jQ)t$rQ*`%TQ+f&^S+k&d+mQ+}&lQ-k(sQ/U*aY0Z+o+p+q+r+sS2t.y2vU3|0[0^0aU5g2y2z2{S6]4O4RS7R5h5iQ7m6_R8Q7T$p[ORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$]$n%[%_%c%e%f%g%i%m%x%z&S&_&f&p&}'R(R)V)^*k*o*t+T+x,P,b,h-u-z.S.].|/_/`/a/c/g/j/l0T0j0t2i3R3f3h3i3x5o5}6W7j8]8o!j'e#]#k&W'w+X+[,m/{1X2q3q6{9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aQ(}$SQ)l$lQ*b%WQ*i%`Q,X9tQ.W)aQ.c)mQ/^*gQ2_.^Q3Z/VQ4^9vQ5S2`R8{9upeOSjy}!n$]%Y%c%f%g%i*o*t/g/jR*d%[&WVOSTjkn}!S!W!k!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$]$n%[%_%`%c%e%f%g%i%m%z&S&_&f&p&}'R'w(R)V)^*k*o*t+T+X+[+x,P,b,h,m-u-z.S.].|/_/`/a/c/g/j/l/{0T0j0t1X2i2q3R3f3h3i3q3x5o5}6W6{7j8]8o9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;`;a[!cRU!]!`%x&WQ$clQ$hmS$mp$rv$wrs!r!u$Z$u&`&t&w)x)y)z*m+Y+h,S,U/o0lQ%PwQ&h!iQ&j!jS(_#v(cS)f$i$jQ)j$lQ)w$tQ*Z%RQ*_%TS+|&k&lQ-V(`Q.[)gQ.b)mQ.d)nQ.g)rQ/P*[S/T*`*aQ0h+}Q1b-RQ2^.^Q2b.aQ2g.iQ3Y/UQ4i1cQ5R2`Q5U2dQ6u5QR7w6vx#xa!y$T$U$Y(W(Y(b(w(x,_-Y-w1a1y6i;^;i;j;k!Y$fm!j$h$i$j&U&j&k&l(k)f)g+]+j+|+}-d.[0Q0W0]0h1u3{4Q6Z7k8^Q)`$cQ*P$|Q*S$}Q*^%TQ.k)wQ/O*ZU/S*_*`*aQ3T/PS3X/T/UQ5b2sQ5t3YS7P5c5fS8O7Q7SQ8f8PQ8u8g#[;b!w#d#v#y&g'}(Z(h)])_)a*O*R+y-Z-].R.T.p.s.{.}1k1s2Q2T2X2j3Q3S4l4u4}5k5p6z7W8T9w9z9}:U:X:[:a:d:j;l;n;t;u;vd;c9d9x9{:O:V:Y:]:b:e:ke;d9r9y9|:P:W:Z:^:c:f:lW#}a$P(y;^S$|t%YQ$}uQ%OvR)}$z%P#|a!w!y#d#v#y$T$U$Y&g'}(W(Y(Z(b(h(w(x)])_)a*O*R+y,_-Y-Z-]-w.R.T.p.s.{.}1a1k1s1y2Q2T2X2j3Q3S4l4u4}5k5p6i6z7W8T9d9r9w9x9y9z9{9|9}:O:P:U:V:W:X:Y:Z:[:]:^:a:b:c:d:e:f:j:k:l;^;i;j;k;l;n;t;u;vT(O#s(PX)O$S9t9u9vU&Z!b$v+cQ'U!{Q)q$oQ.t*TQ1z-tR5^2o&^cORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$]$n%[%_%`%c%e%f%g%i%m%x%z&S&W&_&f&p&}'R'w(R)V)^*k*o*t+T+X+[+x,P,b,h,m-u-z.S.].|/_/`/a/c/g/j/l/{0T0j0t1X2i2q3R3f3h3i3q3x5o5}6W6{7j8]8o9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;a$]#aZ!_!o$a%w%}&y'Q'W'X'Y'Z'[']'^'_'`'a'b'd'g'k'u)p+R+^+g,O,^,d,g,i,w-x/v/y0i0s0w0x0y0z0{0|0}1O1P1Q1R1S1T1W1]2O2[3s3v4W4[4]4b4c5`6S6V6b6f6g7g7z8Z8m8y9_:|T!XQ!Y&_cORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$]$n%[%_%`%c%e%f%g%i%m%x%z&S&W&_&f&p&}'R'w(R)V)^*k*o*t+T+X+[+x,P,b,h,m-u-z.S.].|/_/`/a/c/g/j/l/{0T0j0t1X2i2q3R3f3h3i3q3x5o5}6W6{7j8]8o9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aQ&X!bR/|+`Y&R!b&V&^+`+fS(k#z(qS+j&d+mS-d(l(sQ-e(mQ-l(tQ.v*VU0W+k+o+pU0]+q+r+sS0b+t2xQ1u-kQ1w-mQ1x-nS2s.y2vU3{0Z0[0^Q4P0_Q4Q0aS5c2t2{S5f2y2zU6Z3|4O4RQ6`4SS7Q5g5hQ7S5iS7k6]6_S8P7R7TQ8^7mQ8g8QQ;h;oR;m;slhOSj}!n$]%c%f%g%i*o*t/g/jQ%k!QS&x!v9cQ)d$gQ*X%PQ*Y%QQ+z&iS,]&}:RS-y)V:_Q.Y)eQ.x*WQ/n*vQ/p*wQ/x+ZQ0`+qQ0f+{S2P-z:gQ2Y.ZS2].]:hQ3r/zQ3u0RQ4U0gQ5P2ZQ6T3tQ6X3zQ6a4VQ7e6RQ7h6YQ8Y7iQ8l8[R8x8n$W#`Z!_!o%w%}&y'Q'W'X'Y'Z'[']'^'_'`'a'b'd'g'k'u)p+R+^+g,O,^,d,g,w-x/v/y0i0s0w0x0y0z0{0|0}1O1P1Q1R1S1T1W1]2O2[3s3v4W4[4]4b4c5`6S6V6b6f6g7g7z8Z8m8y9_:|W(v#{&|1V8qT)Z$a,i$W#_Z!_!o%w%}&y'Q'W'X'Y'Z'[']'^'_'`'a'b'd'g'k'u)p+R+^+g,O,^,d,g,w-x/v/y0i0s0w0x0y0z0{0|0}1O1P1Q1R1S1T1W1]2O2[3s3v4W4[4]4b4c5`6S6V6b6f6g7g7z8Z8m8y9_:|Q'f#`S)Y$a,iR-{)Z&^cORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$]$n%[%_%`%c%e%f%g%i%m%x%z&S&W&_&f&p&}'R'w(R)V)^*k*o*t+T+X+[+x,P,b,h,m-u-z.S.].|/_/`/a/c/g/j/l/{0T0j0t1X2i2q3R3f3h3i3q3x5o5}6W6{7j8]8o9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aQ%f{Q%g|Q%i!OQ%j!PR/f*rQ&e!iQ)[$cQ+w&hS.Q)`)wS0c+u+vW2S-}.O.P.kS4T0d0eU4|2U2V2WU6s4{5Y5ZQ7v6tR8b7yT+l&d+mS+j&d+mU0W+k+o+pU0]+q+r+sS0b+t2xS2s.y2vU3{0Z0[0^Q4P0_Q4Q0aS5c2t2{S5f2y2zU6Z3|4O4RQ6`4SS7Q5g5hQ7S5iS7k6]6_S8P7R7TQ8^7mR8g8QS+l&d+mT2u.y2vS&r!q/dQ-U(_Q-b(kS0V+j2sQ1g-VS1p-c-lU3}0]0b5fQ4h1bS4s1v1xU6^4P4Q7SQ6k4iQ6r4vR7n6`Q!xXS&q!q/dQ)W$[Q)b$eQ)h$kQ,Q&rQ-T(_Q-a(kQ-f(nQ.X)cQ/Q*]S0U+j2sS1f-U-VS1o-b-lQ1r-eQ1t-gQ3V/RW3y0V0]0b5fQ4g1bQ4k1gS4o1p1xQ4t1wQ5r3WW6[3}4P4Q7SS6j4h4iS6n4p:iQ6p4sQ6}5aQ7[5sS7l6^6`Q7r6kS7s6o:mQ7u6rQ7|7OQ8V7]Q8_7nS8a7t:nQ8d7}Q8s8eQ9Q8tQ9X9RQ:u:pQ;T:zQ;U:{Q;V;hR;[;m$rWORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$]$n%[%_%`%c%e%f%g%i%m%x%z&S&_&f&p&}'R(R)V)^*k*o*t+T+x,P,b,h-u-z.S.].|/_/`/a/c/g/j/l0T0j0t2i3R3f3h3i3x5o5}6W7j8]8oS!xn!k!j:o#]#k&W'w+X+[,m/{1X2q3q6{9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aR:u;`$rXORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$]$n%[%_%`%c%e%f%g%i%m%x%z&S&_&f&p&}'R(R)V)^*k*o*t+T+x,P,b,h-u-z.S.].|/_/`/a/c/g/j/l0T0j0t2i3R3f3h3i3x5o5}6W7j8]8oQ$[b!Y$em!j$h$i$j&U&j&k&l(k)f)g+]+j+|+}-d.[0Q0W0]0h1u3{4Q6Z7k8^S$kn!kQ)c$fQ*]%TW/R*^*_*`*aU3W/S/T/UQ5a2sS5s3X3YU7O5b5c5fQ7]5tU7}7P7Q7SS8e8O8PS8t8f8gQ9R8u!j:p#]#k&W'w+X+[,m/{1X2q3q6{9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aQ:z;_R:{;`$f]OSTjk}!S!W!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$]$n%[%_%c%e%f%g%i%m%z&S&_&f&p&}'R(R)V)^*k*o*t+T+x,P,b,h-u-z.S.].|/_/`/a/c/g/j/l0T0j0t2i3R3f3h3i3x5o5}6W7j8]8oY!hRU!]!`%xv$wrs!r!u$Z$u&`&t&w)x)y)z*m+Y+h,S,U/o0lQ*j%`!h:q#]#k'w+X+[,m/{1X2q3q6{9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aR:t&WS&[!b$vR0O+c$p[ORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$]$n%[%_%c%e%f%g%i%m%x%z&S&_&f&p&}'R(R)V)^*k*o*t+T+x,P,b,h-u-z.S.].|/_/`/a/c/g/j/l0T0j0t2i3R3f3h3i3x5o5}6W7j8]8o!j'e#]#k&W'w+X+[,m/{1X2q3q6{9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aR*i%`$roORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$]$n%[%_%`%c%e%f%g%i%m%x%z&S&_&f&p&}'R(R)V)^*k*o*t+T+x,P,b,h-u-z.S.].|/_/`/a/c/g/j/l0T0j0t2i3R3f3h3i3x5o5}6W7j8]8oQ'U!{!k:r#]#k&W'w+X+[,m/{1X2q3q6{9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;a!h#VZ!_$a%w%}&y'Q'_'`'a'b'g'k)p+R+g,O,^,d,w-x0i0s1T2O2[3v4W4[6V7g8Z8m8y9_!R9k'd'u+^,i/v/y0w1P1Q1R1S1W1]3s4]4b4c5`6S6b6f6g7z:|!d#XZ!_$a%w%}&y'Q'a'b'g'k)p+R+g,O,^,d,w-x0i0s1T2O2[3v4W4[6V7g8Z8m8y9_}9m'd'u+^,i/v/y0w1R1S1W1]3s4]4b4c5`6S6b6f6g7z:|!`#]Z!_$a%w%}&y'Q'g'k)p+R+g,O,^,d,w-x0i0s1T2O2[3v4W4[6V7g8Z8m8y9_Q1a-Px;a'd'u+^,i/v/y0w1W1]3s4]4b4c5`6S6b6f6g7z:|Q;i;pQ;j;qR;k;r&^cORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k$]$n%[%_%`%c%e%f%g%i%m%x%z&S&W&_&f&p&}'R'w(R)V)^*k*o*t+T+X+[+x,P,b,h,m-u-z.S.].|/_/`/a/c/g/j/l/{0T0j0t1X2i2q3R3f3h3i3q3x5o5}6W6{7j8]8o9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aS#l`#mR1Y,l&e_ORSTU`jk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k#m$]$n%[%_%`%c%e%f%g%i%m%x%z&S&W&_&f&p&}'R'w(R)V)^*k*o*t+T+X+[+x,P,b,h,l,m-u-z.S.].|/_/`/a/c/g/j/l/{0T0j0t1X2i2q3R3f3h3i3q3x5o5}6W6{7j8]8o9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aS#g^#nT'n#i'rT#h^#nT'p#i'r&e`ORSTU`jk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#]#b#e#k#m$]$n%[%_%`%c%e%f%g%i%m%x%z&S&W&_&f&p&}'R'w(R)V)^*k*o*t+T+X+[+x,P,b,h,l,m-u-z.S.].|/_/`/a/c/g/j/l/{0T0j0t1X2i2q3R3f3h3i3q3x5o5}6W6{7j8]8o9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;aT#l`#mQ#o`R'y#m$rbORSTUjk}!S!W!]!`!n!v!z!|#P#Q#R#S#T#U#V#W#X#Y#Z#b#e$]$n%[%_%`%c%e%f%g%i%m%x%z&S&_&f&p&}'R(R)V)^*k*o*t+T+x,P,b,h-u-z.S.].|/_/`/a/c/g/j/l0T0j0t2i3R3f3h3i3x5o5}6W7j8]8o!k;_#]#k&W'w+X+[,m/{1X2q3q6{9^9`9c9e9f9g9h9i9j9k9l9m9n9o9p9s:Q:R:T:_:`:g:h;a#RdOSUj}!S!W!n!|#k$]%[%_%`%c%e%f%g%i%m&S&f'w)^*k*o*t+x,m-u.S.|/_/`/a/c/g/j/l1X2i3R3f3h3i5o5}x#{a!y$T$U$Y(W(Y(b(w(x,_-Y-w1a1y6i;^;i;j;k#[&|!w#d#v#y&g'}(Z(h)])_)a*O*R+y-Z-].R.T.p.s.{.}1k1s2Q2T2X2j3Q3S4l4u4}5k5p6z7W8T9w9z9}:U:X:[:a:d:j;l;n;t;u;vQ)S$WQ,x(Sd1V9r9y9|:P:W:Z:^:c:f:le8q9d9x9{:O:V:Y:]:b:e:kx#wa!y$T$U$Y(W(Y(b(w(x,_-Y-w1a1y6i;^;i;j;kQ(d#xS(n#z(qQ)T$XQ-g(o#[:w!w#d#v#y&g'}(Z(h)])_)a*O*R+y-Z-].R.T.p.s.{.}1k1s2Q2T2X2j3Q3S4l4u4}5k5p6z7W8T9w9z9}:U:X:[:a:d:j;l;n;t;u;vd:x9d9x9{:O:V:Y:]:b:e:kd:y9r9y9|:P:W:Z:^:c:f:lQ:};bQ;O;cQ;P;dQ;Q;eQ;R;fR;S;gx#{a!y$T$U$Y(W(Y(b(w(x,_-Y-w1a1y6i;^;i;j;k#[&|!w#d#v#y&g'}(Z(h)])_)a*O*R+y-Z-].R.T.p.s.{.}1k1s2Q2T2X2j3Q3S4l4u4}5k5p6z7W8T9w9z9}:U:X:[:a:d:j;l;n;t;u;vd1V9r9y9|:P:W:Z:^:c:f:le8q9d9x9{:O:V:Y:]:b:e:klfOSj}!n$]%c%f%g%i*o*t/g/jQ(g#yQ*}%pQ+O%rR1j-Z%O#|a!w!y#d#v#y$T$U$Y&g'}(W(Y(Z(b(h(w(x)])_)a*O*R+y,_-Y-Z-]-w.R.T.p.s.{.}1a1k1s1y2Q2T2X2j3Q3S4l4u4}5k5p6i6z7W8T9d9r9w9x9y9z9{9|9}:O:P:U:V:W:X:Y:Z:[:]:^:a:b:c:d:e:f:j:k:l;^;i;j;k;l;n;t;u;vQ*Q$}Q.r*SQ2m.qR5]2nT(p#z(qS(p#z(qT2u.y2vQ)b$eQ-f(nQ.X)cQ/Q*]Q3V/RQ5r3WQ6}5aQ7[5sQ7|7OQ8V7]Q8d7}Q8s8eQ9Q8tR9X9Rp(W#t'O)U-X-o-p0q1h1}4f4w7q:v;W;X;Y!n:U&z'i(^(f+v,[,t-P-^-|.P.o.q0e0p1i1m2W2l2n3O4Y4Z4m4q4y5O5Z5n6m6q7Y8`;Z;];p;q;r[:V8p9O9V9Y9Z9]]:W1U4a6c7o7p8zr(Y#t'O)U,}-X-o-p0q1h1}4f4w7q:v;W;X;Y!p:X&z'i(^(f+v,[,t-P-^-|.P.o.q0e0n0p1i1m2W2l2n3O4Y4Z4m4q4y5O5Z5n6m6q7Y8`;Z;];p;q;r^:Y8p9O9T9V9Y9Z9]_:Z1U4a6c6d7o7p8zpeOSjy}!n$]%Y%c%f%g%i*o*t/g/jQ%VxR*k%`peOSjy}!n$]%Y%c%f%g%i*o*t/g/jR%VxQ*U%OR.n)}qeOSjy}!n$]%Y%c%f%g%i*o*t/g/jQ.z*ZS3P/O/PW5j2|2}3O3TU7V5l5m5nU8R7U7X7YQ8h8SR8v8iQ%^yR*e%YR3^/XR7_5uS$mp$rR.d)nQ%czR*o%dR*u%jT/h*t/jR*y%kQ*x%kR/q*yQjOQ!nST$`j!nQ(P#sR,u(PQ!YQR%u!YQ!^RU%{!^%|+UQ%|!_R+U%}Q+a&XR/}+aQ,`'OR0r,`Q,c'QS0u,c0vR0v,dQ+m&dR0X+mS!eR$uU&a!e&b+VQ&b!fR+V&OQ+d&[R0P+dQ&u!sQ,R&sU,V&u,R0mR0m,WQ'r#iR,n'rQ#m`R'x#mQ#cZU'h#c+Q9qQ+Q9_R9q'uQ-S(_W1d-S1e4j6lU1e-T-U-VS4j1f1gR6l4k$k(U#t&z'O'i(^(f)P)Q)U+v,Y,Z,[,t,}-O-P-X-^-o-p-|.P.o.q0e0n0o0p0q1U1h1i1m1}2W2l2n3O4Y4Z4_4`4a4f4m4q4w4y5O5Z5n6c6d6e6m6q7Y7o7p7q8`8p8z8|8}9O9T9U9V9Y9Z9]:v;W;X;Y;Z;];p;q;rQ-[(fU1l-[1n4nQ1n-^R4n1mQ(q#zR-i(qQ(z$OR-r(zQ2R-|R4z2RQ){$xR.m){Q2p.tS5_2p6|R6|5`Q*W%PR.w*WQ2v.yR5d2vQ/W*bS3[/W5vR5v3^Q._)jW2a._2c5T6wQ2c.bQ5T2bR6w5UQ)o$mR.e)oQ/j*tR3l/jWiOSj!nQ%h}Q)X$]Q*n%cQ*p%fQ*q%gQ*s%iQ/e*oS/h*t/jR3k/gQ$_gQ%l!RQ%o!TQ%q!UQ%s!VQ)v$sQ)|$yQ*d%^Q*{%nQ-h(pS/Z*e*hQ/r*zQ/s*}Q/t+OS0S+j2sQ2f.hQ2k.oQ3U/QQ3`/]Q3j/fY3w0U0V0]0b5fQ5X2hQ5[2lQ5q3VQ5w3_[6U3v3y3}4P4Q7SQ6x5VQ7Z5rQ7`5xW7f6V6[6^6`Q7x6yQ7{6}Q8U7[U8X7g7l7nQ8c7|Q8j8VS8k8Z8_Q8r8dQ8w8mQ9P8sQ9S8yQ9W9QR9[9XQ$gmQ&i!jU)e$h$i$jQ+Z&UU+{&j&k&lQ-`(kS.Z)f)gQ/z+]Q0R+jS0g+|+}Q1q-dQ2Z.[Q3t0QS3z0W0]Q4V0hQ4r1uS6Y3{4QQ7i6ZQ8[7kR8n8^S#ua;^R({$PU$Oa$P;^R-q(yQ#taS&z!w)aQ'O!yQ'i#dQ(^#vQ(f#yQ)P$TQ)Q$UQ)U$YQ+v&gQ,Y9wQ,Z9zQ,[9}Q,t'}Q,}(WQ-O(YQ-P(ZQ-X(bQ-^(hQ-o(wQ-p(xd-|)].R.{2T3Q4}5k6z7W8TQ.P)_Q.o*OQ.q*RQ0e+yQ0n:UQ0o:XQ0p:[Q0q,_Q1U9rQ1h-YQ1i-ZQ1m-]Q1}-wQ2W.TQ2l.pQ2n.sQ3O.}Q4Y:aQ4Z:dQ4_9yQ4`9|Q4a:PQ4f1aQ4m1kQ4q1sQ4w1yQ4y2QQ5O2XQ5Z2jQ5n3SQ6c:^Q6d:WQ6e:ZQ6m4lQ6q4uQ7Y5pQ7o:cQ7p:fQ7q6iQ8`:jQ8p9dQ8z:lQ8|9xQ8}9{Q9O:OQ9T:VQ9U:YQ9V:]Q9Y:bQ9Z:eQ9]:kQ:v;^Q;W;iQ;X;jQ;Y;kQ;Z;lQ;];nQ;p;tQ;q;uR;r;vlgOSj}!n$]%c%f%g%i*o*t/g/jS!pU%eQ%n!SQ%t!WQ'V!|Q'v#kS*h%[%_Q*l%`Q*z%mQ+W&SQ+u&fQ,r'wQ.O)^Q/b*kQ0d+xQ1[,mQ1{-uQ2V.SQ2}.|Q3b/_Q3c/`Q3e/aQ3g/cQ3n/lQ4d1XQ5Y2iQ5m3RQ5|3fQ6O3hQ6P3iQ7X5oR7b5}!vZOSUj}!S!n!|$]%[%_%`%c%e%f%g%i%m&S&f)^*k*o*t+x-u.S.|/_/`/a/c/g/j/l2i3R3f3h3i5o5}Q!_RQ!oTQ$akS%w!]%zQ%}!`Q&y!vQ'Q!zQ'W#PQ'X#QQ'Y#RQ'Z#SQ'[#TQ']#UQ'^#VQ'_#WQ'`#XQ'a#YQ'b#ZQ'd#]Q'g#bQ'k#eW'u#k'w,m1XQ)p$nS+R%x+TS+^&W/{Q+g&_Q,O&pQ,^&}Q,d'RQ,g9^Q,i9`Q,w(RQ-x)VQ/v+XQ/y+[Q0i,PQ0s,bQ0w9cQ0x9eQ0y9fQ0z9gQ0{9hQ0|9iQ0}9jQ1O9kQ1P9lQ1Q9mQ1R9nQ1S9oQ1T,hQ1W9sQ1]9pQ2O-zQ2[.]Q3s:QQ3v0TQ4W0jQ4[0tQ4]:RQ4b:TQ4c:_Q5`2qQ6S3qQ6V3xQ6b:`Q6f:gQ6g:hQ7g6WQ7z6{Q8Z7jQ8m8]Q8y8oQ9_!WR:|;aR!aRR&Y!bS&U!b+`S+]&V&^R0Q+fR'P!yR'S!zT!tU$ZS!sU$ZU$xrs*mS&s!r!uQ,T&tQ,W&wQ.l)zS0k,S,UR4X0l`!dR!]!`$u%x&`)x+hh!qUrs!r!u$Z&t&w)z,S,U0lQ/d*mQ/w+YQ3p/oT:s&W)yT!gR$uS!fR$uS%y!]&`S&O!`)xS+S%x+hT+_&W)yT&]!b$vQ#i^R'{#nT'q#i'rR1Z,lT(a#v(cR(i#yQ-})]Q2U.RQ2|.{Q4{2TQ5l3QQ6t4}Q7U5kQ7y6zQ8S7WR8i8TlhOSj}!n$]%c%f%g%i*o*t/g/jQ%]yR*d%YV$yrs*mR.u*TR*c%WQ$qpR)u$rR)k$lT%az%dT%bz%dT/i*t/j",
  nodeNames: "\u26A0 extends ArithOp ArithOp InterpolationStart LineComment BlockComment Script ExportDeclaration export Star as VariableName String from ; default FunctionDeclaration async function VariableDefinition TypeParamList TypeDefinition ThisType this LiteralType ArithOp Number BooleanLiteral TemplateType InterpolationEnd Interpolation VoidType void TypeofType typeof MemberExpression . ?. PropertyName [ TemplateString Interpolation null super RegExp ] ArrayExpression Spread , } { ObjectExpression Property async get set PropertyDefinition Block : NewExpression new TypeArgList CompareOp < ) ( ArgList UnaryExpression await yield delete LogicOp BitOp ParenthesizedExpression ClassExpression class extends ClassBody MethodDeclaration Privacy static abstract override PrivatePropertyDefinition PropertyDeclaration readonly Optional TypeAnnotation Equals StaticBlock FunctionExpression ArrowFunction ParamList ParamList ArrayPattern ObjectPattern PatternProperty Privacy readonly Arrow MemberExpression PrivatePropertyName BinaryExpression ArithOp ArithOp ArithOp ArithOp BitOp CompareOp instanceof in const CompareOp BitOp BitOp BitOp LogicOp LogicOp ConditionalExpression LogicOp LogicOp AssignmentExpression UpdateOp PostfixExpression CallExpression TaggedTemplateExpression DynamicImport import ImportMeta JSXElement JSXSelfCloseEndTag JSXStartTag JSXSelfClosingTag JSXIdentifier JSXNamespacedName JSXMemberExpression JSXSpreadAttribute JSXAttribute JSXAttributeValue JSXEscape JSXEndTag JSXOpenTag JSXFragmentTag JSXText JSXEscape JSXStartCloseTag JSXCloseTag PrefixCast ArrowFunction TypeParamList SequenceExpression KeyofType keyof UniqueType unique ImportType InferredType infer TypeName ParenthesizedType FunctionSignature ParamList NewSignature IndexedType TupleType Label ArrayType ReadonlyType ObjectType MethodType PropertyType IndexSignature CallSignature TypePredicate is NewSignature new UnionType LogicOp IntersectionType LogicOp ConditionalType ParameterizedType ClassDeclaration abstract implements type VariableDeclaration let var TypeAliasDeclaration InterfaceDeclaration interface EnumDeclaration enum EnumBody NamespaceDeclaration namespace module AmbientDeclaration declare GlobalDeclaration global ClassDeclaration ClassBody MethodDeclaration AmbientFunctionDeclaration ExportGroup VariableName VariableName ImportDeclaration ImportGroup ForStatement for ForSpec ForInSpec ForOfSpec of WhileStatement while WithStatement with DoStatement do IfStatement if else SwitchStatement switch SwitchBody CaseLabel case DefaultLabel TryStatement try CatchClause catch FinallyClause finally ReturnStatement return ThrowStatement throw BreakStatement break ContinueStatement continue DebuggerStatement debugger LabeledStatement ExpressionStatement",
  maxTerm: 332,
  context: wd,
  nodeProps: [
    ["closedBy", 4, "InterpolationEnd", 40, "]", 51, "}", 66, ")", 132, "JSXSelfCloseEndTag JSXEndTag", 146, "JSXEndTag"],
    ["group", -26, 8, 15, 17, 58, 184, 188, 191, 192, 194, 197, 200, 211, 213, 219, 221, 223, 225, 228, 234, 240, 242, 244, 246, 248, 250, 251, "Statement", -30, 12, 13, 24, 27, 28, 41, 43, 44, 45, 47, 52, 60, 68, 74, 75, 91, 92, 101, 103, 119, 122, 124, 125, 126, 127, 129, 130, 148, 149, 151, "Expression", -22, 23, 25, 29, 32, 34, 152, 154, 156, 157, 159, 160, 161, 163, 164, 165, 167, 168, 169, 178, 180, 182, 183, "Type", -3, 79, 85, 90, "ClassItem"],
    ["openedBy", 30, "InterpolationStart", 46, "[", 50, "{", 65, "(", 131, "JSXStartTag", 141, "JSXStartTag JSXStartCloseTag"]
  ],
  propSources: [Ad],
  skippedNodes: [0, 5, 6],
  repeatNodeCount: 28,
  tokenData: "!C}~R!`OX%TXY%cYZ'RZ[%c[]%T]^'R^p%Tpq%cqr'crs(kst0htu2`uv4pvw5ewx6cxy<yyz=Zz{=k{|>k|}?O}!O>k!O!P?`!P!QCl!Q!R!0[!R![!1q![!]!7s!]!^!8V!^!_!8g!_!`!9d!`!a!:[!a!b!<R!b!c%T!c!}2`!}#O!=d#O#P%T#P#Q!=t#Q#R!>U#R#S2`#S#T!>i#T#o2`#o#p!>y#p#q!?O#q#r!?f#r#s!?x#s$f%T$f$g%c$g#BY2`#BY#BZ!@Y#BZ$IS2`$IS$I_!@Y$I_$I|2`$I|$I}!Bq$I}$JO!Bq$JO$JT2`$JT$JU!@Y$JU$KV2`$KV$KW!@Y$KW&FU2`&FU&FV!@Y&FV?HT2`?HT?HU!@Y?HU~2`W%YR$UWO!^%T!_#o%T#p~%T7Z%jg$UW'Y7ROX%TXY%cYZ%TZ[%c[p%Tpq%cq!^%T!_#o%T#p$f%T$f$g%c$g#BY%T#BY#BZ%c#BZ$IS%T$IS$I_%c$I_$JT%T$JT$JU%c$JU$KV%T$KV$KW%c$KW&FU%T&FU&FV%c&FV?HT%T?HT?HU%c?HU~%T7Z'YR$UW'Z7RO!^%T!_#o%T#p~%T$T'jS$UW!j#{O!^%T!_!`'v!`#o%T#p~%T$O'}S#e#v$UWO!^%T!_!`(Z!`#o%T#p~%T$O(bR#e#v$UWO!^%T!_#o%T#p~%T)X(rZ$UW]#eOY(kYZ)eZr(krs*rs!^(k!^!_+U!_#O(k#O#P-b#P#o(k#o#p+U#p~(k&r)jV$UWOr)ers*Ps!^)e!^!_*a!_#o)e#o#p*a#p~)e&r*WR$P&j$UWO!^%T!_#o%T#p~%T&j*dROr*ars*ms~*a&j*rO$P&j)X*{R$P&j$UW]#eO!^%T!_#o%T#p~%T)P+ZV]#eOY+UYZ*aZr+Urs+ps#O+U#O#P+w#P~+U)P+wO$P&j]#e)P+zROr+Urs,Ts~+U)P,[U$P&j]#eOY,nZr,nrs-Vs#O,n#O#P-[#P~,n#e,sU]#eOY,nZr,nrs-Vs#O,n#O#P-[#P~,n#e-[O]#e#e-_PO~,n)X-gV$UWOr(krs-|s!^(k!^!_+U!_#o(k#o#p+U#p~(k)X.VZ$P&j$UW]#eOY.xYZ%TZr.xrs/rs!^.x!^!_,n!_#O.x#O#P0S#P#o.x#o#p,n#p~.x#m/PZ$UW]#eOY.xYZ%TZr.xrs/rs!^.x!^!_,n!_#O.x#O#P0S#P#o.x#o#p,n#p~.x#m/yR$UW]#eO!^%T!_#o%T#p~%T#m0XT$UWO!^.x!^!_,n!_#o.x#o#p,n#p~.x3]0mZ$UWOt%Ttu1`u!^%T!_!c%T!c!}1`!}#R%T#R#S1`#S#T%T#T#o1`#p$g%T$g~1`3]1g]$UW'o3TOt%Ttu1`u!Q%T!Q![1`![!^%T!_!c%T!c!}1`!}#R%T#R#S1`#S#T%T#T#o1`#p$g%T$g~1`7Z2k_$UW#zS']$y'g3SOt%Ttu2`u}%T}!O3j!O!Q%T!Q![2`![!^%T!_!c%T!c!}2`!}#R%T#R#S2`#S#T%T#T#o2`#p$g%T$g~2`[3q_$UW#zSOt%Ttu3ju}%T}!O3j!O!Q%T!Q![3j![!^%T!_!c%T!c!}3j!}#R%T#R#S3j#S#T%T#T#o3j#p$g%T$g~3j$O4wS#^#v$UWO!^%T!_!`5T!`#o%T#p~%T$O5[R$UW#o#vO!^%T!_#o%T#p~%T5b5lU'x5Y$UWOv%Tvw6Ow!^%T!_!`5T!`#o%T#p~%T$O6VS$UW#i#vO!^%T!_!`5T!`#o%T#p~%T)X6jZ$UW]#eOY6cYZ7]Zw6cwx*rx!^6c!^!_8T!_#O6c#O#P:T#P#o6c#o#p8T#p~6c&r7bV$UWOw7]wx*Px!^7]!^!_7w!_#o7]#o#p7w#p~7]&j7zROw7wwx*mx~7w)P8YV]#eOY8TYZ7wZw8Twx+px#O8T#O#P8o#P~8T)P8rROw8Twx8{x~8T)P9SU$P&j]#eOY9fZw9fwx-Vx#O9f#O#P9}#P~9f#e9kU]#eOY9fZw9fwx-Vx#O9f#O#P9}#P~9f#e:QPO~9f)X:YV$UWOw6cwx:ox!^6c!^!_8T!_#o6c#o#p8T#p~6c)X:xZ$P&j$UW]#eOY;kYZ%TZw;kwx/rx!^;k!^!_9f!_#O;k#O#P<e#P#o;k#o#p9f#p~;k#m;rZ$UW]#eOY;kYZ%TZw;kwx/rx!^;k!^!_9f!_#O;k#O#P<e#P#o;k#o#p9f#p~;k#m<jT$UWO!^;k!^!_9f!_#o;k#o#p9f#p~;k&i=QR!d&a$UWO!^%T!_#o%T#p~%Tk=bR!cc$UWO!^%T!_#o%T#p~%T7V=tU'^4V#_#v$UWOz%Tz{>W{!^%T!_!`5T!`#o%T#p~%T$O>_S#[#v$UWO!^%T!_!`5T!`#o%T#p~%T%w>rSj%o$UWO!^%T!_!`5T!`#o%T#p~%T&i?VR!R&a$UWO!^%T!_#o%T#p~%T7Z?gVu5^$UWO!O%T!O!P?|!P!Q%T!Q![@r![!^%T!_#o%T#p~%T!{@RT$UWO!O%T!O!P@b!P!^%T!_#o%T#p~%T!{@iR!Q!s$UWO!^%T!_#o%T#p~%T!{@yZ$UWk!sO!Q%T!Q![@r![!^%T!_!g%T!g!hAl!h#R%T#R#S@r#S#X%T#X#YAl#Y#o%T#p~%T!{AqZ$UWO{%T{|Bd|}%T}!OBd!O!Q%T!Q![CO![!^%T!_#R%T#R#SCO#S#o%T#p~%T!{BiV$UWO!Q%T!Q![CO![!^%T!_#R%T#R#SCO#S#o%T#p~%T!{CVV$UWk!sO!Q%T!Q![CO![!^%T!_#R%T#R#SCO#S#o%T#p~%T7ZCs`$UW#]#vOYDuYZ%TZzDuz{Jl{!PDu!P!Q!-e!Q!^Du!^!_Fx!_!`!.^!`!a!/]!a!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~DuXD|[$UW}POYDuYZ%TZ!PDu!P!QEr!Q!^Du!^!_Fx!_!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~DuXEy_$UW}PO!^%T!_#Z%T#Z#[Er#[#]%T#]#^Er#^#a%T#a#bEr#b#g%T#g#hEr#h#i%T#i#jEr#j#m%T#m#nEr#n#o%T#p~%TPF}V}POYFxZ!PFx!P!QGd!Q!}Fx!}#OG{#O#PHh#P~FxPGiU}P#Z#[Gd#]#^Gd#a#bGd#g#hGd#i#jGd#m#nGdPHOTOYG{Z#OG{#O#PH_#P#QFx#Q~G{PHbQOYG{Z~G{PHkQOYFxZ~FxXHvY$UWOYHqYZ%TZ!^Hq!^!_G{!_#OHq#O#PIf#P#QDu#Q#oHq#o#pG{#p~HqXIkV$UWOYHqYZ%TZ!^Hq!^!_G{!_#oHq#o#pG{#p~HqXJVV$UWOYDuYZ%TZ!^Du!^!_Fx!_#oDu#o#pFx#p~Du7ZJs^$UW}POYJlYZKoZzJlz{NQ{!PJl!P!Q!,R!Q!^Jl!^!_!!]!_!}Jl!}#O!'|#O#P!+a#P#oJl#o#p!!]#p~Jl7ZKtV$UWOzKoz{LZ{!^Ko!^!_M]!_#oKo#o#pM]#p~Ko7ZL`X$UWOzKoz{LZ{!PKo!P!QL{!Q!^Ko!^!_M]!_#oKo#o#pM]#p~Ko7ZMSR$UWU7RO!^%T!_#o%T#p~%T7RM`ROzM]z{Mi{~M]7RMlTOzM]z{Mi{!PM]!P!QM{!Q~M]7RNQOU7R7ZNX^$UW}POYJlYZKoZzJlz{NQ{!PJl!P!Q! T!Q!^Jl!^!_!!]!_!}Jl!}#O!'|#O#P!+a#P#oJl#o#p!!]#p~Jl7Z! ^_$UWU7R}PO!^%T!_#Z%T#Z#[Er#[#]%T#]#^Er#^#a%T#a#bEr#b#g%T#g#hEr#h#i%T#i#jEr#j#m%T#m#nEr#n#o%T#p~%T7R!!bY}POY!!]YZM]Zz!!]z{!#Q{!P!!]!P!Q!&x!Q!}!!]!}#O!$`#O#P!&f#P~!!]7R!#VY}POY!!]YZM]Zz!!]z{!#Q{!P!!]!P!Q!#u!Q!}!!]!}#O!$`#O#P!&f#P~!!]7R!#|UU7R}P#Z#[Gd#]#^Gd#a#bGd#g#hGd#i#jGd#m#nGd7R!$cWOY!$`YZM]Zz!$`z{!${{#O!$`#O#P!&S#P#Q!!]#Q~!$`7R!%OYOY!$`YZM]Zz!$`z{!${{!P!$`!P!Q!%n!Q#O!$`#O#P!&S#P#Q!!]#Q~!$`7R!%sTU7ROYG{Z#OG{#O#PH_#P#QFx#Q~G{7R!&VTOY!$`YZM]Zz!$`z{!${{~!$`7R!&iTOY!!]YZM]Zz!!]z{!#Q{~!!]7R!&}_}POzM]z{Mi{#ZM]#Z#[!&x#[#]M]#]#^!&x#^#aM]#a#b!&x#b#gM]#g#h!&x#h#iM]#i#j!&x#j#mM]#m#n!&x#n~M]7Z!(R[$UWOY!'|YZKoZz!'|z{!(w{!^!'|!^!_!$`!_#O!'|#O#P!*o#P#QJl#Q#o!'|#o#p!$`#p~!'|7Z!(|^$UWOY!'|YZKoZz!'|z{!(w{!P!'|!P!Q!)x!Q!^!'|!^!_!$`!_#O!'|#O#P!*o#P#QJl#Q#o!'|#o#p!$`#p~!'|7Z!*PY$UWU7ROYHqYZ%TZ!^Hq!^!_G{!_#OHq#O#PIf#P#QDu#Q#oHq#o#pG{#p~Hq7Z!*tX$UWOY!'|YZKoZz!'|z{!(w{!^!'|!^!_!$`!_#o!'|#o#p!$`#p~!'|7Z!+fX$UWOYJlYZKoZzJlz{NQ{!^Jl!^!_!!]!_#oJl#o#p!!]#p~Jl7Z!,Yc$UW}POzKoz{LZ{!^Ko!^!_M]!_#ZKo#Z#[!,R#[#]Ko#]#^!,R#^#aKo#a#b!,R#b#gKo#g#h!,R#h#iKo#i#j!,R#j#mKo#m#n!,R#n#oKo#o#pM]#p~Ko7Z!-lV$UWT7ROY!-eYZ%TZ!^!-e!^!_!.R!_#o!-e#o#p!.R#p~!-e7R!.WQT7ROY!.RZ~!.R$P!.g[$UW#o#v}POYDuYZ%TZ!PDu!P!QEr!Q!^Du!^!_Fx!_!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~Du]!/f[#wS$UW}POYDuYZ%TZ!PDu!P!QEr!Q!^Du!^!_Fx!_!}Du!}#OHq#O#PJQ#P#oDu#o#pFx#p~Du!{!0cd$UWk!sO!O%T!O!P@r!P!Q%T!Q![!1q![!^%T!_!g%T!g!hAl!h#R%T#R#S!1q#S#U%T#U#V!3X#V#X%T#X#YAl#Y#b%T#b#c!2w#c#d!4m#d#l%T#l#m!5{#m#o%T#p~%T!{!1x_$UWk!sO!O%T!O!P@r!P!Q%T!Q![!1q![!^%T!_!g%T!g!hAl!h#R%T#R#S!1q#S#X%T#X#YAl#Y#b%T#b#c!2w#c#o%T#p~%T!{!3OR$UWk!sO!^%T!_#o%T#p~%T!{!3^W$UWO!Q%T!Q!R!3v!R!S!3v!S!^%T!_#R%T#R#S!3v#S#o%T#p~%T!{!3}Y$UWk!sO!Q%T!Q!R!3v!R!S!3v!S!^%T!_#R%T#R#S!3v#S#b%T#b#c!2w#c#o%T#p~%T!{!4rV$UWO!Q%T!Q!Y!5X!Y!^%T!_#R%T#R#S!5X#S#o%T#p~%T!{!5`X$UWk!sO!Q%T!Q!Y!5X!Y!^%T!_#R%T#R#S!5X#S#b%T#b#c!2w#c#o%T#p~%T!{!6QZ$UWO!Q%T!Q![!6s![!^%T!_!c%T!c!i!6s!i#R%T#R#S!6s#S#T%T#T#Z!6s#Z#o%T#p~%T!{!6z]$UWk!sO!Q%T!Q![!6s![!^%T!_!c%T!c!i!6s!i#R%T#R#S!6s#S#T%T#T#Z!6s#Z#b%T#b#c!2w#c#o%T#p~%T$u!7|R!]V$UW#m$fO!^%T!_#o%T#p~%T!q!8^R_!i$UWO!^%T!_#o%T#p~%T5w!8rR'bd!a/n#x&s'|P!P!Q!8{!^!_!9Q!_!`!9_W!9QO$WW#v!9VP#`#v!_!`!9Y#v!9_O#o#v#v!9dO#a#v$u!9kT!{$m$UWO!^%T!_!`'v!`!a!9z!a#o%T#p~%T$P!:RR#W#w$UWO!^%T!_#o%T#p~%T%V!:gT'a!R#a#v$RS$UWO!^%T!_!`!:v!`!a!;W!a#o%T#p~%T$O!:}R#a#v$UWO!^%T!_#o%T#p~%T$O!;_T#`#v$UWO!^%T!_!`5T!`!a!;n!a#o%T#p~%T$O!;uS#`#v$UWO!^%T!_!`5T!`#o%T#p~%T*a!<YV'p#{$UWO!O%T!O!P!<o!P!^%T!_!a%T!a!b!=P!b#o%T#p~%T*[!<vRv*S$UWO!^%T!_#o%T#p~%T$O!=WS$UW#j#vO!^%T!_!`5T!`#o%T#p~%T7V!=kRx6}$UWO!^%T!_#o%T#p~%Tk!={R!Oc$UWO!^%T!_#o%T#p~%T$O!>]S#g#v$UWO!^%T!_!`5T!`#o%T#p~%T$a!>pR$UW'f$XO!^%T!_#o%T#p~%T~!?OO!T~5b!?VT'w5Y$UWO!^%T!_!`5T!`#o%T#p#q!=P#q~%T6X!?oR!S5}nQ$UWO!^%T!_#o%T#p~%TX!@PR!kP$UWO!^%T!_#o%T#p~%T7Z!@gr$UW'Y7R#zS']$y'g3SOX%TXY%cYZ%TZ[%c[p%Tpq%cqt%Ttu2`u}%T}!O3j!O!Q%T!Q![2`![!^%T!_!c%T!c!}2`!}#R%T#R#S2`#S#T%T#T#o2`#p$f%T$f$g%c$g#BY2`#BY#BZ!@Y#BZ$IS2`$IS$I_!@Y$I_$JT2`$JT$JU!@Y$JU$KV2`$KV$KW!@Y$KW&FU2`&FU&FV!@Y&FV?HT2`?HT?HU!@Y?HU~2`7Z!CO_$UW'Z7R#zS']$y'g3SOt%Ttu2`u}%T}!O3j!O!Q%T!Q![2`![!^%T!_!c%T!c!}2`!}#R%T#R#S2`#S#T%T#T#o2`#p$g%T$g~2`",
  tokenizers: [Rd, vd, Pd, Cd, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, Td],
  topRules: { Script: [0, 7] },
  dialects: { jsx: 12107, ts: 12109 },
  dynamicPrecedences: { 149: 1, 176: 1 },
  specialized: [{ term: 289, get: (n) => Md[n] || -1 }, { term: 299, get: (n) => Wd[n] || -1 }, { term: 63, get: (n) => Zd[n] || -1 }],
  tokenPrec: 12130
});
var as;
const di = /* @__PURE__ */ new R();
function Xd(n) {
  return x.define({
    combine: n ? (e) => e.concat(n) : void 0
  });
}
class Te {
  constructor(e, t, i = []) {
    this.data = e, Z.prototype.hasOwnProperty("tree") || Object.defineProperty(Z.prototype, "tree", { get() {
      return U(this);
    } }), this.parser = t, this.extension = [
      ct.of(this),
      Z.languageData.of((s, r, o) => s.facet(Jo(s, r, o)))
    ].concat(i);
  }
  isActiveAt(e, t, i = -1) {
    return Jo(e, t, i) == this.data;
  }
  findRegions(e) {
    let t = e.facet(ct);
    if ((t == null ? void 0 : t.data) == this.data)
      return [{ from: 0, to: e.doc.length }];
    if (!t || !t.allowsNesting)
      return [];
    let i = [], s = (r, o) => {
      if (r.prop(di) == this.data) {
        i.push({ from: o, to: o + r.length });
        return;
      }
      let l = r.prop(R.mounted);
      if (l) {
        if (l.tree.prop(di) == this.data) {
          if (l.overlay)
            for (let a of l.overlay)
              i.push({ from: a.from + o, to: a.to + o });
          else
            i.push({ from: o, to: o + r.length });
          return;
        } else if (l.overlay) {
          let a = i.length;
          if (s(l.tree, l.overlay[0].from + o), i.length > a)
            return;
        }
      }
      for (let a = 0; a < r.children.length; a++) {
        let h = r.children[a];
        h instanceof L && s(h, r.positions[a] + o);
      }
    };
    return s(U(e), 0), i;
  }
  get allowsNesting() {
    return !0;
  }
}
Te.setState = /* @__PURE__ */ C.define();
function Jo(n, e, t) {
  let i = n.facet(ct);
  if (!i)
    return null;
  let s = i.data;
  if (i.allowsNesting)
    for (let r = U(n).topNode; r; r = r.enter(e, t, F.ExcludeBuffers))
      s = r.type.prop(di) || s;
  return s;
}
class pn extends Te {
  constructor(e, t) {
    super(e, t), this.parser = t;
  }
  static define(e) {
    let t = Xd(e.languageData);
    return new pn(t, e.parser.configure({
      props: [di.add((i) => i.isTop ? t : void 0)]
    }));
  }
  configure(e) {
    return new pn(this.data, this.parser.configure(e));
  }
  get allowsNesting() {
    return this.parser.hasWrappers();
  }
}
function U(n) {
  let e = n.field(Te.state, !1);
  return e ? e.tree : L.empty;
}
class jd {
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
let Ft = null;
class gn {
  constructor(e, t, i = [], s, r, o, l, a) {
    this.parser = e, this.state = t, this.fragments = i, this.tree = s, this.treeLen = r, this.viewport = o, this.skipped = l, this.scheduleOn = a, this.parse = null, this.tempSkipped = [];
  }
  static create(e, t, i) {
    return new gn(e, t, [], L.empty, 0, i, [], null);
  }
  startParse() {
    return this.parser.startParse(new jd(this.state.doc), this.fragments);
  }
  work(e, t) {
    return t != null && t >= this.state.doc.length && (t = void 0), this.tree != L.empty && this.isDone(t != null ? t : this.state.doc.length) ? (this.takeTree(), !0) : this.withContext(() => {
      var i;
      if (typeof e == "number") {
        let s = Date.now() + e;
        e = () => Date.now() > s;
      }
      for (this.parse || (this.parse = this.startParse()), t != null && (this.parse.stoppedAt == null || this.parse.stoppedAt > t) && t < this.state.doc.length && this.parse.stopAt(t); ; ) {
        let s = this.parse.advance();
        if (s)
          if (this.fragments = this.withoutTempSkipped(mt.addTree(s, this.fragments, this.parse.stoppedAt != null)), this.treeLen = (i = this.parse.stoppedAt) !== null && i !== void 0 ? i : this.state.doc.length, this.tree = s, this.parse = null, this.treeLen < (t != null ? t : this.state.doc.length))
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
    }), this.treeLen = e, this.tree = t, this.fragments = this.withoutTempSkipped(mt.addTree(this.tree, this.fragments, !0)), this.parse = null);
  }
  withContext(e) {
    let t = Ft;
    Ft = this;
    try {
      return e();
    } finally {
      Ft = t;
    }
  }
  withoutTempSkipped(e) {
    for (let t; t = this.tempSkipped.pop(); )
      e = Ko(e, t.from, t.to);
    return e;
  }
  changes(e, t) {
    let { fragments: i, tree: s, treeLen: r, viewport: o, skipped: l } = this;
    if (this.takeTree(), !e.empty) {
      let a = [];
      if (e.iterChangedRanges((h, c, f, u) => a.push({ fromA: h, toA: c, fromB: f, toB: u })), i = mt.applyChanges(i, a), s = L.empty, r = 0, o = { from: e.mapPos(o.from, -1), to: e.mapPos(o.to, 1) }, this.skipped.length) {
        l = [];
        for (let h of this.skipped) {
          let c = e.mapPos(h.from, 1), f = e.mapPos(h.to, -1);
          c < f && l.push({ from: c, to: f });
        }
      }
    }
    return new gn(this.parser, t, i, s, r, o, l, this.scheduleOn);
  }
  updateViewport(e) {
    if (this.viewport.from == e.from && this.viewport.to == e.to)
      return !1;
    this.viewport = e;
    let t = this.skipped.length;
    for (let i = 0; i < this.skipped.length; i++) {
      let { from: s, to: r } = this.skipped[i];
      s < e.to && r > e.from && (this.fragments = Ko(this.fragments, s, r), this.skipped.splice(i--, 1));
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
    return new class extends Va {
      createParse(t, i, s) {
        let r = s[0].from, o = s[s.length - 1].to;
        return {
          parsedPos: r,
          advance() {
            let a = Ft;
            if (a) {
              for (let h of s)
                a.tempSkipped.push(h);
              e && (a.scheduleOn = a.scheduleOn ? Promise.all([a.scheduleOn, e]) : e);
            }
            return this.parsedPos = o, new L(de.none, [], [], o - r);
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
    return Ft;
  }
}
function Ko(n, e, t) {
  return mt.applyChanges(n, [{ fromA: e, toA: t, fromB: e, toB: t }]);
}
class zt {
  constructor(e) {
    this.context = e, this.tree = e.tree;
  }
  apply(e) {
    if (!e.docChanged && this.tree == this.context.tree)
      return this;
    let t = this.context.changes(e.changes, e.state), i = this.context.treeLen == e.startState.doc.length ? void 0 : Math.max(e.changes.mapPos(this.context.treeLen), t.viewport.to);
    return t.work(20, i) || t.takeTree(), new zt(t);
  }
  static init(e) {
    let t = Math.min(3e3, e.doc.length), i = gn.create(e.facet(ct).parser, e, { from: 0, to: t });
    return i.work(20, t) || i.takeTree(), new zt(i);
  }
}
Te.state = /* @__PURE__ */ le.define({
  create: zt.init,
  update(n, e) {
    for (let t of e.effects)
      if (t.is(Te.setState))
        return t.value;
    return e.startState.facet(ct) != e.state.facet(ct) ? zt.init(e.state) : n.apply(e);
  }
});
let Ka = (n) => {
  let e = setTimeout(() => n(), 500);
  return () => clearTimeout(e);
};
typeof requestIdleCallback < "u" && (Ka = (n) => {
  let e = -1, t = setTimeout(() => {
    e = requestIdleCallback(n, { timeout: 500 - 100 });
  }, 100);
  return () => e < 0 ? clearTimeout(t) : cancelIdleCallback(e);
});
const hs = typeof navigator < "u" && ((as = navigator.scheduling) === null || as === void 0 ? void 0 : as.isInputPending) ? () => navigator.scheduling.isInputPending() : null, Ed = /* @__PURE__ */ oe.fromClass(class {
  constructor(e) {
    this.view = e, this.working = null, this.workScheduled = 0, this.chunkEnd = -1, this.chunkBudget = -1, this.work = this.work.bind(this), this.scheduleWork();
  }
  update(e) {
    let t = this.view.state.field(Te.state).context;
    (t.updateViewport(e.view.viewport) || this.view.viewport.to > t.treeLen) && this.scheduleWork(), e.docChanged && (this.view.hasFocus && (this.chunkBudget += 50), this.scheduleWork()), this.checkAsyncSchedule(t);
  }
  scheduleWork() {
    if (this.working)
      return;
    let { state: e } = this.view, t = e.field(Te.state);
    (t.tree != t.context.tree || !t.context.isDone(e.doc.length)) && (this.working = Ka(this.work));
  }
  work(e) {
    this.working = null;
    let t = Date.now();
    if (this.chunkEnd < t && (this.chunkEnd < 0 || this.view.hasFocus) && (this.chunkEnd = t + 3e4, this.chunkBudget = 3e3), this.chunkBudget <= 0)
      return;
    let { state: i, viewport: { to: s } } = this.view, r = i.field(Te.state);
    if (r.tree == r.context.tree && r.context.isDone(s + 1e5))
      return;
    let o = Date.now() + Math.min(this.chunkBudget, 100, e && !hs ? Math.max(25, e.timeRemaining() - 5) : 1e9), l = r.context.treeLen < s && i.doc.length > s + 1e3, a = r.context.work(() => hs && hs() || Date.now() > o, s + (l ? 0 : 1e5));
    this.chunkBudget -= Date.now() - t, (a || this.chunkBudget <= 0) && (r.context.takeTree(), this.view.dispatch({ effects: Te.setState.of(new zt(r.context)) })), this.chunkBudget > 0 && !(a && !l) && this.scheduleWork(), this.checkAsyncSchedule(r.context);
  }
  checkAsyncSchedule(e) {
    e.scheduleOn && (this.workScheduled++, e.scheduleOn.then(() => this.scheduleWork()).catch((t) => ve(this.view.state, t)).then(() => this.workScheduled--), e.scheduleOn = null);
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
}), ct = /* @__PURE__ */ x.define({
  combine(n) {
    return n.length ? n[0] : null;
  },
  enables: [Te.state, Ed]
});
class qd {
  constructor(e, t = []) {
    this.language = e, this.support = t, this.extension = [e, t];
  }
}
const Id = /* @__PURE__ */ x.define(), yi = /* @__PURE__ */ x.define({
  combine: (n) => {
    if (!n.length)
      return "  ";
    if (!/^(?: +|\t+)$/.test(n[0]))
      throw new Error("Invalid indent unit: " + JSON.stringify(n[0]));
    return n[0];
  }
});
function mn(n) {
  let e = n.facet(yi);
  return e.charCodeAt(0) == 9 ? n.tabSize * e.length : e.length;
}
function Oi(n, e) {
  let t = "", i = n.tabSize;
  if (n.facet(yi).charCodeAt(0) == 9)
    for (; e >= i; )
      t += "	", e -= i;
  for (let s = 0; s < e; s++)
    t += " ";
  return t;
}
function mr(n, e) {
  n instanceof Z && (n = new Zn(n));
  for (let i of n.state.facet(Id)) {
    let s = i(n, e);
    if (s != null)
      return s;
  }
  let t = U(n.state);
  return t ? zd(n, t, e) : null;
}
class Zn {
  constructor(e, t = {}) {
    this.state = e, this.options = t, this.unit = mn(e);
  }
  lineAt(e, t = 1) {
    let i = this.state.doc.lineAt(e), { simulateBreak: s, simulateDoubleBreak: r } = this.options;
    return s != null && s >= i.from && s <= i.to ? r && s == e ? { text: "", from: e } : (t < 0 ? s < e : s <= e) ? { text: i.text.slice(s - i.from), from: s } : { text: i.text.slice(0, s - i.from), from: i.from } : i;
  }
  textAfterPos(e, t = 1) {
    if (this.options.simulateDoubleBreak && e == this.options.simulateBreak)
      return "";
    let { text: i, from: s } = this.lineAt(e, t);
    return i.slice(e - s, Math.min(i.length, e + 100 - s));
  }
  column(e, t = 1) {
    let { text: i, from: s } = this.lineAt(e, t), r = this.countColumn(i, e - s), o = this.options.overrideIndentation ? this.options.overrideIndentation(s) : -1;
    return o > -1 && (r += o - this.countColumn(i, i.search(/\S|$/))), r;
  }
  countColumn(e, t = e.length) {
    return Pn(e, this.state.tabSize, t);
  }
  lineIndent(e, t = 1) {
    let { text: i, from: s } = this.lineAt(e, t), r = this.options.overrideIndentation;
    if (r) {
      let o = r(s);
      if (o > -1)
        return o;
    }
    return this.countColumn(i, i.search(/\S|$/));
  }
  get simulatedBreak() {
    return this.options.simulateBreak || null;
  }
}
const eh = /* @__PURE__ */ new R();
function zd(n, e, t) {
  return th(e.resolveInner(t).enterUnfinishedNodesBefore(t), t, n);
}
function Bd(n) {
  return n.pos == n.options.simulateBreak && n.options.simulateDoubleBreak;
}
function Gd(n) {
  let e = n.type.prop(eh);
  if (e)
    return e;
  let t = n.firstChild, i;
  if (t && (i = t.type.prop(R.closedBy))) {
    let s = n.lastChild, r = s && i.indexOf(s.name) > -1;
    return (o) => ih(o, !0, 1, void 0, r && !Bd(o) ? s.from : void 0);
  }
  return n.parent == null ? Ld : null;
}
function th(n, e, t) {
  for (; n; n = n.parent) {
    let i = Gd(n);
    if (i)
      return i(Qr.create(t, e, n));
  }
  return null;
}
function Ld() {
  return 0;
}
class Qr extends Zn {
  constructor(e, t, i) {
    super(e.state, e.options), this.base = e, this.pos = t, this.node = i;
  }
  static create(e, t, i) {
    return new Qr(e, t, i);
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
      if (_d(t, this.node))
        break;
      e = this.state.doc.lineAt(t.from);
    }
    return this.lineIndent(e.from);
  }
  continue() {
    let e = this.node.parent;
    return e ? th(e, this.pos, this.base) : 0;
  }
}
function _d(n, e) {
  for (let t = e; t; t = t.parent)
    if (n == t)
      return !0;
  return !1;
}
function Nd(n) {
  let e = n.node, t = e.childAfter(e.from), i = e.lastChild;
  if (!t)
    return null;
  let s = n.options.simulateBreak, r = n.state.doc.lineAt(t.from), o = s == null || s <= r.from ? r.to : Math.min(r.to, s);
  for (let l = t.to; ; ) {
    let a = e.childAfter(l);
    if (!a || a == i)
      return null;
    if (!a.type.isSkipped)
      return a.from < o ? t : null;
    l = a.to;
  }
}
function Vd({ closing: n, align: e = !0, units: t = 1 }) {
  return (i) => ih(i, e, t, n);
}
function ih(n, e, t, i, s) {
  let r = n.textAfter, o = r.match(/^\s*/)[0].length, l = i && r.slice(o, o + i.length) == i || s == n.pos + o, a = e ? Nd(n) : null;
  return a ? l ? n.column(a.from) : n.column(a.to) : n.baseIndent + (l ? 0 : n.unit * t);
}
const Ud = (n) => n.baseIndent;
function cs({ except: n, units: e = 1 } = {}) {
  return (t) => {
    let i = n && n.test(t.textAfter);
    return t.baseIndent + (i ? 0 : e * t.unit);
  };
}
const Fd = 200;
function Yd() {
  return Z.transactionFilter.of((n) => {
    if (!n.docChanged || !n.isUserEvent("input.type") && !n.isUserEvent("input.complete"))
      return n;
    let e = n.startState.languageDataAt("indentOnInput", n.startState.selection.main.head);
    if (!e.length)
      return n;
    let t = n.newDoc, { head: i } = n.newSelection.main, s = t.lineAt(i);
    if (i > s.from + Fd)
      return n;
    let r = t.sliceString(s.from, i);
    if (!e.some((h) => h.test(r)))
      return n;
    let { state: o } = n, l = -1, a = [];
    for (let { head: h } of o.selection.ranges) {
      let c = o.doc.lineAt(h);
      if (c.from == l)
        continue;
      l = c.from;
      let f = mr(o, c.from);
      if (f == null)
        continue;
      let u = /^\s*/.exec(c.text)[0], d = Oi(o, f);
      u != d && a.push({ from: c.from, to: c.from + u.length, insert: d });
    }
    return a.length ? [n, { changes: a, sequential: !0 }] : n;
  });
}
const Hd = /* @__PURE__ */ x.define(), nh = /* @__PURE__ */ new R();
function Jd(n) {
  let e = n.firstChild, t = n.lastChild;
  return e && e.to < t.from ? { from: e.to, to: t.type.isError ? n.to : t.from } : null;
}
function Kd(n, e, t) {
  let i = U(n);
  if (i.length < t)
    return null;
  let s = i.resolveInner(t), r = null;
  for (let o = s; o; o = o.parent) {
    if (o.to <= t || o.from > t)
      continue;
    if (r && o.from < e)
      break;
    let l = o.type.prop(nh);
    if (l && (o.to < i.length - 50 || i.length == n.doc.length || !eO(o))) {
      let a = l(o, n);
      a && a.from <= t && a.from >= e && a.to > t && (r = a);
    }
  }
  return r;
}
function eO(n) {
  let e = n.lastChild;
  return e && e.to == n.to && e.type.isError;
}
function Qn(n, e, t) {
  for (let i of n.facet(Hd)) {
    let s = i(n, e, t);
    if (s)
      return s;
  }
  return Kd(n, e, t);
}
function sh(n, e) {
  let t = e.mapPos(n.from, 1), i = e.mapPos(n.to, -1);
  return t >= i ? void 0 : { from: t, to: i };
}
const Dn = /* @__PURE__ */ C.define({ map: sh }), Si = /* @__PURE__ */ C.define({ map: sh });
function rh(n) {
  let e = [];
  for (let { head: t } of n.state.selection.ranges)
    e.some((i) => i.from <= t && i.to >= t) || e.push(n.lineBlockAt(t));
  return e;
}
const bt = /* @__PURE__ */ le.define({
  create() {
    return T.none;
  },
  update(n, e) {
    n = n.map(e.changes);
    for (let t of e.effects)
      t.is(Dn) && !tO(n, t.value.from, t.value.to) ? n = n.update({ add: [el.range(t.value.from, t.value.to)] }) : t.is(Si) && (n = n.update({
        filter: (i, s) => t.value.from != i || t.value.to != s,
        filterFrom: t.value.from,
        filterTo: t.value.to
      }));
    if (e.selection) {
      let t = !1, { head: i } = e.selection.main;
      n.between(i, i, (s, r) => {
        s < i && r > i && (t = !0);
      }), t && (n = n.update({
        filterFrom: i,
        filterTo: i,
        filter: (s, r) => r <= i || s >= i
      }));
    }
    return n;
  },
  provide: (n) => k.decorations.from(n),
  toJSON(n, e) {
    let t = [];
    return n.between(0, e.doc.length, (i, s) => {
      t.push(i, s);
    }), t;
  },
  fromJSON(n) {
    if (!Array.isArray(n) || n.length % 2)
      throw new RangeError("Invalid JSON for fold state");
    let e = [];
    for (let t = 0; t < n.length; ) {
      let i = n[t++], s = n[t++];
      if (typeof i != "number" || typeof s != "number")
        throw new RangeError("Invalid JSON for fold state");
      e.push(el.range(i, s));
    }
    return T.set(e, !0);
  }
});
function yn(n, e, t) {
  var i;
  let s = null;
  return (i = n.field(bt, !1)) === null || i === void 0 || i.between(e, t, (r, o) => {
    (!s || s.from > r) && (s = { from: r, to: o });
  }), s;
}
function tO(n, e, t) {
  let i = !1;
  return n.between(e, e, (s, r) => {
    s == e && r == t && (i = !0);
  }), i;
}
function oh(n, e) {
  return n.field(bt, !1) ? e : e.concat(C.appendConfig.of(hh()));
}
const iO = (n) => {
  for (let e of rh(n)) {
    let t = Qn(n.state, e.from, e.to);
    if (t)
      return n.dispatch({ effects: oh(n.state, [Dn.of(t), lh(n, t)]) }), !0;
  }
  return !1;
}, nO = (n) => {
  if (!n.state.field(bt, !1))
    return !1;
  let e = [];
  for (let t of rh(n)) {
    let i = yn(n.state, t.from, t.to);
    i && e.push(Si.of(i), lh(n, i, !1));
  }
  return e.length && n.dispatch({ effects: e }), e.length > 0;
};
function lh(n, e, t = !0) {
  let i = n.state.doc.lineAt(e.from).number, s = n.state.doc.lineAt(e.to).number;
  return k.announce.of(`${n.state.phrase(t ? "Folded lines" : "Unfolded lines")} ${i} ${n.state.phrase("to")} ${s}.`);
}
const sO = (n) => {
  let { state: e } = n, t = [];
  for (let i = 0; i < e.doc.length; ) {
    let s = n.lineBlockAt(i), r = Qn(e, s.from, s.to);
    r && t.push(Dn.of(r)), i = (r ? n.lineBlockAt(r.to) : s).to + 1;
  }
  return t.length && n.dispatch({ effects: oh(n.state, t) }), !!t.length;
}, rO = (n) => {
  let e = n.state.field(bt, !1);
  if (!e || !e.size)
    return !1;
  let t = [];
  return e.between(0, n.state.doc.length, (i, s) => {
    t.push(Si.of({ from: i, to: s }));
  }), n.dispatch({ effects: t }), !0;
}, oO = [
  { key: "Ctrl-Shift-[", mac: "Cmd-Alt-[", run: iO },
  { key: "Ctrl-Shift-]", mac: "Cmd-Alt-]", run: nO },
  { key: "Ctrl-Alt-[", run: sO },
  { key: "Ctrl-Alt-]", run: rO }
], lO = {
  placeholderDOM: null,
  placeholderText: "\u2026"
}, ah = /* @__PURE__ */ x.define({
  combine(n) {
    return $t(n, lO);
  }
});
function hh(n) {
  let e = [bt, cO];
  return n && e.push(ah.of(n)), e;
}
const el = /* @__PURE__ */ T.replace({ widget: /* @__PURE__ */ new class extends ft {
  toDOM(n) {
    let { state: e } = n, t = e.facet(ah), i = (r) => {
      let o = n.lineBlockAt(n.posAtDOM(r.target)), l = yn(n.state, o.from, o.to);
      l && n.dispatch({ effects: Si.of(l) }), r.preventDefault();
    };
    if (t.placeholderDOM)
      return t.placeholderDOM(n, i);
    let s = document.createElement("span");
    return s.textContent = t.placeholderText, s.setAttribute("aria-label", e.phrase("folded code")), s.title = e.phrase("unfold"), s.className = "cm-foldPlaceholder", s.onclick = i, s;
  }
}() }), aO = {
  openText: "\u2304",
  closedText: "\u203A",
  markerDOM: null,
  domEventHandlers: {},
  foldingChanged: () => !1
};
class fs extends Ve {
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
function hO(n = {}) {
  let e = Object.assign(Object.assign({}, aO), n), t = new fs(e, !0), i = new fs(e, !1), s = oe.fromClass(class {
    constructor(o) {
      this.from = o.viewport.from, this.markers = this.buildMarkers(o);
    }
    update(o) {
      (o.docChanged || o.viewportChanged || o.startState.facet(ct) != o.state.facet(ct) || o.startState.field(bt, !1) != o.state.field(bt, !1) || U(o.startState) != U(o.state) || e.foldingChanged(o)) && (this.markers = this.buildMarkers(o.view));
    }
    buildMarkers(o) {
      let l = new ot();
      for (let a of o.viewportLineBlocks) {
        let h = yn(o.state, a.from, a.to) ? i : Qn(o.state, a.from, a.to) ? t : null;
        h && l.add(a.from, a.from, h);
      }
      return l.finish();
    }
  }), { domEventHandlers: r } = e;
  return [
    s,
    Cu({
      class: "cm-foldGutter",
      markers(o) {
        var l;
        return ((l = o.plugin(s)) === null || l === void 0 ? void 0 : l.markers) || j.empty;
      },
      initialSpacer() {
        return new fs(e, !1);
      },
      domEventHandlers: Object.assign(Object.assign({}, r), { click: (o, l, a) => {
        if (r.click && r.click(o, l, a))
          return !0;
        let h = yn(o.state, l.from, l.to);
        if (h)
          return o.dispatch({ effects: Si.of(h) }), !0;
        let c = Qn(o.state, l.from, l.to);
        return c ? (o.dispatch({ effects: Dn.of(c) }), !0) : !1;
      } })
    }),
    hh()
  ];
}
const cO = /* @__PURE__ */ k.baseTheme({
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
class Xn {
  constructor(e, t) {
    let i;
    function s(l) {
      let a = lt.newName();
      return (i || (i = /* @__PURE__ */ Object.create(null)))["." + a] = l, a;
    }
    const r = typeof t.all == "string" ? t.all : t.all ? s(t.all) : void 0, o = t.scope;
    this.scope = o instanceof Te ? (l) => l.prop(di) == o.data : o ? (l) => l == o : void 0, this.style = Ha(e.map((l) => ({
      tag: l.tag,
      class: l.class || s(Object.assign({}, l, { tag: null }))
    })), {
      all: r
    }).style, this.module = i ? new lt(i) : null, this.themeType = t.themeType;
  }
  static define(e, t) {
    return new Xn(e, t || {});
  }
}
const Fs = /* @__PURE__ */ x.define(), ch = /* @__PURE__ */ x.define({
  combine(n) {
    return n.length ? [n[0]] : null;
  }
});
function us(n) {
  let e = n.facet(Fs);
  return e.length ? e : n.facet(ch);
}
function fO(n, e) {
  let t = [dO], i;
  return n instanceof Xn && (n.module && t.push(k.styleModule.of(n.module)), i = n.themeType), e != null && e.fallback ? t.push(ch.of(n)) : i ? t.push(Fs.computeN([k.darkTheme], (s) => s.facet(k.darkTheme) == (i == "dark") ? [n] : [])) : t.push(Fs.of(n)), t;
}
class uO {
  constructor(e) {
    this.markCache = /* @__PURE__ */ Object.create(null), this.tree = U(e.state), this.decorations = this.buildDeco(e, us(e.state));
  }
  update(e) {
    let t = U(e.state), i = us(e.state), s = i != us(e.startState);
    t.length < e.view.viewport.to && !s && t.type == this.tree.type ? this.decorations = this.decorations.map(e.changes) : (t != this.tree || e.viewportChanged || s) && (this.tree = t, this.decorations = this.buildDeco(e.view, i));
  }
  buildDeco(e, t) {
    if (!t || !this.tree.length)
      return T.none;
    let i = new ot();
    for (let { from: s, to: r } of e.visibleRanges)
      rd(this.tree, t, (o, l, a) => {
        i.add(o, l, this.markCache[a] || (this.markCache[a] = T.mark({ class: a })));
      }, s, r);
    return i.finish();
  }
}
const dO = /* @__PURE__ */ Gt.high(/* @__PURE__ */ oe.fromClass(uO, {
  decorations: (n) => n.decorations
})), OO = /* @__PURE__ */ Xn.define([
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
]), pO = /* @__PURE__ */ k.baseTheme({
  "&.cm-focused .cm-matchingBracket": { backgroundColor: "#328c8252" },
  "&.cm-focused .cm-nonmatchingBracket": { backgroundColor: "#bb555544" }
}), fh = 1e4, uh = "()[]{}", dh = /* @__PURE__ */ x.define({
  combine(n) {
    return $t(n, {
      afterCursor: !0,
      brackets: uh,
      maxScanDistance: fh,
      renderMatch: QO
    });
  }
}), gO = /* @__PURE__ */ T.mark({ class: "cm-matchingBracket" }), mO = /* @__PURE__ */ T.mark({ class: "cm-nonmatchingBracket" });
function QO(n) {
  let e = [], t = n.matched ? gO : mO;
  return e.push(t.range(n.start.from, n.start.to)), n.end && e.push(t.range(n.end.from, n.end.to)), e;
}
const yO = /* @__PURE__ */ le.define({
  create() {
    return T.none;
  },
  update(n, e) {
    if (!e.docChanged && !e.selection)
      return n;
    let t = [], i = e.state.facet(dh);
    for (let s of e.state.selection.ranges) {
      if (!s.empty)
        continue;
      let r = Xe(e.state, s.head, -1, i) || s.head > 0 && Xe(e.state, s.head - 1, 1, i) || i.afterCursor && (Xe(e.state, s.head, 1, i) || s.head < e.state.doc.length && Xe(e.state, s.head + 1, -1, i));
      r && (t = t.concat(i.renderMatch(r, e.state)));
    }
    return T.set(t, !0);
  },
  provide: (n) => k.decorations.from(n)
}), SO = [
  yO,
  pO
];
function bO(n = {}) {
  return [dh.of(n), SO];
}
function Ys(n, e, t) {
  let i = n.prop(e < 0 ? R.openedBy : R.closedBy);
  if (i)
    return i;
  if (n.name.length == 1) {
    let s = t.indexOf(n.name);
    if (s > -1 && s % 2 == (e < 0 ? 1 : 0))
      return [t[s + e]];
  }
  return null;
}
function Xe(n, e, t, i = {}) {
  let s = i.maxScanDistance || fh, r = i.brackets || uh, o = U(n), l = o.resolveInner(e, t);
  for (let a = l; a; a = a.parent) {
    let h = Ys(a.type, t, r);
    if (h && a.from < a.to)
      return xO(n, e, t, a, h, r);
  }
  return $O(n, e, t, o, l.type, s, r);
}
function xO(n, e, t, i, s, r) {
  let o = i.parent, l = { from: i.from, to: i.to }, a = 0, h = o == null ? void 0 : o.cursor();
  if (h && (t < 0 ? h.childBefore(i.from) : h.childAfter(i.to)))
    do
      if (t < 0 ? h.to <= i.from : h.from >= i.to) {
        if (a == 0 && s.indexOf(h.type.name) > -1 && h.from < h.to)
          return { start: l, end: { from: h.from, to: h.to }, matched: !0 };
        if (Ys(h.type, t, r))
          a++;
        else if (Ys(h.type, -t, r)) {
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
function $O(n, e, t, i, s, r, o) {
  let l = t < 0 ? n.sliceDoc(e - 1, e) : n.sliceDoc(e, e + 1), a = o.indexOf(l);
  if (a < 0 || a % 2 == 0 != t > 0)
    return null;
  let h = { from: t < 0 ? e - 1 : e, to: t > 0 ? e + 1 : e }, c = n.doc.iterRange(e, t > 0 ? n.doc.length : 0), f = 0;
  for (let u = 0; !c.next().done && u <= r; ) {
    let d = c.value;
    t < 0 && (u += d.length);
    let O = e + u * t;
    for (let m = t > 0 ? 0 : d.length - 1, Q = t > 0 ? d.length : -1; m != Q; m += t) {
      let S = o.indexOf(d[m]);
      if (!(S < 0 || i.resolveInner(O + m, 1).type != s))
        if (S % 2 == 0 == t > 0)
          f++;
        else {
          if (f == 1)
            return { start: h, end: { from: O + m, to: O + m + 1 }, matched: S >> 1 == a >> 1 };
          f--;
        }
    }
    t > 0 && (u += d.length);
  }
  return c.done ? { start: h, matched: !1 } : null;
}
const kO = /* @__PURE__ */ Object.create(null), tl = [de.none], il = [], wO = /* @__PURE__ */ Object.create(null);
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
  wO[n] = /* @__PURE__ */ TO(kO, e);
function ds(n, e) {
  il.indexOf(n) > -1 || (il.push(n), console.warn(e));
}
function TO(n, e) {
  let t = null;
  for (let r of e.split(".")) {
    let o = n[r] || p[r];
    o ? typeof o == "function" ? t ? t = o(t) : ds(r, `Modifier ${r} used at start of tag`) : t ? ds(r, `Tag ${r} used as modifier`) : t = o : ds(r, `Unknown highlighting tag ${r}`);
  }
  if (!t)
    return 0;
  let i = e.replace(/ /g, "_"), s = de.define({
    id: tl.length,
    name: i,
    props: [Fa({ [i]: t })]
  });
  return tl.push(s), s.id;
}
class Oh {
  constructor(e, t, i) {
    this.state = e, this.pos = t, this.explicit = i, this.abortListeners = [];
  }
  tokenBefore(e) {
    let t = U(this.state).resolveInner(this.pos, -1);
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
    let t = this.state.doc.lineAt(this.pos), i = Math.max(t.from, this.pos - 250), s = t.text.slice(i - t.from, this.pos - t.from), r = s.search(gh(e, !1));
    return r < 0 ? null : { from: i + r, to: this.pos, text: s.slice(r) };
  }
  get aborted() {
    return this.abortListeners == null;
  }
  addEventListener(e, t) {
    e == "abort" && this.abortListeners && this.abortListeners.push(t);
  }
}
function nl(n) {
  let e = Object.keys(n).join(""), t = /\w/.test(e);
  return t && (e = e.replace(/\w/g, "")), `[${t ? "\\w" : ""}${e.replace(/[^\w\s]/g, "\\$&")}]`;
}
function vO(n) {
  let e = /* @__PURE__ */ Object.create(null), t = /* @__PURE__ */ Object.create(null);
  for (let { label: s } of n) {
    e[s[0]] = !0;
    for (let r = 1; r < s.length; r++)
      t[s[r]] = !0;
  }
  let i = nl(e) + nl(t) + "*$";
  return [new RegExp("^" + i), new RegExp(i)];
}
function ph(n) {
  let e = n.map((s) => typeof s == "string" ? { label: s } : s), [t, i] = e.every((s) => /^\w+$/.test(s.label)) ? [/\w*$/, /\w+$/] : vO(e);
  return (s) => {
    let r = s.matchBefore(i);
    return r || s.explicit ? { from: r ? r.from : s.pos, options: e, validFor: t } : null;
  };
}
function PO(n, e) {
  return (t) => {
    for (let i = U(t.state).resolveInner(t.pos, -1); i; i = i.parent)
      if (n.indexOf(i.name) > -1)
        return null;
    return e(t);
  };
}
class sl {
  constructor(e, t, i) {
    this.completion = e, this.source = t, this.match = i;
  }
}
function st(n) {
  return n.selection.main.head;
}
function gh(n, e) {
  var t;
  let { source: i } = n, s = e && i[0] != "^", r = i[i.length - 1] != "$";
  return !s && !r ? n : new RegExp(`${s ? "^" : ""}(?:${i})${r ? "$" : ""}`, (t = n.flags) !== null && t !== void 0 ? t : n.ignoreCase ? "i" : "");
}
function CO(n, e, t, i) {
  return Object.assign(Object.assign({}, n.changeByRange((s) => {
    if (s == n.selection.main)
      return {
        changes: { from: t, to: i, insert: e },
        range: g.cursor(t + e.length)
      };
    let r = i - t;
    return !s.empty || r && n.sliceDoc(s.from - r, s.from) != n.sliceDoc(t, i) ? { range: s } : {
      changes: { from: s.from - r, to: s.from, insert: e },
      range: g.cursor(s.from - r + e.length)
    };
  })), { userEvent: "input.complete" });
}
function mh(n, e) {
  const t = e.completion.apply || e.completion.label;
  let i = e.source;
  typeof t == "string" ? n.dispatch(CO(n.state, t, i.from, i.to)) : t(n, e.completion, i.from, i.to);
}
const rl = /* @__PURE__ */ new WeakMap();
function RO(n) {
  if (!Array.isArray(n))
    return n;
  let e = rl.get(n);
  return e || rl.set(n, e = ph(n)), e;
}
class AO {
  constructor(e) {
    this.pattern = e, this.chars = [], this.folded = [], this.any = [], this.precise = [], this.byWord = [];
    for (let t = 0; t < e.length; ) {
      let i = K(e, t), s = pe(i);
      this.chars.push(i);
      let r = e.slice(t, t + s), o = r.toUpperCase();
      this.folded.push(K(o == r ? r.toLowerCase() : o, 0)), t += s;
    }
    this.astral = e.length != this.chars.length;
  }
  match(e) {
    if (this.pattern.length == 0)
      return [0];
    if (e.length < this.pattern.length)
      return null;
    let { chars: t, folded: i, any: s, precise: r, byWord: o } = this;
    if (t.length == 1) {
      let $ = K(e, 0);
      return $ == t[0] ? [0, 0, pe($)] : $ == i[0] ? [-200, 0, pe($)] : null;
    }
    let l = e.indexOf(this.pattern);
    if (l == 0)
      return [0, 0, this.pattern.length];
    let a = t.length, h = 0;
    if (l < 0) {
      for (let $ = 0, A = Math.min(e.length, 200); $ < A && h < a; ) {
        let w = K(e, $);
        (w == t[h] || w == i[h]) && (s[h++] = $), $ += pe(w);
      }
      if (h < a)
        return null;
    }
    let c = 0, f = 0, u = !1, d = 0, O = -1, m = -1, Q = /[a-z]/.test(e), S = !0;
    for (let $ = 0, A = Math.min(e.length, 200), w = 0; $ < A && f < a; ) {
      let v = K(e, $);
      l < 0 && (c < a && v == t[c] && (r[c++] = $), d < a && (v == t[d] || v == i[d] ? (d == 0 && (O = $), m = $ + 1, d++) : d = 0));
      let P, M = v < 255 ? v >= 48 && v <= 57 || v >= 97 && v <= 122 ? 2 : v >= 65 && v <= 90 ? 1 : 0 : (P = sr(v)) != P.toLowerCase() ? 1 : P != P.toUpperCase() ? 2 : 0;
      (!$ || M == 1 && Q || w == 0 && M != 0) && (t[f] == v || i[f] == v && (u = !0) ? o[f++] = $ : o.length && (S = !1)), w = M, $ += pe(v);
    }
    return f == a && o[0] == 0 && S ? this.result(-100 + (u ? -200 : 0), o, e) : d == a && O == 0 ? [-200 - e.length, 0, m] : l > -1 ? [-700 - e.length, l, l + this.pattern.length] : d == a ? [-200 + -700 - e.length, O, m] : f == a ? this.result(-100 + (u ? -200 : 0) + -700 + (S ? 0 : -1100), o, e) : t.length == 2 ? null : this.result((s[0] ? -700 : 0) + -200 + -1100, s, e);
  }
  result(e, t, i) {
    let s = [e - i.length], r = 1;
    for (let o of t) {
      let l = o + (this.astral ? pe(K(i, o)) : 1);
      r > 1 && s[r - 1] == o ? s[r - 1] = l : (s[r++] = o, s[r++] = l);
    }
    return s;
  }
}
const Ie = /* @__PURE__ */ x.define({
  combine(n) {
    return $t(n, {
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
      optionClass: (e, t) => (i) => MO(e(i), t(i)),
      addToOptions: (e, t) => e.concat(t)
    });
  }
});
function MO(n, e) {
  return n ? e ? n + " " + e : n : e;
}
function WO(n) {
  let e = n.addToOptions.slice();
  return n.icons && e.push({
    render(t) {
      let i = document.createElement("div");
      return i.classList.add("cm-completionIcon"), t.type && i.classList.add(...t.type.split(/\s+/g).map((s) => "cm-completionIcon-" + s)), i.setAttribute("aria-hidden", "true"), i;
    },
    position: 20
  }), e.push({
    render(t, i, s) {
      let r = document.createElement("span");
      r.className = "cm-completionLabel";
      let { label: o } = t, l = 0;
      for (let a = 1; a < s.length; ) {
        let h = s[a++], c = s[a++];
        h > l && r.appendChild(document.createTextNode(o.slice(l, h)));
        let f = r.appendChild(document.createElement("span"));
        f.appendChild(document.createTextNode(o.slice(h, c))), f.className = "cm-completionMatchedText", l = c;
      }
      return l < o.length && r.appendChild(document.createTextNode(o.slice(l))), r;
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
function ol(n, e, t) {
  if (n <= t)
    return { from: 0, to: n };
  if (e < 0 && (e = 0), e <= n >> 1) {
    let s = Math.floor(e / t);
    return { from: s * t, to: (s + 1) * t };
  }
  let i = Math.floor((n - e) / t);
  return { from: n - (i + 1) * t, to: n - i * t };
}
class ZO {
  constructor(e, t) {
    this.view = e, this.stateField = t, this.info = null, this.placeInfo = {
      read: () => this.measureInfo(),
      write: (l) => this.positionInfo(l),
      key: this
    };
    let i = e.state.field(t), { options: s, selected: r } = i.open, o = e.state.facet(Ie);
    this.optionContent = WO(o), this.optionClass = o.optionClass, this.range = ol(s.length, r, o.maxRenderedOptions), this.dom = document.createElement("div"), this.dom.className = "cm-tooltip-autocomplete", this.dom.addEventListener("mousedown", (l) => {
      for (let a = l.target, h; a && a != this.dom; a = a.parentNode)
        if (a.nodeName == "LI" && (h = /-(\d+)$/.exec(a.id)) && +h[1] < s.length) {
          mh(e, s[+h[1]]), l.preventDefault();
          return;
        }
    }), this.list = this.dom.appendChild(this.createListBox(s, i.id, this.range)), this.list.addEventListener("scroll", () => {
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
    if ((t.selected < this.range.from || t.selected >= this.range.to) && (this.range = ol(t.options.length, t.selected, this.view.state.facet(Ie).maxRenderedOptions), this.list.remove(), this.list = this.dom.appendChild(this.createListBox(t.options, e.id, this.range)), this.list.addEventListener("scroll", () => {
      this.info && this.view.requestMeasure(this.placeInfo);
    })), this.updateSelectedOption(t.selected)) {
      this.info && (this.info.remove(), this.info = null);
      let { completion: i } = t.options[t.selected], { info: s } = i;
      if (!s)
        return;
      let r = typeof s == "string" ? document.createTextNode(s) : s(i);
      if (!r)
        return;
      "then" in r ? r.then((o) => {
        o && this.view.state.field(this.stateField, !1) == e && this.addInfoPane(o);
      }).catch((o) => ve(this.view.state, o, "completion info")) : this.addInfoPane(r);
    }
  }
  addInfoPane(e) {
    let t = this.info = document.createElement("div");
    t.className = "cm-tooltip cm-completionInfo", t.appendChild(e), this.dom.appendChild(t), this.view.requestMeasure(this.placeInfo);
  }
  updateSelectedOption(e) {
    let t = null;
    for (let i = this.list.firstChild, s = this.range.from; i; i = i.nextSibling, s++)
      s == e ? i.hasAttribute("aria-selected") || (i.setAttribute("aria-selected", "true"), t = i) : i.hasAttribute("aria-selected") && i.removeAttribute("aria-selected");
    return t && XO(this.list, t), t;
  }
  measureInfo() {
    let e = this.dom.querySelector("[aria-selected]");
    if (!e || !this.info)
      return null;
    let t = this.dom.getBoundingClientRect(), i = this.info.getBoundingClientRect(), s = e.getBoundingClientRect();
    if (s.top > Math.min(innerHeight, t.bottom) - 10 || s.bottom < Math.max(0, t.top) + 10)
      return null;
    let r = Math.max(0, Math.min(s.top, innerHeight - i.height)) - t.top, o = this.view.textDirection == V.RTL, l = t.left, a = innerWidth - t.right;
    return o && l < Math.min(i.width, a) ? o = !1 : !o && a < Math.min(i.width, l) && (o = !0), { top: r, left: o };
  }
  positionInfo(e) {
    this.info && (this.info.style.top = (e ? e.top : -1e6) + "px", e && (this.info.classList.toggle("cm-completionInfo-left", e.left), this.info.classList.toggle("cm-completionInfo-right", !e.left)));
  }
  createListBox(e, t, i) {
    const s = document.createElement("ul");
    s.id = t, s.setAttribute("role", "listbox"), s.setAttribute("aria-expanded", "true"), s.setAttribute("aria-label", this.view.state.phrase("Completions"));
    for (let r = i.from; r < i.to; r++) {
      let { completion: o, match: l } = e[r];
      const a = s.appendChild(document.createElement("li"));
      a.id = t + "-" + r, a.setAttribute("role", "option");
      let h = this.optionClass(o);
      h && (a.className = h);
      for (let c of this.optionContent) {
        let f = c(o, this.view.state, l);
        f && a.appendChild(f);
      }
    }
    return i.from && s.classList.add("cm-completionListIncompleteTop"), i.to < e.length && s.classList.add("cm-completionListIncompleteBottom"), s;
  }
}
function DO(n) {
  return (e) => new ZO(e, n);
}
function XO(n, e) {
  let t = n.getBoundingClientRect(), i = e.getBoundingClientRect();
  i.top < t.top ? n.scrollTop -= t.top - i.top : i.bottom > t.bottom && (n.scrollTop += i.bottom - t.bottom);
}
function ll(n) {
  return (n.boost || 0) * 100 + (n.apply ? 10 : 0) + (n.info ? 5 : 0) + (n.type ? 1 : 0);
}
function jO(n, e) {
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
          t.push(new sl(h, l, c));
        }
      } else {
        let a = new AO(e.sliceDoc(l.from, l.to)), h;
        for (let c of l.result.options)
          (h = a.match(c.label)) && (c.boost != null && (h[0] += c.boost), t.push(new sl(c, l, h)));
      }
  let s = [], r = null, o = e.facet(Ie).compareCompletions;
  for (let l of t.sort((a, h) => h.match[0] - a.match[0] || o(a.completion, h.completion)))
    !r || r.label != l.completion.label || r.detail != l.completion.detail || r.type != null && l.completion.type != null && r.type != l.completion.type || r.apply != l.completion.apply ? s.push(l) : ll(l.completion) > ll(r) && (s[s.length - 1] = l), r = l.completion;
  return s;
}
class ri {
  constructor(e, t, i, s, r) {
    this.options = e, this.attrs = t, this.tooltip = i, this.timestamp = s, this.selected = r;
  }
  setSelected(e, t) {
    return e == this.selected || e >= this.options.length ? this : new ri(this.options, al(t, e), this.tooltip, this.timestamp, e);
  }
  static build(e, t, i, s, r) {
    let o = jO(e, t);
    if (!o.length)
      return null;
    let l = t.facet(Ie).selectOnOpen ? 0 : -1;
    if (s && s.selected != l && s.selected != -1) {
      let a = s.options[s.selected].completion;
      for (let h = 0; h < o.length; h++)
        if (o[h].completion == a) {
          l = h;
          break;
        }
    }
    return new ri(o, al(i, l), {
      pos: e.reduce((a, h) => h.hasResult() ? Math.min(a, h.from) : a, 1e8),
      create: DO(ye),
      above: r.aboveCursor
    }, s ? s.timestamp : Date.now(), l);
  }
  map(e) {
    return new ri(this.options, this.attrs, Object.assign(Object.assign({}, this.tooltip), { pos: e.mapPos(this.tooltip.pos) }), this.timestamp, this.selected);
  }
}
class Sn {
  constructor(e, t, i) {
    this.active = e, this.id = t, this.open = i;
  }
  static start() {
    return new Sn(IO, "cm-ac-" + Math.floor(Math.random() * 2e6).toString(36), null);
  }
  update(e) {
    let { state: t } = e, i = t.facet(Ie), r = (i.override || t.languageDataAt("autocomplete", st(t)).map(RO)).map((l) => (this.active.find((h) => h.source == l) || new ce(l, this.active.some((h) => h.state != 0) ? 1 : 0)).update(e, i));
    r.length == this.active.length && r.every((l, a) => l == this.active[a]) && (r = this.active);
    let o = e.selection || r.some((l) => l.hasResult() && e.changes.touchesRange(l.from, l.to)) || !EO(r, this.active) ? ri.build(r, t, this.id, this.open, i) : this.open && e.docChanged ? this.open.map(e.changes) : this.open;
    !o && r.every((l) => l.state != 1) && r.some((l) => l.hasResult()) && (r = r.map((l) => l.hasResult() ? new ce(l.source, 0) : l));
    for (let l of e.effects)
      l.is(yh) && (o = o && o.setSelected(l.value, this.id));
    return r == this.active && o == this.open ? this : new Sn(r, this.id, o);
  }
  get tooltip() {
    return this.open ? this.open.tooltip : null;
  }
  get attrs() {
    return this.open ? this.open.attrs : qO;
  }
}
function EO(n, e) {
  if (n == e)
    return !0;
  for (let t = 0, i = 0; ; ) {
    for (; t < n.length && !n[t].hasResult; )
      t++;
    for (; i < e.length && !e[i].hasResult; )
      i++;
    let s = t == n.length, r = i == e.length;
    if (s || r)
      return s == r;
    if (n[t++].result != e[i++].result)
      return !1;
  }
}
const qO = {
  "aria-autocomplete": "list"
};
function al(n, e) {
  let t = {
    "aria-autocomplete": "list",
    "aria-haspopup": "listbox",
    "aria-controls": n
  };
  return e > -1 && (t["aria-activedescendant"] = n + "-" + e), t;
}
const IO = [];
function Hs(n) {
  return n.isUserEvent("input.type") ? "input" : n.isUserEvent("delete.backward") ? "delete" : null;
}
class ce {
  constructor(e, t, i = -1) {
    this.source = e, this.state = t, this.explicitPos = i;
  }
  hasResult() {
    return !1;
  }
  update(e, t) {
    let i = Hs(e), s = this;
    i ? s = s.handleUserEvent(e, i, t) : e.docChanged ? s = s.handleChange(e) : e.selection && s.state != 0 && (s = new ce(s.source, 0));
    for (let r of e.effects)
      if (r.is(yr))
        s = new ce(s.source, 1, r.value ? st(e.state) : -1);
      else if (r.is(bn))
        s = new ce(s.source, 0);
      else if (r.is(Qh))
        for (let o of r.value)
          o.source == s.source && (s = o);
    return s;
  }
  handleUserEvent(e, t, i) {
    return t == "delete" || !i.activateOnTyping ? this.map(e.changes) : new ce(this.source, 1);
  }
  handleChange(e) {
    return e.changes.touchesRange(st(e.startState)) ? new ce(this.source, 0) : this.map(e.changes);
  }
  map(e) {
    return e.empty || this.explicitPos < 0 ? this : new ce(this.source, this.state, e.mapPos(this.explicitPos));
  }
}
class oi extends ce {
  constructor(e, t, i, s, r) {
    super(e, 2, t), this.result = i, this.from = s, this.to = r;
  }
  hasResult() {
    return !0;
  }
  handleUserEvent(e, t, i) {
    var s;
    let r = e.changes.mapPos(this.from), o = e.changes.mapPos(this.to, 1), l = st(e.state);
    if ((this.explicitPos < 0 ? l <= r : l < this.from) || l > o || t == "delete" && st(e.startState) == this.from)
      return new ce(this.source, t == "input" && i.activateOnTyping ? 1 : 0);
    let a = this.explicitPos < 0 ? -1 : e.changes.mapPos(this.explicitPos), h;
    return zO(this.result.validFor, e.state, r, o) ? new oi(this.source, a, this.result, r, o) : this.result.update && (h = this.result.update(this.result, r, o, new Oh(e.state, l, a >= 0))) ? new oi(this.source, a, h, h.from, (s = h.to) !== null && s !== void 0 ? s : st(e.state)) : new ce(this.source, 1, a);
  }
  handleChange(e) {
    return e.changes.touchesRange(this.from, this.to) ? new ce(this.source, 0) : this.map(e.changes);
  }
  map(e) {
    return e.empty ? this : new oi(this.source, this.explicitPos < 0 ? -1 : e.mapPos(this.explicitPos), this.result, e.mapPos(this.from), e.mapPos(this.to, 1));
  }
}
function zO(n, e, t, i) {
  if (!n)
    return !1;
  let s = e.sliceDoc(t, i);
  return typeof n == "function" ? n(s, t, i, e) : gh(n, !0).test(s);
}
const yr = /* @__PURE__ */ C.define(), bn = /* @__PURE__ */ C.define(), Qh = /* @__PURE__ */ C.define({
  map(n, e) {
    return n.map((t) => t.map(e));
  }
}), yh = /* @__PURE__ */ C.define(), ye = /* @__PURE__ */ le.define({
  create() {
    return Sn.start();
  },
  update(n, e) {
    return n.update(e);
  },
  provide: (n) => [
    qa.from(n, (e) => e.tooltip),
    k.contentAttributes.from(n, (e) => e.attrs)
  ]
}), Sh = 75;
function qi(n, e = "option") {
  return (t) => {
    let i = t.state.field(ye, !1);
    if (!i || !i.open || Date.now() - i.open.timestamp < Sh)
      return !1;
    let s = 1, r;
    e == "page" && (r = vu(t, i.open.tooltip)) && (s = Math.max(2, Math.floor(r.dom.offsetHeight / r.dom.querySelector("li").offsetHeight) - 1));
    let { length: o } = i.open.options, l = i.open.selected > -1 ? i.open.selected + s * (n ? 1 : -1) : n ? 0 : o - 1;
    return l < 0 ? l = e == "page" ? 0 : o - 1 : l >= o && (l = e == "page" ? o - 1 : 0), t.dispatch({ effects: yh.of(l) }), !0;
  };
}
const BO = (n) => {
  let e = n.state.field(ye, !1);
  return n.state.readOnly || !e || !e.open || Date.now() - e.open.timestamp < Sh || e.open.selected < 0 ? !1 : (mh(n, e.open.options[e.open.selected]), !0);
}, GO = (n) => n.state.field(ye, !1) ? (n.dispatch({ effects: yr.of(!0) }), !0) : !1, LO = (n) => {
  let e = n.state.field(ye, !1);
  return !e || !e.active.some((t) => t.state != 0) ? !1 : (n.dispatch({ effects: bn.of(null) }), !0);
};
class _O {
  constructor(e, t) {
    this.active = e, this.context = t, this.time = Date.now(), this.updates = [], this.done = void 0;
  }
}
const hl = 50, NO = 50, VO = 1e3, UO = /* @__PURE__ */ oe.fromClass(class {
  constructor(n) {
    this.view = n, this.debounceUpdate = -1, this.running = [], this.debounceAccept = -1, this.composing = 0;
    for (let e of n.state.field(ye).active)
      e.state == 1 && this.startQuery(e);
  }
  update(n) {
    let e = n.state.field(ye);
    if (!n.selectionSet && !n.docChanged && n.startState.field(ye) == e)
      return;
    let t = n.transactions.some((i) => (i.selection || i.docChanged) && !Hs(i));
    for (let i = 0; i < this.running.length; i++) {
      let s = this.running[i];
      if (t || s.updates.length + n.transactions.length > NO && Date.now() - s.time > VO) {
        for (let r of s.context.abortListeners)
          try {
            r();
          } catch (o) {
            ve(this.view.state, o);
          }
        s.context.abortListeners = null, this.running.splice(i--, 1);
      } else
        s.updates.push(...n.transactions);
    }
    if (this.debounceUpdate > -1 && clearTimeout(this.debounceUpdate), this.debounceUpdate = e.active.some((i) => i.state == 1 && !this.running.some((s) => s.active.source == i.source)) ? setTimeout(() => this.startUpdate(), hl) : -1, this.composing != 0)
      for (let i of n.transactions)
        Hs(i) == "input" ? this.composing = 2 : this.composing == 2 && i.selection && (this.composing = 3);
  }
  startUpdate() {
    this.debounceUpdate = -1;
    let { state: n } = this.view, e = n.field(ye);
    for (let t of e.active)
      t.state == 1 && !this.running.some((i) => i.active.source == t.source) && this.startQuery(t);
  }
  startQuery(n) {
    let { state: e } = this.view, t = st(e), i = new Oh(e, t, n.explicitPos == t), s = new _O(n, i);
    this.running.push(s), Promise.resolve(n.source(i)).then((r) => {
      s.context.aborted || (s.done = r || null, this.scheduleAccept());
    }, (r) => {
      this.view.dispatch({ effects: bn.of(null) }), ve(this.view.state, r);
    });
  }
  scheduleAccept() {
    this.running.every((n) => n.done !== void 0) ? this.accept() : this.debounceAccept < 0 && (this.debounceAccept = setTimeout(() => this.accept(), hl));
  }
  accept() {
    var n;
    this.debounceAccept > -1 && clearTimeout(this.debounceAccept), this.debounceAccept = -1;
    let e = [], t = this.view.state.facet(Ie);
    for (let i = 0; i < this.running.length; i++) {
      let s = this.running[i];
      if (s.done === void 0)
        continue;
      if (this.running.splice(i--, 1), s.done) {
        let o = new oi(s.active.source, s.active.explicitPos, s.done, s.done.from, (n = s.done.to) !== null && n !== void 0 ? n : st(s.updates.length ? s.updates[0].startState : this.view.state));
        for (let l of s.updates)
          o = o.update(l, t);
        if (o.hasResult()) {
          e.push(o);
          continue;
        }
      }
      let r = this.view.state.field(ye).active.find((o) => o.source == s.active.source);
      if (r && r.state == 1)
        if (s.done == null) {
          let o = new ce(s.active.source, 0);
          for (let l of s.updates)
            o = o.update(l, t);
          o.state != 1 && e.push(o);
        } else
          this.startQuery(r);
    }
    e.length && this.view.dispatch({ effects: Qh.of(e) });
  }
}, {
  eventHandlers: {
    blur() {
      let n = this.view.state.field(ye, !1);
      n && n.tooltip && this.view.state.facet(Ie).closeOnBlur && this.view.dispatch({ effects: bn.of(null) });
    },
    compositionstart() {
      this.composing = 1;
    },
    compositionend() {
      this.composing == 3 && setTimeout(() => this.view.dispatch({ effects: yr.of(!1) }), 20), this.composing = 0;
    }
  }
}), bh = /* @__PURE__ */ k.baseTheme({
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
class FO {
  constructor(e, t, i, s) {
    this.field = e, this.line = t, this.from = i, this.to = s;
  }
}
class Sr {
  constructor(e, t, i) {
    this.field = e, this.from = t, this.to = i;
  }
  map(e) {
    let t = e.mapPos(this.from, -1, ne.TrackDel), i = e.mapPos(this.to, 1, ne.TrackDel);
    return t == null || i == null ? null : new Sr(this.field, t, i);
  }
}
class br {
  constructor(e, t) {
    this.lines = e, this.fieldPositions = t;
  }
  instantiate(e, t) {
    let i = [], s = [t], r = e.doc.lineAt(t), o = /^\s*/.exec(r.text)[0];
    for (let a of this.lines) {
      if (i.length) {
        let h = o, c = /^\t*/.exec(a)[0].length;
        for (let f = 0; f < c; f++)
          h += e.facet(yi);
        s.push(t + h.length - c), a = h + a.slice(c);
      }
      i.push(a), t += a.length + 1;
    }
    let l = this.fieldPositions.map((a) => new Sr(a.field, s[a.line] + a.from, s[a.line] + a.to));
    return { text: i, ranges: l };
  }
  static parse(e) {
    let t = [], i = [], s = [], r;
    for (let o of e.split(/\r\n?|\n/)) {
      for (; r = /[#$]\{(?:(\d+)(?::([^}]*))?|([^}]*))\}/.exec(o); ) {
        let l = r[1] ? +r[1] : null, a = r[2] || r[3] || "", h = -1;
        for (let c = 0; c < t.length; c++)
          (l != null ? t[c].seq == l : a ? t[c].name == a : !1) && (h = c);
        if (h < 0) {
          let c = 0;
          for (; c < t.length && (l == null || t[c].seq != null && t[c].seq < l); )
            c++;
          t.splice(c, 0, { seq: l, name: a }), h = c;
          for (let f of s)
            f.field >= h && f.field++;
        }
        s.push(new FO(h, i.length, r.index, r.index + a.length)), o = o.slice(0, r.index) + a + o.slice(r.index + r[0].length);
      }
      for (let l; l = /([$#])\\{/.exec(o); ) {
        o = o.slice(0, l.index) + l[1] + "{" + o.slice(l.index + l[0].length);
        for (let a of s)
          a.line == i.length && a.from > l.index && (a.from--, a.to--);
      }
      i.push(o);
    }
    return new br(i, s);
  }
}
let YO = /* @__PURE__ */ T.widget({ widget: /* @__PURE__ */ new class extends ft {
  toDOM() {
    let n = document.createElement("span");
    return n.className = "cm-snippetFieldPosition", n;
  }
  ignoreEvent() {
    return !1;
  }
}() }), HO = /* @__PURE__ */ T.mark({ class: "cm-snippetField" });
class Lt {
  constructor(e, t) {
    this.ranges = e, this.active = t, this.deco = T.set(e.map((i) => (i.from == i.to ? YO : HO).range(i.from, i.to)));
  }
  map(e) {
    let t = [];
    for (let i of this.ranges) {
      let s = i.map(e);
      if (!s)
        return null;
      t.push(s);
    }
    return new Lt(t, this.active);
  }
  selectionInsideField(e) {
    return e.ranges.every((t) => this.ranges.some((i) => i.field == this.active && i.from <= t.from && i.to >= t.to));
  }
}
const bi = /* @__PURE__ */ C.define({
  map(n, e) {
    return n && n.map(e);
  }
}), JO = /* @__PURE__ */ C.define(), pi = /* @__PURE__ */ le.define({
  create() {
    return null;
  },
  update(n, e) {
    for (let t of e.effects) {
      if (t.is(bi))
        return t.value;
      if (t.is(JO) && n)
        return new Lt(n.ranges, t.value);
    }
    return n && e.docChanged && (n = n.map(e.changes)), n && e.selection && !n.selectionInsideField(e.selection) && (n = null), n;
  },
  provide: (n) => k.decorations.from(n, (e) => e ? e.deco : T.none)
});
function xr(n, e) {
  return g.create(n.filter((t) => t.field == e).map((t) => g.range(t.from, t.to)));
}
function KO(n) {
  let e = br.parse(n);
  return (t, i, s, r) => {
    let { text: o, ranges: l } = e.instantiate(t.state, s), a = {
      changes: { from: s, to: r, insert: D.of(o) },
      scrollIntoView: !0
    };
    if (l.length && (a.selection = xr(l, 0)), l.length > 1) {
      let h = new Lt(l, 0), c = a.effects = [bi.of(h)];
      t.state.field(pi, !1) === void 0 && c.push(C.appendConfig.of([pi, sp, rp, bh]));
    }
    t.dispatch(t.state.update(a));
  };
}
function xh(n) {
  return ({ state: e, dispatch: t }) => {
    let i = e.field(pi, !1);
    if (!i || n < 0 && i.active == 0)
      return !1;
    let s = i.active + n, r = n > 0 && !i.ranges.some((o) => o.field == s + n);
    return t(e.update({
      selection: xr(i.ranges, s),
      effects: bi.of(r ? null : new Lt(i.ranges, s))
    })), !0;
  };
}
const ep = ({ state: n, dispatch: e }) => n.field(pi, !1) ? (e(n.update({ effects: bi.of(null) })), !0) : !1, tp = /* @__PURE__ */ xh(1), ip = /* @__PURE__ */ xh(-1), np = [
  { key: "Tab", run: tp, shift: ip },
  { key: "Escape", run: ep }
], cl = /* @__PURE__ */ x.define({
  combine(n) {
    return n.length ? n[0] : np;
  }
}), sp = /* @__PURE__ */ Gt.highest(/* @__PURE__ */ Wn.compute([cl], (n) => n.facet(cl)));
function we(n, e) {
  return Object.assign(Object.assign({}, e), { apply: KO(n) });
}
const rp = /* @__PURE__ */ k.domEventHandlers({
  mousedown(n, e) {
    let t = e.state.field(pi, !1), i;
    if (!t || (i = e.posAtCoords({ x: n.clientX, y: n.clientY })) == null)
      return !1;
    let s = t.ranges.find((r) => r.from <= i && r.to >= i);
    return !s || s.field == t.active ? !1 : (e.dispatch({
      selection: xr(t.ranges, s.field),
      effects: bi.of(t.ranges.some((r) => r.field > s.field) ? new Lt(t.ranges, s.field) : null)
    }), !0);
  }
}), xn = {
  brackets: ["(", "[", "{", "'", '"'],
  before: ")]}:;>"
}, pt = /* @__PURE__ */ C.define({
  map(n, e) {
    let t = e.mapPos(n, -1, ne.TrackAfter);
    return t == null ? void 0 : t;
  }
}), $r = /* @__PURE__ */ C.define({
  map(n, e) {
    return e.mapPos(n);
  }
}), kr = /* @__PURE__ */ new class extends yt {
}();
kr.startSide = 1;
kr.endSide = -1;
const $h = /* @__PURE__ */ le.define({
  create() {
    return j.empty;
  },
  update(n, e) {
    if (e.selection) {
      let t = e.state.doc.lineAt(e.selection.main.head).from, i = e.startState.doc.lineAt(e.startState.selection.main.head).from;
      t != e.changes.mapPos(i, -1) && (n = j.empty);
    }
    n = n.map(e.changes);
    for (let t of e.effects)
      t.is(pt) ? n = n.update({ add: [kr.range(t.value, t.value + 1)] }) : t.is($r) && (n = n.update({ filter: (i) => i != t.value }));
    return n;
  }
});
function op() {
  return [ap, $h];
}
const Os = "()[]{}<>";
function kh(n) {
  for (let e = 0; e < Os.length; e += 2)
    if (Os.charCodeAt(e) == n)
      return Os.charAt(e + 1);
  return sr(n < 128 ? n : n + 1);
}
function wh(n, e) {
  return n.languageDataAt("closeBrackets", e)[0] || xn;
}
const lp = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent), ap = /* @__PURE__ */ k.inputHandler.of((n, e, t, i) => {
  if ((lp ? n.composing : n.compositionStarted) || n.state.readOnly)
    return !1;
  let s = n.state.selection.main;
  if (i.length > 2 || i.length == 2 && pe(K(i, 0)) == 1 || e != s.from || t != s.to)
    return !1;
  let r = fp(n.state, i);
  return r ? (n.dispatch(r), !0) : !1;
}), hp = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let i = wh(n, n.selection.main.head).brackets || xn.brackets, s = null, r = n.changeByRange((o) => {
    if (o.empty) {
      let l = up(n.doc, o.head);
      for (let a of i)
        if (a == l && jn(n.doc, o.head) == kh(K(a, 0)))
          return {
            changes: { from: o.head - a.length, to: o.head + a.length },
            range: g.cursor(o.head - a.length),
            userEvent: "delete.backward"
          };
    }
    return { range: s = o };
  });
  return s || e(n.update(r, { scrollIntoView: !0 })), !s;
}, cp = [
  { key: "Backspace", run: hp }
];
function fp(n, e) {
  let t = wh(n, n.selection.main.head), i = t.brackets || xn.brackets;
  for (let s of i) {
    let r = kh(K(s, 0));
    if (e == s)
      return r == s ? pp(n, s, i.indexOf(s + s + s) > -1) : dp(n, s, r, t.before || xn.before);
    if (e == r && Th(n, n.selection.main.from))
      return Op(n, s, r);
  }
  return null;
}
function Th(n, e) {
  let t = !1;
  return n.field($h).between(0, n.doc.length, (i) => {
    i == e && (t = !0);
  }), t;
}
function jn(n, e) {
  let t = n.sliceString(e, e + 2);
  return t.slice(0, pe(K(t, 0)));
}
function up(n, e) {
  let t = n.sliceString(e - 2, e);
  return pe(K(t, 0)) == t.length ? t : t.slice(1);
}
function dp(n, e, t, i) {
  let s = null, r = n.changeByRange((o) => {
    if (!o.empty)
      return {
        changes: [{ insert: e, from: o.from }, { insert: t, from: o.to }],
        effects: pt.of(o.to + e.length),
        range: g.range(o.anchor + e.length, o.head + e.length)
      };
    let l = jn(n.doc, o.head);
    return !l || /\s/.test(l) || i.indexOf(l) > -1 ? {
      changes: { insert: e + t, from: o.head },
      effects: pt.of(o.head + e.length),
      range: g.cursor(o.head + e.length)
    } : { range: s = o };
  });
  return s ? null : n.update(r, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function Op(n, e, t) {
  let i = null, s = n.selection.ranges.map((r) => r.empty && jn(n.doc, r.head) == t ? g.cursor(r.head + t.length) : i = r);
  return i ? null : n.update({
    selection: g.create(s, n.selection.mainIndex),
    scrollIntoView: !0,
    effects: n.selection.ranges.map(({ from: r }) => $r.of(r))
  });
}
function pp(n, e, t) {
  let i = null, s = n.changeByRange((r) => {
    if (!r.empty)
      return {
        changes: [{ insert: e, from: r.from }, { insert: e, from: r.to }],
        effects: pt.of(r.to + e.length),
        range: g.range(r.anchor + e.length, r.head + e.length)
      };
    let o = r.head, l = jn(n.doc, o);
    if (l == e) {
      if (fl(n, o))
        return {
          changes: { insert: e + e, from: o },
          effects: pt.of(o + e.length),
          range: g.cursor(o + e.length)
        };
      if (Th(n, o)) {
        let a = t && n.sliceDoc(o, o + e.length * 3) == e + e + e;
        return {
          range: g.cursor(o + e.length * (a ? 3 : 1)),
          effects: $r.of(o)
        };
      }
    } else {
      if (t && n.sliceDoc(o - 2 * e.length, o) == e + e && fl(n, o - 2 * e.length))
        return {
          changes: { insert: e + e + e + e, from: o },
          effects: pt.of(o + e.length),
          range: g.cursor(o + e.length)
        };
      if (n.charCategorizer(o)(l) != se.Word) {
        let a = n.sliceDoc(o - 1, o);
        if (a != e && n.charCategorizer(o)(a) != se.Word && !gp(n, o, e))
          return {
            changes: { insert: e + e, from: o },
            effects: pt.of(o + e.length),
            range: g.cursor(o + e.length)
          };
      }
    }
    return { range: i = r };
  });
  return i ? null : n.update(s, {
    scrollIntoView: !0,
    userEvent: "input.type"
  });
}
function fl(n, e) {
  let t = U(n).resolveInner(e + 1);
  return t.parent && t.from == e;
}
function gp(n, e, t) {
  let i = U(n).resolveInner(e, -1);
  for (let s = 0; s < 5; s++) {
    if (n.sliceDoc(i.from, i.from + t.length) == t) {
      let o = i.firstChild;
      for (; o && o.from == i.from && o.to - o.from > t.length; ) {
        if (n.sliceDoc(o.to - t.length, o.to) == t)
          return !1;
        o = o.firstChild;
      }
      return !0;
    }
    let r = i.to == e && i.parent;
    if (!r)
      break;
    i = r;
  }
  return !1;
}
function mp(n = {}) {
  return [
    ye,
    Ie.of(n),
    UO,
    Qp,
    bh
  ];
}
const vh = [
  { key: "Ctrl-Space", run: GO },
  { key: "Escape", run: LO },
  { key: "ArrowDown", run: /* @__PURE__ */ qi(!0) },
  { key: "ArrowUp", run: /* @__PURE__ */ qi(!1) },
  { key: "PageDown", run: /* @__PURE__ */ qi(!0, "page") },
  { key: "PageUp", run: /* @__PURE__ */ qi(!1, "page") },
  { key: "Enter", run: BO }
], Qp = /* @__PURE__ */ Gt.highest(/* @__PURE__ */ Wn.computeN([Ie], (n) => n.facet(Ie).defaultKeymap ? [vh] : [])), yp = [
  /* @__PURE__ */ we("function ${name}(${params}) {\n	${}\n}", {
    label: "function",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ we("for (let ${index} = 0; ${index} < ${bound}; ${index}++) {\n	${}\n}", {
    label: "for",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ we("for (let ${name} of ${collection}) {\n	${}\n}", {
    label: "for",
    detail: "of loop",
    type: "keyword"
  }),
  /* @__PURE__ */ we("do {\n	${}\n} while (${})", {
    label: "do",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ we("while (${}) {\n	${}\n}", {
    label: "while",
    detail: "loop",
    type: "keyword"
  }),
  /* @__PURE__ */ we(`try {
	\${}
} catch (\${error}) {
	\${}
}`, {
    label: "try",
    detail: "/ catch block",
    type: "keyword"
  }),
  /* @__PURE__ */ we("if (${}) {\n	${}\n}", {
    label: "if",
    detail: "block",
    type: "keyword"
  }),
  /* @__PURE__ */ we(`if (\${}) {
	\${}
} else {
	\${}
}`, {
    label: "if",
    detail: "/ else block",
    type: "keyword"
  }),
  /* @__PURE__ */ we(`class \${name} {
	constructor(\${params}) {
		\${}
	}
}`, {
    label: "class",
    detail: "definition",
    type: "keyword"
  }),
  /* @__PURE__ */ we('import {${names}} from "${module}"\n${}', {
    label: "import",
    detail: "named",
    type: "keyword"
  }),
  /* @__PURE__ */ we('import ${name} from "${module}"\n${}', {
    label: "import",
    detail: "default",
    type: "keyword"
  })
], ul = /* @__PURE__ */ new Gu(), Ph = /* @__PURE__ */ new Set([
  "Script",
  "Block",
  "FunctionExpression",
  "FunctionDeclaration",
  "ArrowFunction",
  "MethodDeclaration",
  "ForStatement"
]);
function Yt(n) {
  return (e, t) => {
    let i = e.node.getChild("VariableDefinition");
    return i && t(i, n), !0;
  };
}
const Sp = ["FunctionDeclaration"], bp = {
  FunctionDeclaration: /* @__PURE__ */ Yt("function"),
  ClassDeclaration: /* @__PURE__ */ Yt("class"),
  ClassExpression: () => !0,
  EnumDeclaration: /* @__PURE__ */ Yt("constant"),
  TypeAliasDeclaration: /* @__PURE__ */ Yt("type"),
  NamespaceDeclaration: /* @__PURE__ */ Yt("namespace"),
  VariableDefinition(n, e) {
    n.matchContext(Sp) || e(n, "variable");
  },
  TypeDefinition(n, e) {
    e(n, "type");
  },
  __proto__: null
};
function Ch(n, e) {
  let t = ul.get(e);
  if (t)
    return t;
  let i = [], s = !0;
  function r(o, l) {
    let a = n.sliceString(o.from, o.to);
    i.push({ label: a, type: l });
  }
  return e.cursor(F.IncludeAnonymous).iterate((o) => {
    if (s)
      s = !1;
    else if (o.name) {
      let l = bp[o.name];
      if (l && l(o, r) || Ph.has(o.name))
        return !1;
    } else if (o.to - o.from > 8192) {
      for (let l of Ch(n, o.node))
        i.push(l);
      return !1;
    }
  }), ul.set(e, i), i;
}
const dl = /^[\w$\xa1-\uffff][\w$\d\xa1-\uffff]*$/, Rh = [
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
function xp(n) {
  let e = U(n.state).resolveInner(n.pos, -1);
  if (Rh.indexOf(e.name) > -1)
    return null;
  let t = e.to - e.from < 20 && dl.test(n.state.sliceDoc(e.from, e.to));
  if (!t && !n.explicit)
    return null;
  let i = [];
  for (let s = e; s; s = s.parent)
    Ph.has(s.name) && (i = i.concat(Ch(n.state.doc, s)));
  return {
    options: i,
    from: t ? e.from : n.pos,
    validFor: dl
  };
}
const Qt = /* @__PURE__ */ pn.define({
  parser: /* @__PURE__ */ Dd.configure({
    props: [
      /* @__PURE__ */ eh.add({
        IfStatement: /* @__PURE__ */ cs({ except: /^\s*({|else\b)/ }),
        TryStatement: /* @__PURE__ */ cs({ except: /^\s*({|catch\b|finally\b)/ }),
        LabeledStatement: Ud,
        SwitchBody: (n) => {
          let e = n.textAfter, t = /^\s*\}/.test(e), i = /^\s*(case|default)\b/.test(e);
          return n.baseIndent + (t ? 0 : i ? 1 : 2) * n.unit;
        },
        Block: /* @__PURE__ */ Vd({ closing: "}" }),
        ArrowFunction: (n) => n.baseIndent + n.unit,
        "TemplateString BlockComment": () => null,
        "Statement Property": /* @__PURE__ */ cs({ except: /^{/ }),
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
      /* @__PURE__ */ nh.add({
        "Block ClassBody SwitchBody EnumBody ObjectExpression ArrayExpression": Jd,
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
}), $p = /* @__PURE__ */ Qt.configure({ dialect: "ts" }), kp = /* @__PURE__ */ Qt.configure({ dialect: "jsx" }), wp = /* @__PURE__ */ Qt.configure({ dialect: "jsx ts" }), Tp = /* @__PURE__ */ "break case const continue default delete export extends false finally in instanceof let new return static super switch this throw true typeof var yield".split(" ").map((n) => ({ label: n, type: "keyword" }));
function vp(n = {}) {
  let e = n.jsx ? n.typescript ? wp : kp : n.typescript ? $p : Qt;
  return new qd(e, [
    Qt.data.of({
      autocomplete: PO(Rh, ph(yp.concat(Tp)))
    }),
    Qt.data.of({
      autocomplete: xp
    }),
    n.jsx ? Cp : []
  ]);
}
function Ol(n, e, t = n.length) {
  if (!e)
    return "";
  let i = e.getChild("JSXIdentifier");
  return i ? n.sliceString(i.from, Math.min(i.to, t)) : "";
}
const Pp = typeof navigator == "object" && /* @__PURE__ */ /Android\b/.test(navigator.userAgent), Cp = /* @__PURE__ */ k.inputHandler.of((n, e, t, i) => {
  if ((Pp ? n.composing : n.compositionStarted) || n.state.readOnly || e != t || i != ">" && i != "/" || !Qt.isActiveAt(n.state, e, -1))
    return !1;
  let { state: s } = n, r = s.changeByRange((o) => {
    var l, a, h;
    let { head: c } = o, f = U(s).resolveInner(c, -1), u;
    if (f.name == "JSXStartTag" && (f = f.parent), i == ">" && f.name == "JSXFragmentTag")
      return { range: g.cursor(c + 1), changes: { from: c, insert: "><>" } };
    if (i == ">" && f.name == "JSXIdentifier") {
      if (((a = (l = f.parent) === null || l === void 0 ? void 0 : l.lastChild) === null || a === void 0 ? void 0 : a.name) != "JSXEndTag" && (u = Ol(s.doc, f.parent, c)))
        return { range: g.cursor(c + 1), changes: { from: c, insert: `></${u}>` } };
    } else if (i == "/" && f.name == "JSXFragmentTag") {
      let d = f.parent, O = d == null ? void 0 : d.parent;
      if (d.from == c - 1 && ((h = O.lastChild) === null || h === void 0 ? void 0 : h.name) != "JSXEndTag" && (u = Ol(s.doc, O == null ? void 0 : O.firstChild, c))) {
        let m = `/${u}>`;
        return { range: g.cursor(c + m.length), changes: { from: c, insert: m } };
      }
    }
    return { range: o };
  });
  return r.changes.empty ? !1 : (n.dispatch(r, { userEvent: "input.type", scrollIntoView: !0 }), !0);
}), Rp = (n) => {
  let e = Tr(n.state);
  return e.line ? Ap(n) : e.block ? Wp(n) : !1;
};
function wr(n, e) {
  return ({ state: t, dispatch: i }) => {
    if (t.readOnly)
      return !1;
    let s = n(e, t);
    return s ? (i(t.update(s)), !0) : !1;
  };
}
const Ap = /* @__PURE__ */ wr(Xp, 0), Mp = /* @__PURE__ */ wr(Ah, 0), Wp = /* @__PURE__ */ wr((n, e) => Ah(n, e, Dp(e)), 0);
function Tr(n, e = n.selection.main.head) {
  let t = n.languageDataAt("commentTokens", e);
  return t.length ? t[0] : {};
}
const Ht = 50;
function Zp(n, { open: e, close: t }, i, s) {
  let r = n.sliceDoc(i - Ht, i), o = n.sliceDoc(s, s + Ht), l = /\s*$/.exec(r)[0].length, a = /^\s*/.exec(o)[0].length, h = r.length - l;
  if (r.slice(h - e.length, h) == e && o.slice(a, a + t.length) == t)
    return {
      open: { pos: i - l, margin: l && 1 },
      close: { pos: s + a, margin: a && 1 }
    };
  let c, f;
  s - i <= 2 * Ht ? c = f = n.sliceDoc(i, s) : (c = n.sliceDoc(i, i + Ht), f = n.sliceDoc(s - Ht, s));
  let u = /^\s*/.exec(c)[0].length, d = /\s*$/.exec(f)[0].length, O = f.length - d - t.length;
  return c.slice(u, u + e.length) == e && f.slice(O, O + t.length) == t ? {
    open: {
      pos: i + u + e.length,
      margin: /\s/.test(c.charAt(u + e.length)) ? 1 : 0
    },
    close: {
      pos: s - d - t.length,
      margin: /\s/.test(f.charAt(O - 1)) ? 1 : 0
    }
  } : null;
}
function Dp(n) {
  let e = [];
  for (let t of n.selection.ranges) {
    let i = n.doc.lineAt(t.from), s = t.to <= i.to ? i : n.doc.lineAt(t.to), r = e.length - 1;
    r >= 0 && e[r].to > i.from ? e[r].to = s.to : e.push({ from: i.from, to: s.to });
  }
  return e;
}
function Ah(n, e, t = e.selection.ranges) {
  let i = t.map((r) => Tr(e, r.from).block);
  if (!i.every((r) => r))
    return null;
  let s = t.map((r, o) => Zp(e, i[o], r.from, r.to));
  if (n != 2 && !s.every((r) => r))
    return { changes: e.changes(t.map((r, o) => s[o] ? [] : [{ from: r.from, insert: i[o].open + " " }, { from: r.to, insert: " " + i[o].close }])) };
  if (n != 1 && s.some((r) => r)) {
    let r = [];
    for (let o = 0, l; o < s.length; o++)
      if (l = s[o]) {
        let a = i[o], { open: h, close: c } = l;
        r.push({ from: h.pos - a.open.length, to: h.pos + h.margin }, { from: c.pos - c.margin, to: c.pos + a.close.length });
      }
    return { changes: r };
  }
  return null;
}
function Xp(n, e, t = e.selection.ranges) {
  let i = [], s = -1;
  for (let { from: r, to: o } of t) {
    let l = i.length, a = 1e9;
    for (let h = r; h <= o; ) {
      let c = e.doc.lineAt(h);
      if (c.from > s && (r == o || o > c.from)) {
        s = c.from;
        let f = Tr(e, h).line;
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
  if (n != 2 && i.some((r) => r.comment < 0 && (!r.empty || r.single))) {
    let r = [];
    for (let { line: l, token: a, indent: h, empty: c, single: f } of i)
      (f || !c) && r.push({ from: l.from + h, insert: a + " " });
    let o = e.changes(r);
    return { changes: o, selection: e.selection.map(o, 1) };
  } else if (n != 1 && i.some((r) => r.comment >= 0)) {
    let r = [];
    for (let { line: o, comment: l, token: a } of i)
      if (l >= 0) {
        let h = o.from + l, c = h + a.length;
        o.text[c - o.from] == " " && c++, r.push({ from: h, to: c });
      }
    return { changes: r };
  }
  return null;
}
const Js = /* @__PURE__ */ xt.define(), jp = /* @__PURE__ */ xt.define(), Ep = /* @__PURE__ */ x.define(), Mh = /* @__PURE__ */ x.define({
  combine(n) {
    return $t(n, {
      minDepth: 100,
      newGroupDelay: 500
    }, { minDepth: Math.max, newGroupDelay: Math.min });
  }
});
function qp(n) {
  let e = 0;
  return n.iterChangedRanges((t, i) => e = i), e;
}
const Wh = /* @__PURE__ */ le.define({
  create() {
    return je.empty;
  },
  update(n, e) {
    let t = e.state.facet(Mh), i = e.annotation(Js);
    if (i) {
      let a = e.docChanged ? g.single(qp(e.changes)) : void 0, h = fe.fromTransaction(e, a), c = i.side, f = c == 0 ? n.undone : n.done;
      return h ? f = $n(f, f.length, t.minDepth, h) : f = Xh(f, e.startState.selection), new je(c == 0 ? i.rest : f, c == 0 ? f : i.rest);
    }
    let s = e.annotation(jp);
    if ((s == "full" || s == "before") && (n = n.isolate()), e.annotation(N.addToHistory) === !1)
      return e.changes.empty ? n : n.addMapping(e.changes.desc);
    let r = fe.fromTransaction(e), o = e.annotation(N.time), l = e.annotation(N.userEvent);
    return r ? n = n.addChanges(r, o, l, t.newGroupDelay, t.minDepth) : e.selection && (n = n.addSelection(e.startState.selection, o, l, t.newGroupDelay)), (s == "full" || s == "after") && (n = n.isolate()), n;
  },
  toJSON(n) {
    return { done: n.done.map((e) => e.toJSON()), undone: n.undone.map((e) => e.toJSON()) };
  },
  fromJSON(n) {
    return new je(n.done.map(fe.fromJSON), n.undone.map(fe.fromJSON));
  }
});
function Ip(n = {}) {
  return [
    Wh,
    Mh.of(n),
    k.domEventHandlers({
      beforeinput(e, t) {
        let i = e.inputType == "historyUndo" ? Zh : e.inputType == "historyRedo" ? Ks : null;
        return i ? (e.preventDefault(), i(t)) : !1;
      }
    })
  ];
}
function En(n, e) {
  return function({ state: t, dispatch: i }) {
    if (!e && t.readOnly)
      return !1;
    let s = t.field(Wh, !1);
    if (!s)
      return !1;
    let r = s.pop(n, t, e);
    return r ? (i(r), !0) : !1;
  };
}
const Zh = /* @__PURE__ */ En(0, !1), Ks = /* @__PURE__ */ En(1, !1), zp = /* @__PURE__ */ En(0, !0), Bp = /* @__PURE__ */ En(1, !0);
class fe {
  constructor(e, t, i, s, r) {
    this.changes = e, this.effects = t, this.mapped = i, this.startSelection = s, this.selectionsAfter = r;
  }
  setSelAfter(e) {
    return new fe(this.changes, this.effects, this.mapped, this.startSelection, e);
  }
  toJSON() {
    var e, t, i;
    return {
      changes: (e = this.changes) === null || e === void 0 ? void 0 : e.toJSON(),
      mapped: (t = this.mapped) === null || t === void 0 ? void 0 : t.toJSON(),
      startSelection: (i = this.startSelection) === null || i === void 0 ? void 0 : i.toJSON(),
      selectionsAfter: this.selectionsAfter.map((s) => s.toJSON())
    };
  }
  static fromJSON(e) {
    return new fe(e.changes && _.fromJSON(e.changes), [], e.mapped && Ee.fromJSON(e.mapped), e.startSelection && g.fromJSON(e.startSelection), e.selectionsAfter.map(g.fromJSON));
  }
  static fromTransaction(e, t) {
    let i = Se;
    for (let s of e.startState.facet(Ep)) {
      let r = s(e);
      r.length && (i = i.concat(r));
    }
    return !i.length && e.changes.empty ? null : new fe(e.changes.invert(e.startState.doc), i, void 0, t || e.startState.selection, Se);
  }
  static selection(e) {
    return new fe(void 0, Se, void 0, void 0, e);
  }
}
function $n(n, e, t, i) {
  let s = e + 1 > t + 20 ? e - t - 1 : 0, r = n.slice(s, e);
  return r.push(i), r;
}
function Gp(n, e) {
  let t = [], i = !1;
  return n.iterChangedRanges((s, r) => t.push(s, r)), e.iterChangedRanges((s, r, o, l) => {
    for (let a = 0; a < t.length; ) {
      let h = t[a++], c = t[a++];
      l >= h && o <= c && (i = !0);
    }
  }), i;
}
function Lp(n, e) {
  return n.ranges.length == e.ranges.length && n.ranges.filter((t, i) => t.empty != e.ranges[i].empty).length === 0;
}
function Dh(n, e) {
  return n.length ? e.length ? n.concat(e) : n : e;
}
const Se = [], _p = 200;
function Xh(n, e) {
  if (n.length) {
    let t = n[n.length - 1], i = t.selectionsAfter.slice(Math.max(0, t.selectionsAfter.length - _p));
    return i.length && i[i.length - 1].eq(e) ? n : (i.push(e), $n(n, n.length - 1, 1e9, t.setSelAfter(i)));
  } else
    return [fe.selection([e])];
}
function Np(n) {
  let e = n[n.length - 1], t = n.slice();
  return t[n.length - 1] = e.setSelAfter(e.selectionsAfter.slice(0, e.selectionsAfter.length - 1)), t;
}
function ps(n, e) {
  if (!n.length)
    return n;
  let t = n.length, i = Se;
  for (; t; ) {
    let s = Vp(n[t - 1], e, i);
    if (s.changes && !s.changes.empty || s.effects.length) {
      let r = n.slice(0, t);
      return r[t - 1] = s, r;
    } else
      e = s.mapped, t--, i = s.selectionsAfter;
  }
  return i.length ? [fe.selection(i)] : Se;
}
function Vp(n, e, t) {
  let i = Dh(n.selectionsAfter.length ? n.selectionsAfter.map((l) => l.map(e)) : Se, t);
  if (!n.changes)
    return fe.selection(i);
  let s = n.changes.map(e), r = e.mapDesc(n.changes, !0), o = n.mapped ? n.mapped.composeDesc(r) : r;
  return new fe(s, C.mapEffects(n.effects, e), o, n.startSelection.map(r), i);
}
const Up = /^(input\.type|delete)($|\.)/;
class je {
  constructor(e, t, i = 0, s = void 0) {
    this.done = e, this.undone = t, this.prevTime = i, this.prevUserEvent = s;
  }
  isolate() {
    return this.prevTime ? new je(this.done, this.undone) : this;
  }
  addChanges(e, t, i, s, r) {
    let o = this.done, l = o[o.length - 1];
    return l && l.changes && !l.changes.empty && e.changes && (!i || Up.test(i)) && (!l.selectionsAfter.length && t - this.prevTime < s && Gp(l.changes, e.changes) || i == "input.type.compose") ? o = $n(o, o.length - 1, r, new fe(e.changes.compose(l.changes), Dh(e.effects, l.effects), l.mapped, l.startSelection, Se)) : o = $n(o, o.length, r, e), new je(o, Se, t, i);
  }
  addSelection(e, t, i, s) {
    let r = this.done.length ? this.done[this.done.length - 1].selectionsAfter : Se;
    return r.length > 0 && t - this.prevTime < s && i == this.prevUserEvent && i && /^select($|\.)/.test(i) && Lp(r[r.length - 1], e) ? this : new je(Xh(this.done, e), this.undone, t, i);
  }
  addMapping(e) {
    return new je(ps(this.done, e), ps(this.undone, e), this.prevTime, this.prevUserEvent);
  }
  pop(e, t, i) {
    let s = e == 0 ? this.done : this.undone;
    if (s.length == 0)
      return null;
    let r = s[s.length - 1];
    if (i && r.selectionsAfter.length)
      return t.update({
        selection: r.selectionsAfter[r.selectionsAfter.length - 1],
        annotations: Js.of({ side: e, rest: Np(s) }),
        userEvent: e == 0 ? "select.undo" : "select.redo",
        scrollIntoView: !0
      });
    if (r.changes) {
      let o = s.length == 1 ? Se : s.slice(0, s.length - 1);
      return r.mapped && (o = ps(o, r.mapped)), t.update({
        changes: r.changes,
        selection: r.startSelection,
        effects: r.effects,
        annotations: Js.of({ side: e, rest: o }),
        filter: !1,
        userEvent: e == 0 ? "undo" : "redo",
        scrollIntoView: !0
      });
    } else
      return null;
  }
}
je.empty = /* @__PURE__ */ new je(Se, Se);
const Fp = [
  { key: "Mod-z", run: Zh, preventDefault: !0 },
  { key: "Mod-y", mac: "Mod-Shift-z", run: Ks, preventDefault: !0 },
  { linux: "Ctrl-Shift-z", run: Ks, preventDefault: !0 },
  { key: "Mod-u", run: zp, preventDefault: !0 },
  { key: "Alt-u", mac: "Mod-Shift-u", run: Bp, preventDefault: !0 }
];
function _t(n, e) {
  return g.create(n.ranges.map(e), n.mainIndex);
}
function ze(n, e) {
  return n.update({ selection: e, scrollIntoView: !0, userEvent: "select" });
}
function Ue({ state: n, dispatch: e }, t) {
  let i = _t(n.selection, t);
  return i.eq(n.selection) ? !1 : (e(ze(n, i)), !0);
}
function qn(n, e) {
  return g.cursor(e ? n.to : n.from);
}
function jh(n, e) {
  return Ue(n, (t) => t.empty ? n.moveByChar(t, e) : qn(t, e));
}
function be(n) {
  return n.textDirectionAt(n.state.selection.main.head) == V.LTR;
}
const Eh = (n) => jh(n, !be(n)), qh = (n) => jh(n, be(n));
function Ih(n, e) {
  return Ue(n, (t) => t.empty ? n.moveByGroup(t, e) : qn(t, e));
}
const Yp = (n) => Ih(n, !be(n)), Hp = (n) => Ih(n, be(n));
function Jp(n, e, t) {
  if (e.type.prop(t))
    return !0;
  let i = e.to - e.from;
  return i && (i > 2 || /[^\s,.;:]/.test(n.sliceDoc(e.from, e.to))) || e.firstChild;
}
function In(n, e, t) {
  let i = U(n).resolveInner(e.head), s = t ? R.closedBy : R.openedBy;
  for (let a = e.head; ; ) {
    let h = t ? i.childAfter(a) : i.childBefore(a);
    if (!h)
      break;
    Jp(n, h, s) ? i = h : a = t ? h.to : h.from;
  }
  let r = i.type.prop(s), o, l;
  return r && (o = t ? Xe(n, i.from, 1) : Xe(n, i.to, -1)) && o.matched ? l = t ? o.end.to : o.end.from : l = t ? i.to : i.from, g.cursor(l, t ? -1 : 1);
}
const Kp = (n) => Ue(n, (e) => In(n.state, e, !be(n))), eg = (n) => Ue(n, (e) => In(n.state, e, be(n)));
function zh(n, e) {
  return Ue(n, (t) => {
    if (!t.empty)
      return qn(t, e);
    let i = n.moveVertically(t, e);
    return i.head != t.head ? i : n.moveToLineBoundary(t, e);
  });
}
const Bh = (n) => zh(n, !1), Gh = (n) => zh(n, !0);
function Lh(n) {
  return Math.max(n.defaultLineHeight, Math.min(n.dom.clientHeight, innerHeight) - 5);
}
function _h(n, e) {
  let { state: t } = n, i = _t(t.selection, (l) => l.empty ? n.moveVertically(l, e, Lh(n)) : qn(l, e));
  if (i.eq(t.selection))
    return !1;
  let s = n.coordsAtPos(t.selection.main.head), r = n.scrollDOM.getBoundingClientRect(), o;
  return s && s.top > r.top && s.bottom < r.bottom && s.top - r.top <= n.scrollDOM.scrollHeight - n.scrollDOM.scrollTop - n.scrollDOM.clientHeight && (o = k.scrollIntoView(i.main.head, { y: "start", yMargin: s.top - r.top })), n.dispatch(ze(t, i), { effects: o }), !0;
}
const pl = (n) => _h(n, !1), er = (n) => _h(n, !0);
function zn(n, e, t) {
  let i = n.lineBlockAt(e.head), s = n.moveToLineBoundary(e, t);
  if (s.head == e.head && s.head != (t ? i.to : i.from) && (s = n.moveToLineBoundary(e, t, !1)), !t && s.head == i.from && i.length) {
    let r = /^\s*/.exec(n.state.sliceDoc(i.from, Math.min(i.from + 100, i.to)))[0].length;
    r && e.head != i.from + r && (s = g.cursor(i.from + r));
  }
  return s;
}
const gl = (n) => Ue(n, (e) => zn(n, e, !0)), ml = (n) => Ue(n, (e) => zn(n, e, !1)), tg = (n) => Ue(n, (e) => g.cursor(n.lineBlockAt(e.head).from, 1)), ig = (n) => Ue(n, (e) => g.cursor(n.lineBlockAt(e.head).to, -1));
function ng(n, e, t) {
  let i = !1, s = _t(n.selection, (r) => {
    let o = Xe(n, r.head, -1) || Xe(n, r.head, 1) || r.head > 0 && Xe(n, r.head - 1, 1) || r.head < n.doc.length && Xe(n, r.head + 1, -1);
    if (!o || !o.end)
      return r;
    i = !0;
    let l = o.start.from == r.head ? o.end.to : o.end.from;
    return t ? g.range(r.anchor, l) : g.cursor(l);
  });
  return i ? (e(ze(n, s)), !0) : !1;
}
const sg = ({ state: n, dispatch: e }) => ng(n, e, !1);
function Be(n, e) {
  let t = _t(n.state.selection, (i) => {
    let s = e(i);
    return g.range(i.anchor, s.head, s.goalColumn);
  });
  return t.eq(n.state.selection) ? !1 : (n.dispatch(ze(n.state, t)), !0);
}
function Nh(n, e) {
  return Be(n, (t) => n.moveByChar(t, e));
}
const Vh = (n) => Nh(n, !be(n)), Uh = (n) => Nh(n, be(n));
function Fh(n, e) {
  return Be(n, (t) => n.moveByGroup(t, e));
}
const rg = (n) => Fh(n, !be(n)), og = (n) => Fh(n, be(n)), lg = (n) => Be(n, (e) => In(n.state, e, !be(n))), ag = (n) => Be(n, (e) => In(n.state, e, be(n)));
function Yh(n, e) {
  return Be(n, (t) => n.moveVertically(t, e));
}
const Hh = (n) => Yh(n, !1), Jh = (n) => Yh(n, !0);
function Kh(n, e) {
  return Be(n, (t) => n.moveVertically(t, e, Lh(n)));
}
const Ql = (n) => Kh(n, !1), yl = (n) => Kh(n, !0), Sl = (n) => Be(n, (e) => zn(n, e, !0)), bl = (n) => Be(n, (e) => zn(n, e, !1)), hg = (n) => Be(n, (e) => g.cursor(n.lineBlockAt(e.head).from)), cg = (n) => Be(n, (e) => g.cursor(n.lineBlockAt(e.head).to)), xl = ({ state: n, dispatch: e }) => (e(ze(n, { anchor: 0 })), !0), $l = ({ state: n, dispatch: e }) => (e(ze(n, { anchor: n.doc.length })), !0), kl = ({ state: n, dispatch: e }) => (e(ze(n, { anchor: n.selection.main.anchor, head: 0 })), !0), wl = ({ state: n, dispatch: e }) => (e(ze(n, { anchor: n.selection.main.anchor, head: n.doc.length })), !0), fg = ({ state: n, dispatch: e }) => (e(n.update({ selection: { anchor: 0, head: n.doc.length }, userEvent: "select" })), !0), ug = ({ state: n, dispatch: e }) => {
  let t = Ln(n).map(({ from: i, to: s }) => g.range(i, Math.min(s + 1, n.doc.length)));
  return e(n.update({ selection: g.create(t), userEvent: "select" })), !0;
}, dg = ({ state: n, dispatch: e }) => {
  let t = _t(n.selection, (i) => {
    var s;
    let r = U(n).resolveInner(i.head, 1);
    for (; !(r.from < i.from && r.to >= i.to || r.to > i.to && r.from <= i.from || !(!((s = r.parent) === null || s === void 0) && s.parent)); )
      r = r.parent;
    return g.range(r.to, r.from);
  });
  return e(ze(n, t)), !0;
}, Og = ({ state: n, dispatch: e }) => {
  let t = n.selection, i = null;
  return t.ranges.length > 1 ? i = g.create([t.main]) : t.main.empty || (i = g.create([g.cursor(t.main.head)])), i ? (e(ze(n, i)), !0) : !1;
};
function Bn({ state: n, dispatch: e }, t) {
  if (n.readOnly)
    return !1;
  let i = "delete.selection", s = n.changeByRange((r) => {
    let { from: o, to: l } = r;
    if (o == l) {
      let a = t(o);
      a < o ? i = "delete.backward" : a > o && (i = "delete.forward"), o = Math.min(o, a), l = Math.max(l, a);
    }
    return o == l ? { range: r } : { changes: { from: o, to: l }, range: g.cursor(o) };
  });
  return s.changes.empty ? !1 : (e(n.update(s, {
    scrollIntoView: !0,
    userEvent: i,
    effects: i == "delete.selection" ? k.announce.of(n.phrase("Selection deleted")) : void 0
  })), !0);
}
function Gn(n, e, t) {
  if (n instanceof k)
    for (let i of n.state.facet(k.atomicRanges).map((s) => s(n)))
      i.between(e, e, (s, r) => {
        s < e && r > e && (e = t ? r : s);
      });
  return e;
}
const ec = (n, e) => Bn(n, (t) => {
  let { state: i } = n, s = i.doc.lineAt(t), r, o;
  if (!e && t > s.from && t < s.from + 200 && !/[^ \t]/.test(r = s.text.slice(0, t - s.from))) {
    if (r[r.length - 1] == "	")
      return t - 1;
    let l = Pn(r, i.tabSize), a = l % mn(i) || mn(i);
    for (let h = 0; h < a && r[r.length - 1 - h] == " "; h++)
      t--;
    o = t;
  } else
    o = me(s.text, t - s.from, e, e) + s.from, o == t && s.number != (e ? i.doc.lines : 1) && (o += e ? 1 : -1);
  return Gn(n, o, e);
}), tr = (n) => ec(n, !1), tc = (n) => ec(n, !0), ic = (n, e) => Bn(n, (t) => {
  let i = t, { state: s } = n, r = s.doc.lineAt(i), o = s.charCategorizer(i);
  for (let l = null; ; ) {
    if (i == (e ? r.to : r.from)) {
      i == t && r.number != (e ? s.doc.lines : 1) && (i += e ? 1 : -1);
      break;
    }
    let a = me(r.text, i - r.from, e) + r.from, h = r.text.slice(Math.min(i, a) - r.from, Math.max(i, a) - r.from), c = o(h);
    if (l != null && c != l)
      break;
    (h != " " || i != t) && (l = c), i = a;
  }
  return Gn(n, i, e);
}), nc = (n) => ic(n, !1), pg = (n) => ic(n, !0), sc = (n) => Bn(n, (e) => {
  let t = n.lineBlockAt(e).to;
  return Gn(n, e < t ? t : Math.min(n.state.doc.length, e + 1), !0);
}), gg = (n) => Bn(n, (e) => {
  let t = n.lineBlockAt(e).from;
  return Gn(n, e > t ? t : Math.max(0, e - 1), !1);
}), mg = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = n.changeByRange((i) => ({
    changes: { from: i.from, to: i.to, insert: D.of(["", ""]) },
    range: g.cursor(i.from)
  }));
  return e(n.update(t, { scrollIntoView: !0, userEvent: "input" })), !0;
}, Qg = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = n.changeByRange((i) => {
    if (!i.empty || i.from == 0 || i.from == n.doc.length)
      return { range: i };
    let s = i.from, r = n.doc.lineAt(s), o = s == r.from ? s - 1 : me(r.text, s - r.from, !1) + r.from, l = s == r.to ? s + 1 : me(r.text, s - r.from, !0) + r.from;
    return {
      changes: { from: o, to: l, insert: n.doc.slice(s, l).append(n.doc.slice(o, s)) },
      range: g.cursor(l)
    };
  });
  return t.changes.empty ? !1 : (e(n.update(t, { scrollIntoView: !0, userEvent: "move.character" })), !0);
};
function Ln(n) {
  let e = [], t = -1;
  for (let i of n.selection.ranges) {
    let s = n.doc.lineAt(i.from), r = n.doc.lineAt(i.to);
    if (!i.empty && i.to == r.from && (r = n.doc.lineAt(i.to - 1)), t >= s.number) {
      let o = e[e.length - 1];
      o.to = r.to, o.ranges.push(i);
    } else
      e.push({ from: s.from, to: r.to, ranges: [i] });
    t = r.number + 1;
  }
  return e;
}
function rc(n, e, t) {
  if (n.readOnly)
    return !1;
  let i = [], s = [];
  for (let r of Ln(n)) {
    if (t ? r.to == n.doc.length : r.from == 0)
      continue;
    let o = n.doc.lineAt(t ? r.to + 1 : r.from - 1), l = o.length + 1;
    if (t) {
      i.push({ from: r.to, to: o.to }, { from: r.from, insert: o.text + n.lineBreak });
      for (let a of r.ranges)
        s.push(g.range(Math.min(n.doc.length, a.anchor + l), Math.min(n.doc.length, a.head + l)));
    } else {
      i.push({ from: o.from, to: r.from }, { from: r.to, insert: n.lineBreak + o.text });
      for (let a of r.ranges)
        s.push(g.range(a.anchor - l, a.head - l));
    }
  }
  return i.length ? (e(n.update({
    changes: i,
    scrollIntoView: !0,
    selection: g.create(s, n.selection.mainIndex),
    userEvent: "move.line"
  })), !0) : !1;
}
const yg = ({ state: n, dispatch: e }) => rc(n, e, !1), Sg = ({ state: n, dispatch: e }) => rc(n, e, !0);
function oc(n, e, t) {
  if (n.readOnly)
    return !1;
  let i = [];
  for (let s of Ln(n))
    t ? i.push({ from: s.from, insert: n.doc.slice(s.from, s.to) + n.lineBreak }) : i.push({ from: s.to, insert: n.lineBreak + n.doc.slice(s.from, s.to) });
  return e(n.update({ changes: i, scrollIntoView: !0, userEvent: "input.copyline" })), !0;
}
const bg = ({ state: n, dispatch: e }) => oc(n, e, !1), xg = ({ state: n, dispatch: e }) => oc(n, e, !0), $g = (n) => {
  if (n.state.readOnly)
    return !1;
  let { state: e } = n, t = e.changes(Ln(e).map(({ from: s, to: r }) => (s > 0 ? s-- : r < e.doc.length && r++, { from: s, to: r }))), i = _t(e.selection, (s) => n.moveVertically(s, !0)).map(t);
  return n.dispatch({ changes: t, selection: i, scrollIntoView: !0, userEvent: "delete.line" }), !0;
};
function kg(n, e) {
  if (/\(\)|\[\]|\{\}/.test(n.sliceDoc(e - 1, e + 1)))
    return { from: e, to: e };
  let t = U(n).resolveInner(e), i = t.childBefore(e), s = t.childAfter(e), r;
  return i && s && i.to <= e && s.from >= e && (r = i.type.prop(R.closedBy)) && r.indexOf(s.name) > -1 && n.doc.lineAt(i.to).from == n.doc.lineAt(s.from).from ? { from: i.to, to: s.from } : null;
}
const wg = /* @__PURE__ */ lc(!1), Tg = /* @__PURE__ */ lc(!0);
function lc(n) {
  return ({ state: e, dispatch: t }) => {
    if (e.readOnly)
      return !1;
    let i = e.changeByRange((s) => {
      let { from: r, to: o } = s, l = e.doc.lineAt(r), a = !n && r == o && kg(e, r);
      n && (r = o = (o <= l.to ? l : e.doc.lineAt(o)).to);
      let h = new Zn(e, { simulateBreak: r, simulateDoubleBreak: !!a }), c = mr(h, r);
      for (c == null && (c = /^\s*/.exec(e.doc.lineAt(r).text)[0].length); o < l.to && /\s/.test(l.text[o - l.from]); )
        o++;
      a ? { from: r, to: o } = a : r > l.from && r < l.from + 100 && !/\S/.test(l.text.slice(0, r)) && (r = l.from);
      let f = ["", Oi(e, c)];
      return a && f.push(Oi(e, h.lineIndent(l.from, -1))), {
        changes: { from: r, to: o, insert: D.of(f) },
        range: g.cursor(r + 1 + f[1].length)
      };
    });
    return t(e.update(i, { scrollIntoView: !0, userEvent: "input" })), !0;
  };
}
function vr(n, e) {
  let t = -1;
  return n.changeByRange((i) => {
    let s = [];
    for (let o = i.from; o <= i.to; ) {
      let l = n.doc.lineAt(o);
      l.number > t && (i.empty || i.to > l.from) && (e(l, s, i), t = l.number), o = l.to + 1;
    }
    let r = n.changes(s);
    return {
      changes: s,
      range: g.range(r.mapPos(i.anchor, 1), r.mapPos(i.head, 1))
    };
  });
}
const vg = ({ state: n, dispatch: e }) => {
  if (n.readOnly)
    return !1;
  let t = /* @__PURE__ */ Object.create(null), i = new Zn(n, { overrideIndentation: (r) => {
    let o = t[r];
    return o == null ? -1 : o;
  } }), s = vr(n, (r, o, l) => {
    let a = mr(i, r.from);
    if (a == null)
      return;
    /\S/.test(r.text) || (a = 0);
    let h = /^\s*/.exec(r.text)[0], c = Oi(n, a);
    (h != c || l.from < r.from + h.length) && (t[r.from] = a, o.push({ from: r.from, to: r.from + h.length, insert: c }));
  });
  return s.changes.empty || e(n.update(s, { userEvent: "indent" })), !0;
}, ac = ({ state: n, dispatch: e }) => n.readOnly ? !1 : (e(n.update(vr(n, (t, i) => {
  i.push({ from: t.from, insert: n.facet(yi) });
}), { userEvent: "input.indent" })), !0), hc = ({ state: n, dispatch: e }) => n.readOnly ? !1 : (e(n.update(vr(n, (t, i) => {
  let s = /^\s*/.exec(t.text)[0];
  if (!s)
    return;
  let r = Pn(s, n.tabSize), o = 0, l = Oi(n, Math.max(0, r - mn(n)));
  for (; o < s.length && o < l.length && s.charCodeAt(o) == l.charCodeAt(o); )
    o++;
  i.push({ from: t.from + o, to: t.from + s.length, insert: l.slice(o) });
}), { userEvent: "delete.dedent" })), !0), Pg = [
  { key: "Ctrl-b", run: Eh, shift: Vh, preventDefault: !0 },
  { key: "Ctrl-f", run: qh, shift: Uh },
  { key: "Ctrl-p", run: Bh, shift: Hh },
  { key: "Ctrl-n", run: Gh, shift: Jh },
  { key: "Ctrl-a", run: tg, shift: hg },
  { key: "Ctrl-e", run: ig, shift: cg },
  { key: "Ctrl-d", run: tc },
  { key: "Ctrl-h", run: tr },
  { key: "Ctrl-k", run: sc },
  { key: "Ctrl-Alt-h", run: nc },
  { key: "Ctrl-o", run: mg },
  { key: "Ctrl-t", run: Qg },
  { key: "Ctrl-v", run: er }
], Cg = /* @__PURE__ */ [
  { key: "ArrowLeft", run: Eh, shift: Vh, preventDefault: !0 },
  { key: "Mod-ArrowLeft", mac: "Alt-ArrowLeft", run: Yp, shift: rg },
  { mac: "Cmd-ArrowLeft", run: ml, shift: bl },
  { key: "ArrowRight", run: qh, shift: Uh, preventDefault: !0 },
  { key: "Mod-ArrowRight", mac: "Alt-ArrowRight", run: Hp, shift: og },
  { mac: "Cmd-ArrowRight", run: gl, shift: Sl },
  { key: "ArrowUp", run: Bh, shift: Hh, preventDefault: !0 },
  { mac: "Cmd-ArrowUp", run: xl, shift: kl },
  { mac: "Ctrl-ArrowUp", run: pl, shift: Ql },
  { key: "ArrowDown", run: Gh, shift: Jh, preventDefault: !0 },
  { mac: "Cmd-ArrowDown", run: $l, shift: wl },
  { mac: "Ctrl-ArrowDown", run: er, shift: yl },
  { key: "PageUp", run: pl, shift: Ql },
  { key: "PageDown", run: er, shift: yl },
  { key: "Home", run: ml, shift: bl, preventDefault: !0 },
  { key: "Mod-Home", run: xl, shift: kl },
  { key: "End", run: gl, shift: Sl, preventDefault: !0 },
  { key: "Mod-End", run: $l, shift: wl },
  { key: "Enter", run: wg },
  { key: "Mod-a", run: fg },
  { key: "Backspace", run: tr, shift: tr },
  { key: "Delete", run: tc },
  { key: "Mod-Backspace", mac: "Alt-Backspace", run: nc },
  { key: "Mod-Delete", mac: "Alt-Delete", run: pg },
  { mac: "Mod-Backspace", run: gg },
  { mac: "Mod-Delete", run: sc }
].concat(/* @__PURE__ */ Pg.map((n) => ({ mac: n.key, run: n.run, shift: n.shift }))), Rg = /* @__PURE__ */ [
  { key: "Alt-ArrowLeft", mac: "Ctrl-ArrowLeft", run: Kp, shift: lg },
  { key: "Alt-ArrowRight", mac: "Ctrl-ArrowRight", run: eg, shift: ag },
  { key: "Alt-ArrowUp", run: yg },
  { key: "Shift-Alt-ArrowUp", run: bg },
  { key: "Alt-ArrowDown", run: Sg },
  { key: "Shift-Alt-ArrowDown", run: xg },
  { key: "Escape", run: Og },
  { key: "Mod-Enter", run: Tg },
  { key: "Alt-l", mac: "Ctrl-l", run: ug },
  { key: "Mod-i", run: dg, preventDefault: !0 },
  { key: "Mod-[", run: hc },
  { key: "Mod-]", run: ac },
  { key: "Mod-Alt-\\", run: vg },
  { key: "Shift-Mod-k", run: $g },
  { key: "Shift-Mod-\\", run: sg },
  { key: "Mod-/", run: Rp },
  { key: "Alt-A", run: Mp }
].concat(Cg), Ag = { key: "Tab", run: ac, shift: hc };
function he() {
  var n = arguments[0];
  typeof n == "string" && (n = document.createElement(n));
  var e = 1, t = arguments[1];
  if (t && typeof t == "object" && t.nodeType == null && !Array.isArray(t)) {
    for (var i in t)
      if (Object.prototype.hasOwnProperty.call(t, i)) {
        var s = t[i];
        typeof s == "string" ? n.setAttribute(i, s) : s != null && (n[i] = s);
      }
    e++;
  }
  for (; e < arguments.length; e++)
    cc(n, arguments[e]);
  return n;
}
function cc(n, e) {
  if (typeof e == "string")
    n.appendChild(document.createTextNode(e));
  else if (e != null)
    if (e.nodeType != null)
      n.appendChild(e);
    else if (Array.isArray(e))
      for (var t = 0; t < e.length; t++)
        cc(n, e[t]);
    else
      throw new RangeError("Unsupported child node: " + e);
}
const Tl = typeof String.prototype.normalize == "function" ? (n) => n.normalize("NFKD") : (n) => n;
class Bt {
  constructor(e, t, i = 0, s = e.length, r) {
    this.value = { from: 0, to: 0 }, this.done = !1, this.matches = [], this.buffer = "", this.bufferPos = 0, this.iter = e.iterRange(i, s), this.bufferStart = i, this.normalize = r ? (o) => r(Tl(o)) : Tl, this.query = this.normalize(t);
  }
  peek() {
    if (this.bufferPos == this.buffer.length) {
      if (this.bufferStart += this.buffer.length, this.iter.next(), this.iter.done)
        return -1;
      this.bufferPos = 0, this.buffer = this.iter.value;
    }
    return K(this.buffer, this.bufferPos);
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
      let t = sr(e), i = this.bufferStart + this.bufferPos;
      this.bufferPos += pe(e);
      let s = this.normalize(t);
      for (let r = 0, o = i; ; r++) {
        let l = s.charCodeAt(r), a = this.match(l, o);
        if (a)
          return this.value = a, this;
        if (r == s.length - 1)
          break;
        o == i && r < t.length && t.charCodeAt(r) == l && o++;
      }
    }
  }
  match(e, t) {
    let i = null;
    for (let s = 0; s < this.matches.length; s += 2) {
      let r = this.matches[s], o = !1;
      this.query.charCodeAt(r) == e && (r == this.query.length - 1 ? i = { from: this.matches[s + 1], to: t + 1 } : (this.matches[s]++, o = !0)), o || (this.matches.splice(s, 2), s -= 2);
    }
    return this.query.charCodeAt(0) == e && (this.query.length == 1 ? i = { from: t, to: t + 1 } : this.matches.push(1, t)), i;
  }
}
typeof Symbol < "u" && (Bt.prototype[Symbol.iterator] = function() {
  return this;
});
const fc = { from: -1, to: -1, match: /* @__PURE__ */ /.*/.exec("") }, Pr = "gm" + (/x/.unicode == null ? "" : "u");
class uc {
  constructor(e, t, i, s = 0, r = e.length) {
    if (this.to = r, this.curLine = "", this.done = !1, this.value = fc, /\\[sWDnr]|\n|\r|\[\^/.test(t))
      return new dc(e, t, i, s, r);
    this.re = new RegExp(t, Pr + (i != null && i.ignoreCase ? "i" : "")), this.iter = e.iter();
    let o = e.lineAt(s);
    this.curLineStart = o.from, this.matchPos = s, this.getLine(this.curLineStart);
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
        let i = this.curLineStart + t.index, s = i + t[0].length;
        if (this.matchPos = s + (i == s ? 1 : 0), i == this.curLine.length && this.nextLine(), i < s || i > this.value.to)
          return this.value = { from: i, to: s, match: t }, this;
        e = this.matchPos - this.curLineStart;
      } else if (this.curLineStart + this.curLine.length < this.to)
        this.nextLine(), e = 0;
      else
        return this.done = !0, this;
    }
  }
}
const gs = /* @__PURE__ */ new WeakMap();
class Dt {
  constructor(e, t) {
    this.from = e, this.text = t;
  }
  get to() {
    return this.from + this.text.length;
  }
  static get(e, t, i) {
    let s = gs.get(e);
    if (!s || s.from >= i || s.to <= t) {
      let l = new Dt(t, e.sliceString(t, i));
      return gs.set(e, l), l;
    }
    if (s.from == t && s.to == i)
      return s;
    let { text: r, from: o } = s;
    return o > t && (r = e.sliceString(t, o) + r, o = t), s.to < i && (r += e.sliceString(s.to, i)), gs.set(e, new Dt(o, r)), new Dt(t, r.slice(t - o, i - o));
  }
}
class dc {
  constructor(e, t, i, s, r) {
    this.text = e, this.to = r, this.done = !1, this.value = fc, this.matchPos = s, this.re = new RegExp(t, Pr + (i != null && i.ignoreCase ? "i" : "")), this.flat = Dt.get(e, s, this.chunkEnd(s + 5e3));
  }
  chunkEnd(e) {
    return e >= this.to ? this.to : this.text.lineAt(e).to;
  }
  next() {
    for (; ; ) {
      let e = this.re.lastIndex = this.matchPos - this.flat.from, t = this.re.exec(this.flat.text);
      if (t && !t[0] && t.index == e && (this.re.lastIndex = e + 1, t = this.re.exec(this.flat.text)), t && this.flat.to < this.to && t.index + t[0].length > this.flat.text.length - 10 && (t = null), t) {
        let i = this.flat.from + t.index, s = i + t[0].length;
        return this.value = { from: i, to: s, match: t }, this.matchPos = s + (i == s ? 1 : 0), this;
      } else {
        if (this.flat.to == this.to)
          return this.done = !0, this;
        this.flat = Dt.get(this.text, this.flat.from, this.chunkEnd(this.flat.from + this.flat.text.length * 2));
      }
    }
  }
}
typeof Symbol < "u" && (uc.prototype[Symbol.iterator] = dc.prototype[Symbol.iterator] = function() {
  return this;
});
function Mg(n) {
  try {
    return new RegExp(n, Pr), !0;
  } catch {
    return !1;
  }
}
function ir(n) {
  let e = he("input", { class: "cm-textfield", name: "line" }), t = he("form", {
    class: "cm-gotoLine",
    onkeydown: (s) => {
      s.keyCode == 27 ? (s.preventDefault(), n.dispatch({ effects: kn.of(!1) }), n.focus()) : s.keyCode == 13 && (s.preventDefault(), i());
    },
    onsubmit: (s) => {
      s.preventDefault(), i();
    }
  }, he("label", n.state.phrase("Go to line"), ": ", e), " ", he("button", { class: "cm-button", type: "submit" }, n.state.phrase("go")));
  function i() {
    let s = /^([+-])?(\d+)?(:\d+)?(%)?$/.exec(e.value);
    if (!s)
      return;
    let { state: r } = n, o = r.doc.lineAt(r.selection.main.head), [, l, a, h, c] = s, f = h ? +h.slice(1) : 0, u = a ? +a : o.number;
    if (a && c) {
      let O = u / 100;
      l && (O = O * (l == "-" ? -1 : 1) + o.number / r.doc.lines), u = Math.round(r.doc.lines * O);
    } else
      a && l && (u = u * (l == "-" ? -1 : 1) + o.number);
    let d = r.doc.line(Math.max(1, Math.min(r.doc.lines, u)));
    n.dispatch({
      effects: kn.of(!1),
      selection: g.cursor(d.from + Math.max(0, Math.min(f, d.length))),
      scrollIntoView: !0
    }), n.focus();
  }
  return { dom: t };
}
const kn = /* @__PURE__ */ C.define(), vl = /* @__PURE__ */ le.define({
  create() {
    return !0;
  },
  update(n, e) {
    for (let t of e.effects)
      t.is(kn) && (n = t.value);
    return n;
  },
  provide: (n) => ln.from(n, (e) => e ? ir : null)
}), Wg = (n) => {
  let e = on(n, ir);
  if (!e) {
    let t = [kn.of(!0)];
    n.state.field(vl, !1) == null && t.push(C.appendConfig.of([vl, Zg])), n.dispatch({ effects: t }), e = on(n, ir);
  }
  return e && e.dom.querySelector("input").focus(), !0;
}, Zg = /* @__PURE__ */ k.baseTheme({
  ".cm-panel.cm-gotoLine": {
    padding: "2px 6px 4px",
    "& label": { fontSize: "80%" }
  }
}), Dg = {
  highlightWordAroundCursor: !1,
  minSelectionLength: 1,
  maxMatches: 100,
  wholeWords: !1
}, Oc = /* @__PURE__ */ x.define({
  combine(n) {
    return $t(n, Dg, {
      highlightWordAroundCursor: (e, t) => e || t,
      minSelectionLength: Math.min,
      maxMatches: Math.min
    });
  }
});
function Xg(n) {
  let e = [zg, Ig];
  return n && e.push(Oc.of(n)), e;
}
const jg = /* @__PURE__ */ T.mark({ class: "cm-selectionMatch" }), Eg = /* @__PURE__ */ T.mark({ class: "cm-selectionMatch cm-selectionMatch-main" });
function Pl(n, e, t, i) {
  return (t == 0 || n(e.sliceDoc(t - 1, t)) != se.Word) && (i == e.doc.length || n(e.sliceDoc(i, i + 1)) != se.Word);
}
function qg(n, e, t, i) {
  return n(e.sliceDoc(t, t + 1)) == se.Word && n(e.sliceDoc(i - 1, i)) == se.Word;
}
const Ig = /* @__PURE__ */ oe.fromClass(class {
  constructor(n) {
    this.decorations = this.getDeco(n);
  }
  update(n) {
    (n.selectionSet || n.docChanged || n.viewportChanged) && (this.decorations = this.getDeco(n.view));
  }
  getDeco(n) {
    let e = n.state.facet(Oc), { state: t } = n, i = t.selection;
    if (i.ranges.length > 1)
      return T.none;
    let s = i.main, r, o = null;
    if (s.empty) {
      if (!e.highlightWordAroundCursor)
        return T.none;
      let a = t.wordAt(s.head);
      if (!a)
        return T.none;
      o = t.charCategorizer(s.head), r = t.sliceDoc(a.from, a.to);
    } else {
      let a = s.to - s.from;
      if (a < e.minSelectionLength || a > 200)
        return T.none;
      if (e.wholeWords) {
        if (r = t.sliceDoc(s.from, s.to), o = t.charCategorizer(s.head), !(Pl(o, t, s.from, s.to) && qg(o, t, s.from, s.to)))
          return T.none;
      } else if (r = t.sliceDoc(s.from, s.to).trim(), !r)
        return T.none;
    }
    let l = [];
    for (let a of n.visibleRanges) {
      let h = new Bt(t.doc, r, a.from, a.to);
      for (; !h.next().done; ) {
        let { from: c, to: f } = h.value;
        if ((!o || Pl(o, t, c, f)) && (s.empty && c <= s.from && f >= s.to ? l.push(Eg.range(c, f)) : (c >= s.to || f <= s.from) && l.push(jg.range(c, f)), l.length > e.maxMatches))
          return T.none;
      }
    }
    return T.set(l);
  }
}, {
  decorations: (n) => n.decorations
}), zg = /* @__PURE__ */ k.baseTheme({
  ".cm-selectionMatch": { backgroundColor: "#99ff7780" },
  ".cm-searchMatch .cm-selectionMatch": { backgroundColor: "transparent" }
}), Bg = ({ state: n, dispatch: e }) => {
  let { selection: t } = n, i = g.create(t.ranges.map((s) => n.wordAt(s.head) || g.cursor(s.head)), t.mainIndex);
  return i.eq(t) ? !1 : (e(n.update({ selection: i })), !0);
};
function Gg(n, e) {
  let { main: t, ranges: i } = n.selection, s = n.wordAt(t.head), r = s && s.from == t.from && s.to == t.to;
  for (let o = !1, l = new Bt(n.doc, e, i[i.length - 1].to); ; )
    if (l.next(), l.done) {
      if (o)
        return null;
      l = new Bt(n.doc, e, 0, Math.max(0, i[i.length - 1].from - 1)), o = !0;
    } else {
      if (o && i.some((a) => a.from == l.value.from))
        continue;
      if (r) {
        let a = n.wordAt(l.value.from);
        if (!a || a.from != l.value.from || a.to != l.value.to)
          continue;
      }
      return l.value;
    }
}
const Lg = ({ state: n, dispatch: e }) => {
  let { ranges: t } = n.selection;
  if (t.some((r) => r.from === r.to))
    return Bg({ state: n, dispatch: e });
  let i = n.sliceDoc(t[0].from, t[0].to);
  if (n.selection.ranges.some((r) => n.sliceDoc(r.from, r.to) != i))
    return !1;
  let s = Gg(n, i);
  return s ? (e(n.update({
    selection: n.selection.addRange(g.range(s.from, s.to), !1),
    effects: k.scrollIntoView(s.to)
  })), !0) : !1;
}, Cr = /* @__PURE__ */ x.define({
  combine(n) {
    var e;
    return {
      top: n.reduce((t, i) => t != null ? t : i.top, void 0) || !1,
      caseSensitive: n.reduce((t, i) => t != null ? t : i.caseSensitive, void 0) || !1,
      createPanel: ((e = n.find((t) => t.createPanel)) === null || e === void 0 ? void 0 : e.createPanel) || ((t) => new em(t))
    };
  }
});
class pc {
  constructor(e) {
    this.search = e.search, this.caseSensitive = !!e.caseSensitive, this.regexp = !!e.regexp, this.replace = e.replace || "", this.valid = !!this.search && (!this.regexp || Mg(this.search)), this.unquoted = e.literal ? this.search : this.search.replace(/\\([nrt\\])/g, (t, i) => i == "n" ? `
` : i == "r" ? "\r" : i == "t" ? "	" : "\\");
  }
  eq(e) {
    return this.search == e.search && this.replace == e.replace && this.caseSensitive == e.caseSensitive && this.regexp == e.regexp;
  }
  create() {
    return this.regexp ? new Ng(this) : new _g(this);
  }
  getCursor(e, t = 0, i = e.length) {
    return this.regexp ? Rt(this, e, t, i) : Ct(this, e, t, i);
  }
}
class gc {
  constructor(e) {
    this.spec = e;
  }
}
function Ct(n, e, t, i) {
  return new Bt(e, n.unquoted, t, i, n.caseSensitive ? void 0 : (s) => s.toLowerCase());
}
class _g extends gc {
  constructor(e) {
    super(e);
  }
  nextMatch(e, t, i) {
    let s = Ct(this.spec, e, i, e.length).nextOverlapping();
    return s.done && (s = Ct(this.spec, e, 0, t).nextOverlapping()), s.done ? null : s.value;
  }
  prevMatchInRange(e, t, i) {
    for (let s = i; ; ) {
      let r = Math.max(t, s - 1e4 - this.spec.unquoted.length), o = Ct(this.spec, e, r, s), l = null;
      for (; !o.nextOverlapping().done; )
        l = o.value;
      if (l)
        return l;
      if (r == t)
        return null;
      s -= 1e4;
    }
  }
  prevMatch(e, t, i) {
    return this.prevMatchInRange(e, 0, t) || this.prevMatchInRange(e, i, e.length);
  }
  getReplacement(e) {
    return this.spec.replace;
  }
  matchAll(e, t) {
    let i = Ct(this.spec, e, 0, e.length), s = [];
    for (; !i.next().done; ) {
      if (s.length >= t)
        return null;
      s.push(i.value);
    }
    return s;
  }
  highlight(e, t, i, s) {
    let r = Ct(this.spec, e, Math.max(0, t - this.spec.unquoted.length), Math.min(i + this.spec.unquoted.length, e.length));
    for (; !r.next().done; )
      s(r.value.from, r.value.to);
  }
}
function Rt(n, e, t, i) {
  return new uc(e, n.search, n.caseSensitive ? void 0 : { ignoreCase: !0 }, t, i);
}
class Ng extends gc {
  nextMatch(e, t, i) {
    let s = Rt(this.spec, e, i, e.length).next();
    return s.done && (s = Rt(this.spec, e, 0, t).next()), s.done ? null : s.value;
  }
  prevMatchInRange(e, t, i) {
    for (let s = 1; ; s++) {
      let r = Math.max(t, i - s * 1e4), o = Rt(this.spec, e, r, i), l = null;
      for (; !o.next().done; )
        l = o.value;
      if (l && (r == t || l.from > r + 10))
        return l;
      if (r == t)
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
    let i = Rt(this.spec, e, 0, e.length), s = [];
    for (; !i.next().done; ) {
      if (s.length >= t)
        return null;
      s.push(i.value);
    }
    return s;
  }
  highlight(e, t, i, s) {
    let r = Rt(this.spec, e, Math.max(0, t - 250), Math.min(i + 250, e.length));
    for (; !r.next().done; )
      s(r.value.from, r.value.to);
  }
}
const gi = /* @__PURE__ */ C.define(), Rr = /* @__PURE__ */ C.define(), rt = /* @__PURE__ */ le.define({
  create(n) {
    return new ms(nr(n).create(), null);
  },
  update(n, e) {
    for (let t of e.effects)
      t.is(gi) ? n = new ms(t.value.create(), n.panel) : t.is(Rr) && (n = new ms(n.query, t.value ? Ar : null));
    return n;
  },
  provide: (n) => ln.from(n, (e) => e.panel)
});
class ms {
  constructor(e, t) {
    this.query = e, this.panel = t;
  }
}
const Vg = /* @__PURE__ */ T.mark({ class: "cm-searchMatch" }), Ug = /* @__PURE__ */ T.mark({ class: "cm-searchMatch cm-searchMatch-selected" }), Fg = /* @__PURE__ */ oe.fromClass(class {
  constructor(n) {
    this.view = n, this.decorations = this.highlight(n.state.field(rt));
  }
  update(n) {
    let e = n.state.field(rt);
    (e != n.startState.field(rt) || n.docChanged || n.selectionSet || n.viewportChanged) && (this.decorations = this.highlight(e));
  }
  highlight({ query: n, panel: e }) {
    if (!e || !n.spec.valid)
      return T.none;
    let { view: t } = this, i = new ot();
    for (let s = 0, r = t.visibleRanges, o = r.length; s < o; s++) {
      let { from: l, to: a } = r[s];
      for (; s < o - 1 && a > r[s + 1].from - 2 * 250; )
        a = r[++s].to;
      n.highlight(t.state.doc, l, a, (h, c) => {
        let f = t.state.selection.ranges.some((u) => u.from == h && u.to == c);
        i.add(h, c, f ? Ug : Vg);
      });
    }
    return i.finish();
  }
}, {
  decorations: (n) => n.decorations
});
function xi(n) {
  return (e) => {
    let t = e.state.field(rt, !1);
    return t && t.query.spec.valid ? n(e, t) : mc(e);
  };
}
const wn = /* @__PURE__ */ xi((n, { query: e }) => {
  let { to: t } = n.state.selection.main, i = e.nextMatch(n.state.doc, t, t);
  return i ? (n.dispatch({
    selection: { anchor: i.from, head: i.to },
    scrollIntoView: !0,
    effects: Mr(n, i),
    userEvent: "select.search"
  }), !0) : !1;
}), Tn = /* @__PURE__ */ xi((n, { query: e }) => {
  let { state: t } = n, { from: i } = t.selection.main, s = e.prevMatch(t.doc, i, i);
  return s ? (n.dispatch({
    selection: { anchor: s.from, head: s.to },
    scrollIntoView: !0,
    effects: Mr(n, s),
    userEvent: "select.search"
  }), !0) : !1;
}), Yg = /* @__PURE__ */ xi((n, { query: e }) => {
  let t = e.matchAll(n.state.doc, 1e3);
  return !t || !t.length ? !1 : (n.dispatch({
    selection: g.create(t.map((i) => g.range(i.from, i.to))),
    userEvent: "select.search.matches"
  }), !0);
}), Hg = ({ state: n, dispatch: e }) => {
  let t = n.selection;
  if (t.ranges.length > 1 || t.main.empty)
    return !1;
  let { from: i, to: s } = t.main, r = [], o = 0;
  for (let l = new Bt(n.doc, n.sliceDoc(i, s)); !l.next().done; ) {
    if (r.length > 1e3)
      return !1;
    l.value.from == i && (o = r.length), r.push(g.range(l.value.from, l.value.to));
  }
  return e(n.update({
    selection: g.create(r, o),
    userEvent: "select.search.matches"
  })), !0;
}, Cl = /* @__PURE__ */ xi((n, { query: e }) => {
  let { state: t } = n, { from: i, to: s } = t.selection.main;
  if (t.readOnly)
    return !1;
  let r = e.nextMatch(t.doc, i, i);
  if (!r)
    return !1;
  let o = [], l, a, h = [];
  if (r.from == i && r.to == s && (a = t.toText(e.getReplacement(r)), o.push({ from: r.from, to: r.to, insert: a }), r = e.nextMatch(t.doc, r.from, r.to), h.push(k.announce.of(t.phrase("replaced match on line $", t.doc.lineAt(i).number) + "."))), r) {
    let c = o.length == 0 || o[0].from >= r.to ? 0 : r.to - r.from - a.length;
    l = { anchor: r.from - c, head: r.to - c }, h.push(Mr(n, r));
  }
  return n.dispatch({
    changes: o,
    selection: l,
    scrollIntoView: !!l,
    effects: h,
    userEvent: "input.replace"
  }), !0;
}), Jg = /* @__PURE__ */ xi((n, { query: e }) => {
  if (n.state.readOnly)
    return !1;
  let t = e.matchAll(n.state.doc, 1e9).map((s) => {
    let { from: r, to: o } = s;
    return { from: r, to: o, insert: e.getReplacement(s) };
  });
  if (!t.length)
    return !1;
  let i = n.state.phrase("replaced $ matches", t.length) + ".";
  return n.dispatch({
    changes: t,
    effects: k.announce.of(i),
    userEvent: "input.replace.all"
  }), !0;
});
function Ar(n) {
  return n.state.facet(Cr).createPanel(n);
}
function nr(n, e) {
  var t;
  let i = n.selection.main, s = i.empty || i.to > i.from + 100 ? "" : n.sliceDoc(i.from, i.to), r = (t = e == null ? void 0 : e.caseSensitive) !== null && t !== void 0 ? t : n.facet(Cr).caseSensitive;
  return e && !s ? e : new pc({ search: s.replace(/\n/g, "\\n"), caseSensitive: r });
}
const mc = (n) => {
  let e = n.state.field(rt, !1);
  if (e && e.panel) {
    let t = on(n, Ar);
    if (!t)
      return !1;
    let i = t.dom.querySelector("[main-field]");
    if (i && i != n.root.activeElement) {
      let s = nr(n.state, e.query.spec);
      s.valid && n.dispatch({ effects: gi.of(s) }), i.focus(), i.select();
    }
  } else
    n.dispatch({ effects: [
      Rr.of(!0),
      e ? gi.of(nr(n.state, e.query.spec)) : C.appendConfig.of(im)
    ] });
  return !0;
}, Qc = (n) => {
  let e = n.state.field(rt, !1);
  if (!e || !e.panel)
    return !1;
  let t = on(n, Ar);
  return t && t.dom.contains(n.root.activeElement) && n.focus(), n.dispatch({ effects: Rr.of(!1) }), !0;
}, Kg = [
  { key: "Mod-f", run: mc, scope: "editor search-panel" },
  { key: "F3", run: wn, shift: Tn, scope: "editor search-panel", preventDefault: !0 },
  { key: "Mod-g", run: wn, shift: Tn, scope: "editor search-panel", preventDefault: !0 },
  { key: "Escape", run: Qc, scope: "editor search-panel" },
  { key: "Mod-Shift-l", run: Hg },
  { key: "Alt-g", run: Wg },
  { key: "Mod-d", run: Lg, preventDefault: !0 }
];
class em {
  constructor(e) {
    this.view = e;
    let t = this.query = e.state.field(rt).query.spec;
    this.commit = this.commit.bind(this), this.searchField = he("input", {
      value: t.search,
      placeholder: Qe(e, "Find"),
      "aria-label": Qe(e, "Find"),
      class: "cm-textfield",
      name: "search",
      "main-field": "true",
      onchange: this.commit,
      onkeyup: this.commit
    }), this.replaceField = he("input", {
      value: t.replace,
      placeholder: Qe(e, "Replace"),
      "aria-label": Qe(e, "Replace"),
      class: "cm-textfield",
      name: "replace",
      onchange: this.commit,
      onkeyup: this.commit
    }), this.caseField = he("input", {
      type: "checkbox",
      name: "case",
      checked: t.caseSensitive,
      onchange: this.commit
    }), this.reField = he("input", {
      type: "checkbox",
      name: "re",
      checked: t.regexp,
      onchange: this.commit
    });
    function i(s, r, o) {
      return he("button", { class: "cm-button", name: s, onclick: r, type: "button" }, o);
    }
    this.dom = he("div", { onkeydown: (s) => this.keydown(s), class: "cm-search" }, [
      this.searchField,
      i("next", () => wn(e), [Qe(e, "next")]),
      i("prev", () => Tn(e), [Qe(e, "previous")]),
      i("select", () => Yg(e), [Qe(e, "all")]),
      he("label", null, [this.caseField, Qe(e, "match case")]),
      he("label", null, [this.reField, Qe(e, "regexp")]),
      ...e.state.readOnly ? [] : [
        he("br"),
        this.replaceField,
        i("replace", () => Cl(e), [Qe(e, "replace")]),
        i("replaceAll", () => Jg(e), [Qe(e, "replace all")]),
        he("button", {
          name: "close",
          onclick: () => Qc(e),
          "aria-label": Qe(e, "close"),
          type: "button"
        }, ["\xD7"])
      ]
    ]);
  }
  commit() {
    let e = new pc({
      search: this.searchField.value,
      caseSensitive: this.caseField.checked,
      regexp: this.reField.checked,
      replace: this.replaceField.value
    });
    e.eq(this.query) || (this.query = e, this.view.dispatch({ effects: gi.of(e) }));
  }
  keydown(e) {
    su(this.view, e, "search-panel") ? e.preventDefault() : e.keyCode == 13 && e.target == this.searchField ? (e.preventDefault(), (e.shiftKey ? Tn : wn)(this.view)) : e.keyCode == 13 && e.target == this.replaceField && (e.preventDefault(), Cl(this.view));
  }
  update(e) {
    for (let t of e.transactions)
      for (let i of t.effects)
        i.is(gi) && !i.value.eq(this.query) && this.setQuery(i.value);
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
    return this.view.state.facet(Cr).top;
  }
}
function Qe(n, e) {
  return n.state.phrase(e);
}
const Ii = 30, zi = /[\s\.,:;?!]/;
function Mr(n, { from: e, to: t }) {
  let i = n.state.doc.lineAt(e), s = n.state.doc.lineAt(t).to, r = Math.max(i.from, e - Ii), o = Math.min(s, t + Ii), l = n.state.sliceDoc(r, o);
  if (r != i.from) {
    for (let a = 0; a < Ii; a++)
      if (!zi.test(l[a + 1]) && zi.test(l[a])) {
        l = l.slice(a);
        break;
      }
  }
  if (o != s) {
    for (let a = l.length - 1; a > l.length - Ii; a--)
      if (!zi.test(l[a - 1]) && zi.test(l[a])) {
        l = l.slice(0, a);
        break;
      }
  }
  return k.announce.of(`${n.state.phrase("current match")}. ${l} ${n.state.phrase("on line")} ${i.number}.`);
}
const tm = /* @__PURE__ */ k.baseTheme({
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
}), im = [
  rt,
  /* @__PURE__ */ Gt.lowest(Fg),
  tm
];
function nm(n, e, t) {
  let i = null;
  return n === "javascript" && (i = vp()), Z.create({
    doc: e,
    extensions: [
      i,
      Ip(),
      Du(),
      Su(),
      Eu(),
      Ou(),
      Xg(),
      Yd(),
      yi.of("    "),
      fO(OO, { fallback: !0 }),
      bO(),
      op(),
      hO({ openText: "\u25BE", closedText: "\u25B8" }),
      mp(),
      k.lineWrapping,
      k.updateListener.of((s) => {
        s.docChanged && t(s.state.doc.toString());
      }),
      Wn.of([
        ...Rg,
        ...Fp,
        Ag,
        ...Kg,
        ...oO,
        ...vh,
        ...cp
      ])
    ]
  });
}
class sm extends yc {
  constructor() {
    super();
  }
  static get observedAttributes() {
    return ["lang", "value"];
  }
  attributeChangedCallback(e, t, i) {
  }
  connectedCallback() {
    var e, t;
    this.lang = (e = this.getAttribute("lang")) != null ? e : "javascript", this.value = (t = this.getAttribute("value")) != null ? t : "", this.editor = null, this.shadowRoot.innerHTML = `
            <div id="code-mirror-editor"></div>
            <style>
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

            #code-mirror-editor .cm-activeLine,
            #code-mirror-editor .cm-activeLineGutter {
                background-color: rgb(130, 130, 130, 0.1);
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
        `, this.editor = new k({
      state: nm(this.lang, this.value, (i) => {
        this.value = i, this.dispatchEvent(new Event("input"));
      }),
      parent: this.shadowRoot.querySelector("#code-mirror-editor")
    }), this.hasAttribute("autofocus") && this.editor.focus();
  }
}
customElements.define("code-mirror", sm);
