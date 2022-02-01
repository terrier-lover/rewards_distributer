"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[780],{4780:function(t,e,r){r.r(e),r.d(e,{FailedVerificationError:function(){return m},MagicConnector:function(){return y},MagicLinkExpiredError:function(){return d},MagicLinkRateLimitError:function(){return p},UserRejectedRequestError:function(){return h}});var n=r(7776),o=r(6111);function i(t,e){t.prototype=Object.create(e.prototype),t.prototype.constructor=t,u(t,e)}function c(t){return c=Object.setPrototypeOf?Object.getPrototypeOf:function(t){return t.__proto__||Object.getPrototypeOf(t)},c(t)}function u(t,e){return u=Object.setPrototypeOf||function(t,e){return t.__proto__=e,t},u(t,e)}function a(){if("undefined"===typeof Reflect||!Reflect.construct)return!1;if(Reflect.construct.sham)return!1;if("function"===typeof Proxy)return!0;try{return Date.prototype.toString.call(Reflect.construct(Date,[],(function(){}))),!0}catch(t){return!1}}function f(t,e,r){return f=a()?Reflect.construct:function(t,e,r){var n=[null];n.push.apply(n,e);var o=new(Function.bind.apply(t,n));return r&&u(o,r.prototype),o},f.apply(null,arguments)}function s(t){var e="function"===typeof Map?new Map:void 0;return s=function(t){if(null===t||(r=t,-1===Function.toString.call(r).indexOf("[native code]")))return t;var r;if("function"!==typeof t)throw new TypeError("Super expression must either be null or a function");if("undefined"!==typeof e){if(e.has(t))return e.get(t);e.set(t,n)}function n(){return f(t,arguments,c(this).constructor)}return n.prototype=Object.create(t.prototype,{constructor:{value:n,enumerable:!1,writable:!0,configurable:!0}}),u(n,t)},s(t)}"undefined"!==typeof Symbol&&(Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator"))),"undefined"!==typeof Symbol&&(Symbol.asyncIterator||(Symbol.asyncIterator=Symbol("Symbol.asyncIterator")));var l={1:"mainnet",3:"ropsten",4:"rinkeby",42:"kovan"},h=function(t){function e(){var e;return(e=t.call(this)||this).name=e.constructor.name,e.message="The user rejected the request.",e}return i(e,t),e}(s(Error)),m=function(t){function e(){var e;return(e=t.call(this)||this).name=e.constructor.name,e.message="The email verification failed.",e}return i(e,t),e}(s(Error)),p=function(t){function e(){var e;return(e=t.call(this)||this).name=e.constructor.name,e.message="The Magic rate limit has been reached.",e}return i(e,t),e}(s(Error)),d=function(t){function e(){var e;return(e=t.call(this)||this).name=e.constructor.name,e.message="The Magic link has expired.",e}return i(e,t),e}(s(Error)),y=function(t){function e(e){var r,n=e.apiKey,i=e.chainId,c=e.email;return Object.keys(l).includes(i.toString())||(0,o.Z)(!1),c&&c.includes("@")||(0,o.Z)(!1),(r=t.call(this,{supportedChainIds:[i]})||this).apiKey=n,r.chainId=i,r.email=c,r}i(e,t);var n=e.prototype;return n.activate=function(){try{var t=this;return Promise.resolve(r.e(668).then(r.bind(r,2668)).then((function(t){var e;return null!=(e=null==t?void 0:t.default)?e:t}))).then((function(e){var r=e.Magic,n=e.RPCError,o=e.RPCErrorCode;return t.magic||(t.magic=new r(t.apiKey,{network:l[t.chainId]})),Promise.resolve(t.magic.user.isLoggedIn()).then((function(e){function r(r){function i(){function r(e){var r=t.magic.rpcProvider;return Promise.resolve(r.enable().then((function(t){return t[0]}))).then((function(e){return{provider:r,chainId:t.chainId,account:e}}))}var i=function(){if(!e)return function(t,e){try{var r=t()}catch(n){return e(n)}return r&&r.then?r.then(void 0,e):r}((function(){return Promise.resolve(t.magic.auth.loginWithMagicLink({email:t.email})).then((function(){}))}),(function(t){if(!(t instanceof n))throw t;if(t.code===o.MagicLinkFailedVerification)throw new m;if(t.code===o.MagicLinkExpired)throw new d;if(t.code===o.MagicLinkRateLimited)throw new p;if(-32603===t.code)throw new h}))}();return i&&i.then?i.then(r):r()}var c=e?r.email:r,u=function(){if(e&&c!==t.email)return Promise.resolve(t.magic.user.logout()).then((function(){}))}();return u&&u.then?u.then(i):i()}return e?Promise.resolve(t.magic.user.getMetadata()).then(r):r(null)}))}))}catch(e){return Promise.reject(e)}},n.getProvider=function(){try{return Promise.resolve(this.magic.rpcProvider)}catch(t){return Promise.reject(t)}},n.getChainId=function(){try{return Promise.resolve(this.chainId)}catch(t){return Promise.reject(t)}},n.getAccount=function(){try{return Promise.resolve(this.magic.rpcProvider.send("eth_accounts").then((function(t){return t[0]})))}catch(t){return Promise.reject(t)}},n.deactivate=function(){},n.close=function(){try{var t=this;return Promise.resolve(t.magic.user.logout()).then((function(){t.emitDeactivate()}))}catch(e){return Promise.reject(e)}},e}(n.Q)}}]);
//# sourceMappingURL=780.55757f36.chunk.js.map