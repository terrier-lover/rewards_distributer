"use strict";(self.webpackChunkapp=self.webpackChunkapp||[]).push([[538],{1538:function(e,r,t){t.r(r),t.d(r,{WalletLinkConnector:function(){return c}});var n=t(7776);function o(){return o=Object.assign||function(e){for(var r=1;r<arguments.length;r++){var t=arguments[r];for(var n in t)Object.prototype.hasOwnProperty.call(t,n)&&(e[n]=t[n])}return e},o.apply(this,arguments)}function i(e,r){return i=Object.setPrototypeOf||function(e,r){return e.__proto__=r,e},i(e,r)}function a(e){if(void 0===e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return e}var c=function(e){var r,n;function c(r){var t,n=r.url,o=r.appName,i=r.appLogoUrl,c=r.darkMode,u=r.supportedChainIds;return(t=e.call(this,{supportedChainIds:u})||this).url=n,t.appName=o,t.appLogoUrl=i,t.darkMode=c||!1,t.handleChainChanged=t.handleChainChanged.bind(a(t)),t.handleAccountsChanged=t.handleAccountsChanged.bind(a(t)),t}n=e,(r=c).prototype=Object.create(n.prototype),r.prototype.constructor=r,i(r,n);var u=c.prototype;return u.activate=function(){try{var e=this,r=function(){return Promise.resolve(e.provider.request({method:"eth_requestAccounts"})).then((function(r){var t=r[0];return e.provider.on("chainChanged",e.handleChainChanged),e.provider.on("accountsChanged",e.handleAccountsChanged),{provider:e.provider,account:t}}))},n=function(){if(window.ethereum&&!0===window.ethereum.isCoinbaseWallet)e.provider=window.ethereum;else{var r=function(){if(!e.walletLink)return Promise.resolve(Promise.all([t.e(196),t.e(602)]).then(t.bind(t,7196)).then((function(e){var r;return null!=(r=null==e?void 0:e.default)?r:e}))).then((function(r){e.walletLink=new r(o({appName:e.appName,darkMode:e.darkMode},e.appLogoUrl?{appLogoUrl:e.appLogoUrl}:{})),e.provider=e.walletLink.makeWeb3Provider(e.url,1)}))}();if(r&&r.then)return r.then((function(){}))}}();return Promise.resolve(n&&n.then?n.then(r):r())}catch(i){return Promise.reject(i)}},u.getProvider=function(){try{return Promise.resolve(this.provider)}catch(e){return Promise.reject(e)}},u.getChainId=function(){try{return Promise.resolve(this.provider.chainId)}catch(e){return Promise.reject(e)}},u.getAccount=function(){try{return Promise.resolve(this.provider.request({method:"eth_requestAccounts"})).then((function(e){return e[0]}))}catch(e){return Promise.reject(e)}},u.deactivate=function(){this.provider.removeListener("chainChanged",this.handleChainChanged),this.provider.removeListener("accountsChanged",this.handleAccountsChanged)},u.close=function(){try{return this.provider.close(),this.emitDeactivate(),Promise.resolve()}catch(e){return Promise.reject(e)}},u.handleChainChanged=function(e){this.emitUpdate({chainId:e})},u.handleAccountsChanged=function(e){this.emitUpdate({account:e[0]})},c}(n.Q)}}]);
//# sourceMappingURL=538.eada4359.chunk.js.map