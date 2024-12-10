(()=>{"use strict";var t={533:function(t,e,r){var i,n,o,s=r("798"),a=r("412");!function(t){class e{static encodeText(r,i){let n=t.QrSegment.makeSegments(r);return e.encodeSegments(n,i)}static encodeBinary(r,i){let n=t.QrSegment.makeBytes(r);return e.encodeSegments([n],i)}static encodeSegments(t,i){let s,a,l=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1,h=arguments.length>3&&void 0!==arguments[3]?arguments[3]:40,u=arguments.length>4&&void 0!==arguments[4]?arguments[4]:-1,d=!(arguments.length>5)||void 0===arguments[5]||arguments[5];if(!(e.MIN_VERSION<=l&&l<=h&&h<=e.MAX_VERSION)||u<-1||u>7)throw RangeError("Invalid value");for(s=l;;s++){let r=8*e.getNumDataCodewords(s,i),n=o.getTotalBits(t,s);if(n<=r){a=n;break}if(s>=h)throw RangeError("Data too long")}for(let t of[e.Ecc.MEDIUM,e.Ecc.QUARTILE,e.Ecc.HIGH])d&&a<=8*e.getNumDataCodewords(s,t)&&(i=t);let f=[];for(let e of t)for(let t of(r(e.mode.modeBits,4,f),r(e.numChars,e.mode.numCharCountBits(s),f),e.getData()))f.push(t);n(f.length==a);let c=8*e.getNumDataCodewords(s,i);n(f.length<=c),r(0,Math.min(4,c-f.length),f),r(0,(8-f.length%8)%8,f),n(f.length%8==0);for(let t=236;f.length<c;t^=253)r(t,8,f);let g=[];for(;8*g.length<f.length;)g.push(0);return f.forEach((t,e)=>g[e>>>3]|=t<<7-(7&e)),new e(s,i,g,u)}getModule(t,e){return 0<=t&&t<this.size&&0<=e&&e<this.size&&this.modules[e][t]}getModules(){return this.modules}drawFunctionPatterns(){for(let t=0;t<this.size;t++)this.setFunctionModule(6,t,t%2==0),this.setFunctionModule(t,6,t%2==0);this.drawFinderPattern(3,3),this.drawFinderPattern(this.size-4,3),this.drawFinderPattern(3,this.size-4);let t=this.getAlignmentPatternPositions(),e=t.length;for(let r=0;r<e;r++)for(let i=0;i<e;i++)!(0==r&&0==i||0==r&&i==e-1||r==e-1&&0==i)&&this.drawAlignmentPattern(t[r],t[i]);this.drawFormatBits(0),this.drawVersion()}drawFormatBits(t){let e=this.errorCorrectionLevel.formatBits<<3|t,r=e;for(let t=0;t<10;t++)r=r<<1^(r>>>9)*1335;let o=(e<<10|r)^21522;n(o>>>15==0);for(let t=0;t<=5;t++)this.setFunctionModule(8,t,i(o,t));this.setFunctionModule(8,7,i(o,6)),this.setFunctionModule(8,8,i(o,7)),this.setFunctionModule(7,8,i(o,8));for(let t=9;t<15;t++)this.setFunctionModule(14-t,8,i(o,t));for(let t=0;t<8;t++)this.setFunctionModule(this.size-1-t,8,i(o,t));for(let t=8;t<15;t++)this.setFunctionModule(8,this.size-15+t,i(o,t));this.setFunctionModule(8,this.size-8,!0)}drawVersion(){if(this.version<7)return;let t=this.version;for(let e=0;e<12;e++)t=t<<1^(t>>>11)*7973;let e=this.version<<12|t;n(e>>>18==0);for(let t=0;t<18;t++){let r=i(e,t),n=this.size-11+t%3,o=Math.floor(t/3);this.setFunctionModule(n,o,r),this.setFunctionModule(o,n,r)}}drawFinderPattern(t,e){for(let r=-4;r<=4;r++)for(let i=-4;i<=4;i++){let n=Math.max(Math.abs(i),Math.abs(r)),o=t+i,s=e+r;0<=o&&o<this.size&&0<=s&&s<this.size&&this.setFunctionModule(o,s,2!=n&&4!=n)}}drawAlignmentPattern(t,e){for(let r=-2;r<=2;r++)for(let i=-2;i<=2;i++)this.setFunctionModule(t+i,e+r,1!=Math.max(Math.abs(i),Math.abs(r)))}setFunctionModule(t,e,r){this.modules[e][t]=r,this.isFunction[e][t]=!0}addEccAndInterleave(t){let r=this.version,i=this.errorCorrectionLevel;if(t.length!=e.getNumDataCodewords(r,i))throw RangeError("Invalid argument");let o=e.NUM_ERROR_CORRECTION_BLOCKS[i.ordinal][r],s=e.ECC_CODEWORDS_PER_BLOCK[i.ordinal][r],a=Math.floor(e.getNumRawDataModules(r)/8),l=o-a%o,h=Math.floor(a/o),u=[],d=e.reedSolomonComputeDivisor(s);for(let r=0,i=0;r<o;r++){let n=t.slice(i,i+h-s+(r<l?0:1));i+=n.length;let o=e.reedSolomonComputeRemainder(n,d);r<l&&n.push(0),u.push(n.concat(o))}let f=[];for(let t=0;t<u[0].length;t++)u.forEach((e,r)=>{(t!=h-s||r>=l)&&f.push(e[t])});return n(f.length==a),f}drawCodewords(t){if(t.length!=Math.floor(e.getNumRawDataModules(this.version)/8))throw RangeError("Invalid argument");let r=0;for(let e=this.size-1;e>=1;e-=2){6==e&&(e=5);for(let n=0;n<this.size;n++)for(let o=0;o<2;o++){let s=e-o,a=(e+1&2)==0?this.size-1-n:n;!this.isFunction[a][s]&&r<8*t.length&&(this.modules[a][s]=i(t[r>>>3],7-(7&r)),r++)}}n(r==8*t.length)}applyMask(t){if(t<0||t>7)throw RangeError("Mask value out of range");for(let e=0;e<this.size;e++)for(let r=0;r<this.size;r++){let i;switch(t){case 0:i=(r+e)%2==0;break;case 1:i=e%2==0;break;case 2:i=r%3==0;break;case 3:i=(r+e)%3==0;break;case 4:i=(Math.floor(r/3)+Math.floor(e/2))%2==0;break;case 5:i=r*e%2+r*e%3==0;break;case 6:i=(r*e%2+r*e%3)%2==0;break;case 7:i=((r+e)%2+r*e%3)%2==0;break;default:throw Error("Unreachable")}!this.isFunction[e][r]&&i&&(this.modules[e][r]=!this.modules[e][r])}}getPenaltyScore(){let t=0;for(let r=0;r<this.size;r++){let i=!1,n=0,o=[0,0,0,0,0,0,0];for(let s=0;s<this.size;s++)this.modules[r][s]==i?5==++n?t+=e.PENALTY_N1:n>5&&t++:(this.finderPenaltyAddHistory(n,o),!i&&(t+=this.finderPenaltyCountPatterns(o)*e.PENALTY_N3),i=this.modules[r][s],n=1);t+=this.finderPenaltyTerminateAndCount(i,n,o)*e.PENALTY_N3}for(let r=0;r<this.size;r++){let i=!1,n=0,o=[0,0,0,0,0,0,0];for(let s=0;s<this.size;s++)this.modules[s][r]==i?5==++n?t+=e.PENALTY_N1:n>5&&t++:(this.finderPenaltyAddHistory(n,o),!i&&(t+=this.finderPenaltyCountPatterns(o)*e.PENALTY_N3),i=this.modules[s][r],n=1);t+=this.finderPenaltyTerminateAndCount(i,n,o)*e.PENALTY_N3}for(let r=0;r<this.size-1;r++)for(let i=0;i<this.size-1;i++){let n=this.modules[r][i];n==this.modules[r][i+1]&&n==this.modules[r+1][i]&&n==this.modules[r+1][i+1]&&(t+=e.PENALTY_N2)}let r=0;for(let t of this.modules)r=t.reduce((t,e)=>t+(e?1:0),r);let i=this.size*this.size,o=Math.ceil(Math.abs(20*r-10*i)/i)-1;return n(0<=o&&o<=9),n(0<=(t+=o*e.PENALTY_N4)&&t<=2568888),t}getAlignmentPatternPositions(){if(1==this.version)return[];{let t=Math.floor(this.version/7)+2,e=2*Math.floor((8*this.version+3*t+5)/(4*t-4)),r=[6];for(let i=this.size-7;r.length<t;i-=e)r.splice(1,0,i);return r}}static getNumRawDataModules(t){if(t<e.MIN_VERSION||t>e.MAX_VERSION)throw RangeError("Version number out of range");let r=(16*t+128)*t+64;if(t>=2){let e=Math.floor(t/7)+2;r-=(25*e-10)*e-55,t>=7&&(r-=36)}return n(208<=r&&r<=29648),r}static getNumDataCodewords(t,r){return Math.floor(e.getNumRawDataModules(t)/8)-e.ECC_CODEWORDS_PER_BLOCK[r.ordinal][t]*e.NUM_ERROR_CORRECTION_BLOCKS[r.ordinal][t]}static reedSolomonComputeDivisor(t){if(t<1||t>255)throw RangeError("Degree out of range");let r=[];for(let e=0;e<t-1;e++)r.push(0);r.push(1);let i=1;for(let n=0;n<t;n++){for(let t=0;t<r.length;t++)r[t]=e.reedSolomonMultiply(r[t],i),t+1<r.length&&(r[t]^=r[t+1]);i=e.reedSolomonMultiply(i,2)}return r}static reedSolomonComputeRemainder(t,r){let i=r.map(t=>0);for(let n of t){let t=n^i.shift();i.push(0),r.forEach((r,n)=>i[n]^=e.reedSolomonMultiply(r,t))}return i}static reedSolomonMultiply(t,e){if(t>>>8!=0||e>>>8!=0)throw RangeError("Byte out of range");let r=0;for(let i=7;i>=0;i--)r=r<<1^(r>>>7)*285^(e>>>i&1)*t;return n(r>>>8==0),r}finderPenaltyCountPatterns(t){let e=t[1];n(e<=3*this.size);let r=e>0&&t[2]==e&&t[3]==3*e&&t[4]==e&&t[5]==e;return(r&&t[0]>=4*e&&t[6]>=e?1:0)+(r&&t[6]>=4*e&&t[0]>=e?1:0)}finderPenaltyTerminateAndCount(t,e,r){return t&&(this.finderPenaltyAddHistory(e,r),e=0),e+=this.size,this.finderPenaltyAddHistory(e,r),this.finderPenaltyCountPatterns(r)}finderPenaltyAddHistory(t,e){0==e[0]&&(t+=this.size),e.pop(),e.unshift(t)}constructor(t,r,i,o){if((0,a._)(this,"version",void 0),(0,a._)(this,"errorCorrectionLevel",void 0),(0,a._)(this,"size",void 0),(0,a._)(this,"mask",void 0),(0,a._)(this,"modules",void 0),(0,a._)(this,"isFunction",void 0),this.version=t,this.errorCorrectionLevel=r,this.modules=[],this.isFunction=[],t<e.MIN_VERSION||t>e.MAX_VERSION)throw RangeError("Version value out of range");if(o<-1||o>7)throw RangeError("Mask value out of range");this.size=4*t+17;let s=[];for(let t=0;t<this.size;t++)s.push(!1);for(let t=0;t<this.size;t++)this.modules.push(s.slice()),this.isFunction.push(s.slice());this.drawFunctionPatterns();let l=this.addEccAndInterleave(i);if(this.drawCodewords(l),-1==o){let t=1e9;for(let e=0;e<8;e++){this.applyMask(e),this.drawFormatBits(e);let r=this.getPenaltyScore();r<t&&(o=e,t=r),this.applyMask(e)}}n(0<=o&&o<=7),this.mask=o,this.applyMask(o),this.drawFormatBits(o),this.isFunction=[]}}function r(t,e,r){if(e<0||e>31||t>>>e!=0)throw RangeError("Value out of range");for(let i=e-1;i>=0;i--)r.push(t>>>i&1)}function i(t,e){return(t>>>e&1)!=0}function n(t){if(!t)throw Error("Assertion error")}(0,a._)(e,"MIN_VERSION",1),(0,a._)(e,"MAX_VERSION",40),(0,a._)(e,"PENALTY_N1",3),(0,a._)(e,"PENALTY_N2",3),(0,a._)(e,"PENALTY_N3",40),(0,a._)(e,"PENALTY_N4",10),(0,a._)(e,"ECC_CODEWORDS_PER_BLOCK",[[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],[-1,13,22,18,26,18,24,18,22,20,24,28,26,24,20,30,24,28,28,26,30,28,30,30,30,30,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,17,28,22,16,22,28,26,26,24,28,24,28,22,24,24,30,28,28,26,28,30,24,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30,30]]),(0,a._)(e,"NUM_ERROR_CORRECTION_BLOCKS",[[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25],[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49],[-1,1,1,2,2,4,4,6,6,8,8,8,10,12,16,12,17,16,18,21,20,23,23,25,27,29,34,34,35,38,40,43,45,48,51,53,56,59,62,65,68],[-1,1,1,2,4,4,4,5,6,8,8,11,11,16,16,18,16,19,21,25,25,25,34,30,32,35,37,40,42,45,48,51,54,57,60,63,66,70,74,77,81]]),t.QrCode=e;class o{static makeBytes(t){let e=[];for(let i of t)r(i,8,e);return new o(o.Mode.BYTE,t.length,e)}static makeNumeric(t){if(!o.isNumeric(t))throw RangeError("String contains non-numeric characters");let e=[];for(let i=0;i<t.length;){let n=Math.min(t.length-i,3);r(parseInt(t.substring(i,i+n),10),3*n+1,e),i+=n}return new o(o.Mode.NUMERIC,t.length,e)}static makeAlphanumeric(t){let e;if(!o.isAlphanumeric(t))throw RangeError("String contains unencodable characters in alphanumeric mode");let i=[];for(e=0;e+2<=t.length;e+=2){let n=45*o.ALPHANUMERIC_CHARSET.indexOf(t.charAt(e));r(n+=o.ALPHANUMERIC_CHARSET.indexOf(t.charAt(e+1)),11,i)}return e<t.length&&r(o.ALPHANUMERIC_CHARSET.indexOf(t.charAt(e)),6,i),new o(o.Mode.ALPHANUMERIC,t.length,i)}static makeSegments(t){if(""==t)return[];if(o.isNumeric(t))return[o.makeNumeric(t)];if(o.isAlphanumeric(t))return[o.makeAlphanumeric(t)];else return[o.makeBytes(o.toUtf8ByteArray(t))]}static makeEci(t){let e=[];if(t<0)throw RangeError("ECI assignment value out of range");if(t<128)r(t,8,e);else if(t<16384)r(2,2,e),r(t,14,e);else if(t<1e6)r(6,3,e),r(t,21,e);else throw RangeError("ECI assignment value out of range");return new o(o.Mode.ECI,0,e)}static isNumeric(t){return o.NUMERIC_REGEX.test(t)}static isAlphanumeric(t){return o.ALPHANUMERIC_REGEX.test(t)}getData(){return this.bitData.slice()}static getTotalBits(t,e){let r=0;for(let i of t){let t=i.mode.numCharCountBits(e);if(i.numChars>=1<<t)return 1/0;r+=4+t+i.bitData.length}return r}static toUtf8ByteArray(t){t=encodeURI(t);let e=[];for(let r=0;r<t.length;r++)"%"!=t.charAt(r)?e.push(t.charCodeAt(r)):(e.push(parseInt(t.substring(r+1,r+3),16)),r+=2);return e}constructor(t,e,r){if((0,a._)(this,"mode",void 0),(0,a._)(this,"numChars",void 0),(0,a._)(this,"bitData",void 0),this.mode=t,this.numChars=e,this.bitData=r,e<0)throw RangeError("Invalid argument");this.bitData=r.slice()}}(0,a._)(o,"NUMERIC_REGEX",/^[0-9]*$/),(0,a._)(o,"ALPHANUMERIC_REGEX",/^[A-Z0-9 $%*+.\/:-]*$/),(0,a._)(o,"ALPHANUMERIC_CHARSET","0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:"),t.QrSegment=o}(o||(o={})),!function(t){class e{constructor(t,e){(0,a._)(this,"ordinal",void 0),(0,a._)(this,"formatBits",void 0),this.ordinal=t,this.formatBits=e}}(0,a._)(e,"LOW",new e(0,1)),(0,a._)(e,"MEDIUM",new e(1,0)),(0,a._)(e,"QUARTILE",new e(2,3)),(0,a._)(e,"HIGH",new e(3,2)),t.Ecc=e}((i=o||(o={})).QrCode||(i.QrCode={})),!function(t){class e{numCharCountBits(t){return this.numBitsCharCount[Math.floor((t+7)/17)]}constructor(t,e){(0,a._)(this,"modeBits",void 0),(0,a._)(this,"numBitsCharCount",void 0),this.modeBits=t,this.numBitsCharCount=e}}(0,a._)(e,"NUMERIC",new e(1,[10,12,14])),(0,a._)(e,"ALPHANUMERIC",new e(2,[9,11,13])),(0,a._)(e,"BYTE",new e(4,[8,16,16])),(0,a._)(e,"KANJI",new e(8,[8,10,12])),(0,a._)(e,"ECI",new e(7,[0,0,0])),t.Mode=e}((n=o||(o={})).QrSegment||(n.QrSegment={}));let l=o,h={L:l.QrCode.Ecc.LOW,M:l.QrCode.Ecc.MEDIUM,Q:l.QrCode.Ecc.QUARTILE,H:l.QrCode.Ecc.HIGH},u=function(){try{new Path2D().addPath(new Path2D)}catch(t){return!1}return!0}();function d(t){return t in h}function f(t){let e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,r=[];return t.forEach(function(t,i){let n=null;t.forEach(function(o,s){if(!o&&null!==n){r.push(`M${n+e} ${i+e}h${s-n}v1H${n+e}z`),n=null;return}if(s===t.length-1){if(!o)return;null===n?r.push(`M${s+e},${i+e} h1v1H${s+e}z`):r.push(`M${n+e},${i+e} h${s+1-n}v1H${n+e}z`);return}o&&null===n&&(n=s)})}),r.join("")}function c(t,e,r,i){let{width:n,height:o,x:s,y:a}=i,l=t.length+2*r,h=Math.floor(.1*e),u=l/e,d=(n||h)*u,f=(o||h)*u,c=null==s?t.length/2-d/2:s*u,g=null==a?t.length/2-f/2:a*u,m=null;if(i.excavate){let t=Math.floor(c),e=Math.floor(g),r=Math.ceil(d+c-t),i=Math.ceil(f+g-e);m={x:t,y:e,w:r,h:i}}return{x:c,y:g,h:f,w:d,excavation:m}}function g(t,e){return t.slice().map((t,r)=>r<e.y||r>=e.y+e.h?t:t.map((t,r)=>(!!(r<e.x)||!!(r>=e.x+e.w))&&t))}let m={value:{type:String,required:!0,default:""},size:{type:Number,default:100},level:{type:String,default:"L",validator:t=>t in h},background:{type:String,default:"#fff"},foreground:{type:String,default:"#000"},margin:{type:Number,required:!1,default:0},imageSettings:{type:Object,required:!1,default:()=>({})},gradient:{type:Boolean,required:!1,default:!1},gradientType:{type:String,required:!1,default:"linear",validator:t=>["linear","radial"].indexOf(t)>-1},gradientStartColor:{type:String,required:!1,default:"#000"},gradientEndColor:{type:String,required:!1,default:"#fff"}},p={...m,renderAs:{type:String,required:!1,default:"canvas",validator:t=>["canvas","svg"].indexOf(t)>-1}},E=(0,s.aZ)({name:"QRCodeSvg",props:m,setup(t){let e;let r=(0,s.iH)(0),i=(0,s.iH)(""),n=()=>{let{value:n,level:o,margin:s}=t,a=s>>>0,u=o in h?o:"L",d=l.QrCode.encodeText(n,h[u]).getModules();if(r.value=d.length+2*a,t.imageSettings.src){let r=c(d,t.size,a,t.imageSettings);e={x:r.x+a,y:r.y+a,width:r.w,height:r.h},r.excavation&&(d=g(d,r.excavation))}i.value=f(d,a)},o=()=>{if(!t.gradient)return null;let e="linear"===t.gradientType?{x1:"0%",y1:"0%",x2:"100%",y2:"100%"}:{cx:"50%",cy:"50%",r:"50%",fx:"50%",fy:"50%"};return(0,s.h)("linear"===t.gradientType?"linearGradient":"radialGradient",{id:"qr-gradient",...e},[(0,s.h)("stop",{offset:"0%",style:{stopColor:t.gradientStartColor}}),(0,s.h)("stop",{offset:"100%",style:{stopColor:t.gradientEndColor}})])};return n(),(0,s.ic)(n),()=>(0,s.h)("svg",{width:t.size,height:t.size,"shape-rendering":"crispEdges",xmlns:"http://www.w3.org/2000/svg",viewBox:`0 0 ${r.value} ${r.value}`},[(0,s.h)("defs",{},[o()]),(0,s.h)("rect",{width:"100%",height:"100%",fill:t.background}),(0,s.h)("path",{fill:t.gradient?"url(#qr-gradient)":t.foreground,d:i.value}),t.imageSettings.src&&(0,s.h)("image",{href:t.imageSettings.src,...e})])}}),v=(0,s.aZ)({name:"QRCodeCanvas",props:m,setup(t,e){let r=(0,s.iH)(null),i=(0,s.iH)(null),n=()=>{let{value:e,level:n,size:o,margin:s,background:a,foreground:d,gradient:m,gradientType:p,gradientStartColor:E,gradientEndColor:v}=t,C=s>>>0,M=n in h?n:"L",w=r.value;if(!w)return;let y=w.getContext("2d");if(!y)return;let R=l.QrCode.encodeText(e,h[M]).getModules(),_=R.length+2*C,N=i.value,A={x:0,y:0,width:0,height:0},S=t.imageSettings.src&&null!=N&&0!==N.naturalWidth&&0!==N.naturalHeight;if(S){let e=c(R,t.size,C,t.imageSettings);A={x:e.x+C,y:e.y+C,width:e.w,height:e.h},e.excavation&&(R=g(R,e.excavation))}let P=window.devicePixelRatio||1,I=o/_*P;if(w.height=w.width=o*P,y.scale(I,I),y.fillStyle=a,y.fillRect(0,0,_,_),m){let t;(t="linear"===p?y.createLinearGradient(0,0,_,_):y.createRadialGradient(_/2,_/2,0,_/2,_/2,_/2)).addColorStop(0,E),t.addColorStop(1,v),y.fillStyle=t}else y.fillStyle=d;u?y.fill(new Path2D(f(R,C))):R.forEach(function(t,e){t.forEach(function(t,r){t&&y.fillRect(r+C,e+C,1,1)})}),S&&y.drawImage(N,A.x,A.y,A.width,A.height)};(0,s.bv)(n),(0,s.ic)(n);let{style:o}=e.attrs;return()=>(0,s.h)(s.HY,[(0,s.h)("canvas",{...e.attrs,ref:r,style:{...o,width:`${t.size}px`,height:`${t.size}px`}}),t.imageSettings.src&&(0,s.h)("img",{ref:i,src:t.imageSettings.src,style:{display:"none"},onLoad:n})])}}),C=(0,s.aZ)({name:"Qrcode",render(){let{renderAs:t,value:e,size:r,margin:i,level:n,background:o,foreground:a,imageSettings:l,gradient:h,gradientType:u,gradientStartColor:d,gradientEndColor:f}=this.$props;return(0,s.h)("svg"===t?E:v,{value:e,size:r,margin:i,level:n,background:o,foreground:a,imageSettings:l,gradient:h,gradientType:u,gradientStartColor:d,gradientEndColor:f})},props:p}),M=(0,s.aZ)({components:{QrcodeVue:C},setup(){let t=(0,s.iH)("QRCODE.VUE ❤️ Thanks. 感谢. ありがたい. 감사. Reconnaissant. Dankbar. berterima kasih."),e=(0,s.iH)(135),r=(0,s.iH)("L"),i=(0,s.iH)("#ffffff"),n=(0,s.iH)("#000000"),o=(0,s.iH)("svg"),a=(0,s.iH)(0),l=(0,s.iH)({src:"https://github.com/scopewu.png",width:30,height:30,excavate:!0}),h=(0,s.iH)(!1),u=(0,s.iH)("linear"),d=(0,s.iH)("#000000"),f=(0,s.iH)("#38bdf8"),c=(0,s.iH)(700);return(0,s.bv)(()=>{(function(t){try{let e=new XMLHttpRequest;e.onreadystatechange=function(){4===e.readyState&&t(JSON.parse(e.response))},e.onerror=function(e){console.log(e),t({})},e.open("GET","https://api.github.com/repos/scopewu/qrcode.vue"),e.send()}catch(e){console.log(e),t({})}})(t=>{let{stargazers_count:e}=t;"number"==typeof e&&(c.value=e)})}),{value:t,size:e,level:r,background:i,foreground:n,renderAs:o,margin:a,imageSettings:l,stargazersCount:c,gradient:h,gradientType:u,gradientStartColor:d,gradientEndColor:f}}});(0,s.ri)(M).mount("#root")}},e={};function r(i){var n=e[i];if(void 0!==n)return n.exports;var o=e[i]={exports:{}};return t[i](o,o.exports,r),o.exports}r.m=t,r.d=function(t,e){for(var i in e)r.o(e,i)&&!r.o(t,i)&&Object.defineProperty(t,i,{enumerable:!0,get:e[i]})},r.g=function(){if("object"==typeof globalThis)return globalThis;try{return this||Function("return this")()}catch(t){if("object"==typeof window)return window}}(),r.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},(()=>{var t=[];r.O=function(e,i,n,o){if(i){o=o||0;for(var s=t.length;s>0&&t[s-1][2]>o;s--)t[s]=t[s-1];t[s]=[i,n,o];return}for(var a=1/0,s=0;s<t.length;s++){for(var i=t[s][0],n=t[s][1],o=t[s][2],l=!0,h=0;h<i.length;h++)(!1&o||a>=o)&&Object.keys(r.O).every(function(t){return r.O[t](i[h])})?i.splice(h--,1):(l=!1,o<a&&(a=o));if(l){t.splice(s--,1);var u=n();void 0!==u&&(e=u)}}return e}})(),r.rv=function(){return"1.1.4"},(()=>{var t={980:0};r.O.j=function(e){return 0===t[e]};var e=function(e,i){var n=i[0],o=i[1],s=i[2],a,l,h=0;if(n.some(function(e){return 0!==t[e]})){for(a in o)r.o(o,a)&&(r.m[a]=o[a]);if(s)var u=s(r)}for(e&&e(i);h<n.length;h++)l=n[h],r.o(t,l)&&t[l]&&t[l][0](),t[l]=0;return r.O(u)},i=self.webpackChunkqrcode_vue=self.webpackChunkqrcode_vue||[];i.forEach(e.bind(null,0)),i.push=e.bind(null,i.push.bind(i))})(),r.ruid="bundler=rspack@1.1.4";var i=r.O(void 0,["244"],function(){return r("533")});i=r.O(i)})();