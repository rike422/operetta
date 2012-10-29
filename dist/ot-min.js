/*
 *    /\
 *   /  \ ot 0.0.9
 *  /    \ http://ot.substance.io
 *  \    /
 *   \  / (c) 2012 Tim Baumann <tim@timbaumann.info> (http://timbaumann.info)
 *    \/ ot may be freely distributed under the MIT license.
 */
if(typeof ot=="undefined")var ot={};ot.TextOperation=function(){function e(){if(this.constructor!==e)return new e;this.ops=[],this.baseLength=0,this.targetLength=0}e.prototype.equals=function(e){if(this.baseLength!==e.baseLength)return!1;if(this.targetLength!==e.targetLength)return!1;if(this.ops.length!==e.ops.length)return!1;for(var t=0;t<this.ops.length;t++)if(this.ops[t]!==e.ops[t])return!1;return!0};var t=e.isRetain=function(e){return typeof e=="number"&&e>0},n=e.isInsert=function(e){return typeof e=="string"},r=e.isDelete=function(e){return typeof e=="number"&&e<0};return e.prototype.retain=function(e){if(typeof e!="number")throw new Error("retain expects an integer");return e===0?this:(this.baseLength+=e,this.targetLength+=e,t(this.ops[this.ops.length-1])?this.ops[this.ops.length-1]+=e:this.ops.push(e),this)},e.prototype.insert=function(e){if(typeof e!="string")throw new Error("insert expects a string");if(e==="")return this;this.targetLength+=e.length;var t=this.ops;return n(t[t.length-1])?t[t.length-1]+=e:r(t[t.length-1])?n(t[t.length-2])?t[t.length-2]+=e:(t[t.length]=t[t.length-1],t[t.length-2]=e):t.push(e),this},e.prototype["delete"]=function(e){typeof e=="string"&&(e=e.length);if(typeof e!="number")throw new Error("delete expects an integer or a string");return e===0?this:(e>0&&(e=-e),this.baseLength-=e,r(this.ops[this.ops.length-1])?this.ops[this.ops.length-1]+=e:this.ops.push(e),this)},e.prototype.isNoop=function(){return this.ops.length===0||this.ops.length===1&&t(this.ops[0])},e.prototype.toString=function(){var e=Array.prototype.map||function(e){var t=this,n=[];for(var r=0,i=t.length;r<i;r++)n[r]=e(t[r]);return n};return e.call(this.ops,function(e){return t(e)?"retain "+e:n(e)?"insert '"+e+"'":"delete "+ -e}).join(", ")},e.prototype.toJSON=function(){return this.ops},e.fromJSON=function(i){var s=new e;for(var o=0,u=i.length;o<u;o++){var a=i[o];if(t(a))s.retain(a);else if(n(a))s.insert(a);else{if(!r(a))throw new Error("unknown operation: "+JSON.stringify(a));s["delete"](a)}}return s},e.prototype.apply=function(e){var r=this;if(e.length!==r.baseLength)throw new Error("The operation's base length must be equal to the string's length.");var i=[],s=0,o=0,u=this.ops;for(var a=0,f=u.length;a<f;a++){var l=u[a];if(t(l)){if(o+l>e.length)throw new Error("Operation can't retain more characters than are left in the string.");i[s++]=e.slice(o,o+l),o+=l}else n(l)?i[s++]=l:o-=l}if(o!==e.length)throw new Error("The operation didn't operate on the whole string.");return i.join("")},e.prototype.invert=function(r){var i=0,s=new e,o=this.ops;for(var u=0,a=o.length;u<a;u++){var f=o[u];t(f)?(s.retain(f),i+=f):n(f)?s["delete"](f.length):(s.insert(r.slice(i,i-f)),i-=f)}return s},e.prototype.compose=function(i){var s=this;if(s.targetLength!==i.baseLength)throw new Error("The base length of the second operation has to be the target length of the first operation");var o=new e,u=s.ops,a=i.ops,f=0,l=0,c=u[f++],h=a[l++];for(;;){if(typeof c=="undefined"&&typeof h=="undefined")break;if(r(c)){o["delete"](c),c=u[f++];continue}if(n(h)){o.insert(h),h=a[l++];continue}if(typeof c=="undefined")throw new Error("Cannot compose operations: first operation is too short.");if(typeof h=="undefined")throw new Error("Cannot compose operations: fist operation is too long.");if(t(c)&&t(h))c>h?(o.retain(h),c-=h,h=a[l++]):c===h?(o.retain(c),c=u[f++],h=a[l++]):(o.retain(c),h-=c,c=u[f++]);else if(n(c)&&r(h))c.length>-h?(c=c.slice(-h),h=a[l++]):c.length===-h?(c=u[f++],h=a[l++]):(h+=c.length,c=u[f++]);else if(n(c)&&t(h))c.length>h?(o.insert(c.slice(0,h)),c=c.slice(h),h=a[l++]):c.length===h?(o.insert(c),c=u[f++],h=a[l++]):(o.insert(c),h-=c.length,c=u[f++]);else{if(!t(c)||!r(h))throw new Error("This shouldn't happen: op1: "+JSON.stringify(c)+", op2: "+JSON.stringify(h));c>-h?(o["delete"](h),c+=h,h=a[l++]):c===-h?(o["delete"](h),c=u[f++],h=a[l++]):(o["delete"](c),h+=c,c=u[f++])}}return o},e.prototype.shouldBeComposedWith=function(i){function s(t,n){var r=t.ops,i=e.isRetain;switch(r.length){case 1:return r[0];case 2:return i(r[0])?r[1]:i(r[1])?r[0]:null;case 3:if(i(r[0])&&i(r[2]))return r[1]}return null}function o(e){return t(e.ops[0])?e.ops[0]:0}if(this.isNoop()||i.isNoop())return!0;var u=o(this),a=o(i),f=s(this),l=s(i);return!f||!l?!1:n(f)&&n(l)?u+f.length===a:r(f)&&r(l)?a-l===u||u===a:!1},e.transform=function(i,s){if(i.baseLength!==s.baseLength)throw new Error("Both operations have to have the same base length");var o=new e,u=new e,a=i.ops,f=s.ops,l=0,c=0,h=a[l++],p=f[c++];for(;;){if(typeof h=="undefined"&&typeof p=="undefined")break;if(n(h)){o.insert(h),u.retain(h.length),h=a[l++];continue}if(n(p)){o.retain(p.length),u.insert(p),p=f[c++];continue}if(typeof h=="undefined")throw new Error("Cannot compose operations: first operation is too short.");if(typeof p=="undefined")throw new Error("Cannot compose operations: first operation is too long.");var d;if(t(h)&&t(p))h>p?(d=p,h-=p,p=f[c++]):h===p?(d=p,h=a[l++],p=f[c++]):(d=h,p-=h,h=a[l++]),o.retain(d),u.retain(d);else if(r(h)&&r(p))-h>-p?(h-=p,p=f[c++]):h===p?(h=a[l++],p=f[c++]):(p-=h,h=a[l++]);else if(r(h)&&t(p))-h>p?(d=p,h+=p,p=f[c++]):-h===p?(d=p,h=a[l++],p=f[c++]):(d=-h,p+=h,h=a[l++]),o["delete"](d);else{if(!t(h)||!r(p))throw new Error("The two operations aren't compatible");h>-p?(d=-p,h+=p,p=f[c++]):h===-p?(d=h,h=a[l++],p=f[c++]):(d=h,p+=h,h=a[l++]),u["delete"](d)}}return[o,u]},e}(),typeof module=="object"&&(module.exports=ot.TextOperation);if(typeof ot=="undefined")var ot={};ot.Cursor=function(e){function n(e,t){this.position=e,this.selectionEnd=t}var t=e.ot?e.ot.TextOperation:require("./text-operation");return n.fromJSON=function(e){return new n(e.position,e.selectionEnd)},n.prototype.equals=function(e){return this.position===e.position&&this.selectionEnd===e.selectionEnd},n.prototype.compose=function(e){return e},n.prototype.transform=function(e){function r(n){var r=n,i=e.ops;for(var s=0,o=e.ops.length;s<o;s++){t.isRetain(i[s])?n-=i[s]:t.isInsert(i[s])?r+=i[s].length:(r-=Math.min(n,-i[s]),n+=i[s]);if(n<0)break}return r}var i=r(this.position);return this.position===this.selectionEnd?new n(i,i):new n(i,r(this.selectionEnd))},n}(this),typeof module=="object"&&(module.exports=ot.Cursor);if(typeof ot=="undefined")var ot={};ot.WrappedOperation=function(e){function t(e,t){this.wrapped=e,this.meta=t||{}}function n(e,t){for(var n in e)e.hasOwnProperty(n)&&(t[n]=e[n])}function r(e,t){if(typeof e=="object"){if(typeof e.compose=="function")return e.compose(t);var r={};return n(e,r),n(t,r),r}return t}function i(e,t){return typeof e=="object"&&typeof e.transform=="function"?e.transform(t):e}return t.prototype.apply=function(){return this.wrapped.apply.apply(this.wrapped,arguments)},t.prototype.invert=function(){var e=this.meta;return new t(this.wrapped.invert.apply(this.wrapped,arguments),typeof e=="object"&&typeof e.invert=="function"?e.invert.apply(e,arguments):e)},t.prototype.compose=function(e){return new t(this.wrapped.compose(e.wrapped),r(this.meta,e.meta))},t.transform=function(e,n){var r=e.wrapped.constructor.transform,s=r(e.wrapped,n.wrapped);return[new t(s[0],i(e.meta,n.wrapped)),new t(s[1],i(n.meta,e.wrapped))]},t}(this),typeof module=="object"&&(module.exports=ot.WrappedOperation);if(typeof ot=="undefined")var ot={};ot.UndoManager=function(){function r(t){this.maxItems=t||50,this.state=e,this.dontCompose=!1,this.undoStack=[],this.redoStack=[]}function i(e,t){var n=[],r=t.constructor;for(var i=e.length-1;i>=0;i--){var s=r.transform(e[i],t);(typeof s[0].isNoop!="function"||!s[0].isNoop())&&n.push(s[0]),t=s[1]}return n.reverse()}var e="normal",t="undoing",n="redoing";return r.prototype.add=function(e,r){if(this.state===t)this.redoStack.push(e),this.dontCompose=!0;else if(this.state===n)this.undoStack.push(e),this.dontCompose=!0;else{var i=this.undoStack;!this.dontCompose&&r&&i.length>0?i.push(e.compose(i.pop())):(i.push(e),i.length>this.maxItems&&i.shift()),this.dontCompose=!1,this.redoStack=[]}},r.prototype.transform=function(e){this.undoStack=i(this.undoStack,e),this.redoStack=i(this.redoStack,e)},r.prototype.performUndo=function(n){this.state=t;if(this.undoStack.length===0)throw new Error("undo not possible");n(this.undoStack.pop()),this.state=e},r.prototype.performRedo=function(t){this.state=n;if(this.redoStack.length===0)throw new Error("redo not possible");t(this.redoStack.pop()),this.state=e},r.prototype.canUndo=function(){return this.undoStack.length!==0},r.prototype.canRedo=function(){return this.redoStack.length!==0},r.prototype.isUndoing=function(){return this.state===t},r.prototype.isRedoing=function(){return this.state===n},r}(),typeof module=="object"&&(module.exports=ot.UndoManager);if(typeof ot=="undefined")var ot={};ot.Client=function(e){function t(e){this.revision=e,this.state=r}function n(){}function i(e){this.outstanding=e}function s(e,t){this.outstanding=e,this.buffer=t}t.prototype.setState=function(e){this.state=e},t.prototype.applyClient=function(e){this.setState(this.state.applyClient(this,e))},t.prototype.applyServer=function(e){this.revision++,this.setState(this.state.applyServer(this,e))},t.prototype.serverAck=function(){this.revision++,this.setState(this.state.serverAck(this))},t.prototype.sendOperation=function(e,t){throw new Error("sendOperation must be defined in child class")},t.prototype.applyOperation=function(e){throw new Error("applyOperation must be defined in child class")},t.Synchronized=n,n.prototype.applyClient=function(e,t){return e.sendOperation(e.revision,t),new i(t)},n.prototype.applyServer=function(e,t){return e.applyOperation(t),this},n.prototype.serverAck=function(e){throw new Error("There is no pending operation.")};var r=new n;return t.AwaitingConfirm=i,i.prototype.applyClient=function(e,t){return new s(this.outstanding,t)},i.prototype.applyServer=function(e,t){var n=t.constructor.transform(this.outstanding,t);return e.applyOperation(n[1]),new i(n[0])},i.prototype.serverAck=function(e){return r},t.AwaitingWithBuffer=s,s.prototype.applyClient=function(e,t){var n=this.buffer.compose(t);return new s(this.outstanding,n)},s.prototype.applyServer=function(e,t){var n=t.constructor.transform,r=n(this.outstanding,t),i=n(this.buffer,r[1]);return e.applyOperation(i[1]),new s(r[0],i[0])},s.prototype.serverAck=function(e){return e.sendOperation(e.revision,this.buffer),new i(this.buffer)},t}(this),typeof module=="object"&&(module.exports=ot.Client),ot.CodeMirrorAdapter=function(){function n(e){this.cm=e,this.silent=!1,this.oldValue=this.cm.getValue();var t=this;e.on("change",function(e,n){t.onChange(n)}),e.on("cursorActivity",function(){t.trigger("cursorActivity")})}function i(e,t){if(!e)throw new Error(t||"assertion error")}var e=ot.TextOperation,t=ot.Cursor;n.operationFromCodeMirrorChange=function(t,n){function s(e){var t=e.line,n=e.ch,r=0;for(var s=0;s<e.line;s++)r+=i[s].length+1;return r+=n,r}function o(){var e=0;for(var t=0,n=i.length;t<n;t++)e+=i[t].length;return e+i.length-1}function u(e,t){if(e.line===t.line)return i[e.line].slice(e.ch,t.ch);var n=i[e.line].slice(e.ch)+"\n";for(var r=e.line+1;r<t.line;r++)n+=i[r]+"\n";return n+=i[t.line].slice(0,t.ch),n}function a(e,t,n){var r=e.slice(0),s=i[t.line].slice(0,t.ch),o=i[n.line].slice(n.ch);r[0]=s+r[0],r[r.length-1]+=o,r.unshift(n.line-t.line+1),r.unshift(t.line),i.splice.apply(i,r)}function f(e,t){var n=s(t.from),r=s(t.to),i=o();e.retain(n),e["delete"](u(t.from,t.to)),e.insert(t.text.join("\n")),e.retain(i-r),a(t.text,t.from,t.to)}var r=new e,i=n.split("\n");f(r,t);for(;;){t=t.next;if(!t)break;var l=new e(r.revision+1);f(l,t),r=r.compose(l)}return r},n.applyOperationToCodeMirror=function(t,n){n.operation(function(){var r=t.ops,s=0;for(var o=0,u=r.length;o<u;o++){var a=r[o];if(e.isRetain(a))s+=a;else if(e.isInsert(a))n.replaceRange(a,n.posFromIndex(s)),s+=a.length;else if(e.isDelete(a)){var f=n.posFromIndex(s),l=n.posFromIndex(s-a);n.replaceRange("",f,l)}}i(s===n.getValue().length)})},n.prototype.registerCallbacks=function(e){this.callbacks=e},n.prototype.onChange=function(e){var t=n.operationFromCodeMirrorChange(e,this.oldValue);this.silent||this.trigger("change",this.oldValue,t),this.oldValue=this.cm.getValue()},n.prototype.getValue=function(){return this.oldValue},n.prototype.getCursor=function(){function e(e,t){return e.line===t.line&&e.ch===t.ch}var n=this.cm,r=n.getCursor(),i=n.indexFromPos(r),s;if(n.somethingSelected()){var o=n.getCursor(!0),u=e(r,o)?n.getCursor(!1):o;s=n.indexFromPos(u)}else s=i;return new t(i,s)},n.prototype.setCursor=function(e){this.cm.setSelection(this.cm.posFromIndex(e.position),this.cm.posFromIndex(e.selectionEnd))};var r=function(){var e={};return function(t){if(e[t])return;e[t]=!0;try{var n=document.styleSheets.item(0),r=(n.rules?n.rules:n.cssRules).length;n.insertRule(t,r)}catch(i){console.error("Couldn't add style rule.",i)}}}();return n.prototype.setOtherCursor=function(e,t){var n=this.cm.posFromIndex(e.position);if(e.position===e.selectionEnd){var i=this.cm.cursorCoords(n),s=document.createElement("pre");return s.className="other-client",s.style.borderLeftWidth="2px",s.style.borderLeftStyle="solid",s.innerHTML="&nbsp;",s.style.borderLeftColor=t,s.style.height=(i.bottom-i.top)*.85+"px",this.cm.addWidget(n,s,!1),{clear:function(){var e=s.parentNode;e&&e.removeChild(s)}}}var o=/^#([0-9a-fA-F]{6})$/.exec(t);if(!o)throw new Error("only six-digit hex colors are allowed.");var u="selection-"+o[1],a="."+u+" { background: "+t+"; }";r(a);var f,l;return e.selectionEnd>e.position?(f=n,l=this.cm.posFromIndex(e.selectionEnd)):(f=this.cm.posFromIndex(e.selectionEnd),l=n),this.cm.markText(f,l,u)},n.prototype.trigger=function(e){var t=Array.prototype.slice.call(arguments,1),n=this.callbacks&&this.callbacks[e];n&&n.apply(this,t)},n.prototype.applyOperation=function(e){this.silent=!0,n.applyOperationToCodeMirror(e,this.cm),this.silent=!1},n.prototype.registerUndo=function(e){this.cm.undo=e},n.prototype.registerRedo=function(e){this.cm.redo=e},n}(),ot.SocketIOAdapter=function(){function e(e){this.socket=e;var t=this;e.on("client_left",function(e){t.trigger("client_left",e.clientId)}).on("set_name",function(e){t.trigger("set_name",e.clientId,e.name)}).on("ack",function(){t.trigger("ack")}).on("operation",function(e){t.trigger("operation",e)}).on("cursor",function(e){t.trigger("cursor",e.clientId,e.cursor)})}return e.prototype.sendOperation=function(e,t){t.revision=e,this.socket.emit("operation",t)},e.prototype.sendCursor=function(e){this.socket.emit("cursor",e)},e.prototype.registerCallbacks=function(e){this.callbacks=e},e.prototype.trigger=function(e){var t=Array.prototype.slice.call(arguments,1),n=this.callbacks&&this.callbacks[e];n&&n.apply(this,t)},e}(),ot.EditorClient=function(){function s(e,t){this.cursorBefore=e,this.cursorAfter=t}function o(e,t){this.clientId=e,this.cursor=t}function u(e,t,n,r,i){this.id=e,this.listEl=t,this.editorAdapter=n,this.name=r,this.li=document.createElement("li"),r&&(this.li.textContent=r,this.listEl.appendChild(this.li)),i&&this.updateCursor(i),this.setColor(r?c(r):Math.random())}function a(s,u,a,f){e.call(this,s),this.serverAdapter=a,this.editorAdapter=f,this.undoManager=new n,this.initializeClientList(),this.initializeClients(u);var l=this;this.editorAdapter.registerCallbacks({change:function(e,t){l.onChange(e,t)},cursorActivity:function(){l.onCursorActivity()}}),this.editorAdapter.registerUndo(function(){l.undo()}),this.editorAdapter.registerRedo(function(){l.redo()}),this.serverAdapter.registerCallbacks({client_left:function(e){l.onClientLeft(e)},set_name:function(e,t){l.getClientObject(e).setName(t)},ack:function(){l.serverAck()},operation:function(e){l.applyServer(new i(r.fromJSON(e.operation),o.fromJSON(e.meta)))},cursor:function(e,n){l.getClientObject(e).updateCursor(t.fromJSON(n))}})}function f(e,t,n){function r(e){var t=Math.round(255*e).toString(16);return t.length===1?"0"+t:t}return"#"+r(e)+r(t)+r(n)}function l(e,t,n){if(t===0)return f(n,n,n);var r=n<.5?n*(1+t):n+t-t*n,i=2*n-r,s=function(e){return e<0&&(e+=1),e>1&&(e-=1),6*e<1?i+(r-i)*6*e:2*e<1?r:3*e<2?i+(r-i)*6*(2/3-e):i};return f(s(e+1/3),s(e),s(e-1/3))}function c(e){var t=1;for(var n=0;n<e.length;n++)t=17*(t+e.charCodeAt(n))%360;return t/360}function h(e,t){function n(){}n.prototype=t.prototype,e.prototype=new n,e.prototype.constructor=e}function p(e){return e[e.length-1]}function d(e){e.parentNode&&e.parentNode.removeChild(e)}var e=ot.Client,t=ot.Cursor,n=ot.UndoManager,r=ot.TextOperation,i=ot.WrappedOperation;return s.prototype.invert=function(){return new s(this.cursorAfter,this.cursorBefore)},s.prototype.compose=function(e){return new s(this.cursorBefore,e.cursorAfter)},s.prototype.transform=function(e){return new s(this.cursorBefore.transform(e),this.cursorAfter.transform(e))},o.fromJSON=function(e){return new o(e.clientId,t.fromJSON(e.cursor))},o.prototype.transform=function(e){return new o(this.clientId,this.cursor.transform(e))},u.prototype.setColor=function(e){this.hue=e,this.color=l(e,.75,.5),this.lightColor=l(e,.5,.9),this.li&&(this.li.style.color=this.color)},u.prototype.setName=function(e){this.name=e,this.li.textContent=e,this.li.parentNode||this.listEl.appendChild(this.li),this.setColor(c(e))},u.prototype.updateCursor=function(e){this.cursor=e,this.mark&&this.mark.clear(),this.mark=this.editorAdapter.setOtherCursor(e,e.position===e.selectionEnd?this.color:this.lightColor)},u.prototype.remove=function(){this.li&&d(this.li),this.mark&&this.mark.clear()},h(a,e),a.prototype.initializeClients=function(e){this.clients={};for(var n in e)if(e.hasOwnProperty(n)){var r=e[n];r.clientId=n,this.clients[n]=new u(r.clientId,this.clientListEl,this.editorAdapter,r.name,r.cursor?t.fromJSON(r.cursor):null)}},a.prototype.getClientObject=function(e){var t=this.clients[e];return t?t:this.clients[e]=new u(e,this.clientListEl,this.editorAdapter)},a.prototype.onClientLeft=function(e){console.log("User disconnected: "+e);var t=this.clients[e];if(!t)return;t.remove(),delete this.clients[e]},a.prototype.initializeClientList=function(){this.clientListEl=document.createElement("ul")},a.prototype.applyUnredo=function(e){this.undoManager.add(e.invert(this.editorAdapter.getValue())),this.editorAdapter.applyOperation(e.wrapped),this.cursor=e.meta.cursorAfter,this.editorAdapter.setCursor(this.cursor),this.applyClient(e)},a.prototype.undo=function(){var e=this;this.undoManager.performUndo(function(t){e.applyUnredo(t)})},a.prototype.redo=function(){var e=this;this.undoManager.performRedo(function(t){e.applyUnredo(t)})},a.prototype.onChange=function(e,t){var n=this.cursor;this.updateCursor();var r=new s(n,this.cursor),o=new i(t,r),u=this.undoManager.undoStack.length>0&&!this.undoManager.dontCompose&&p(this.undoManager.undoStack).wrapped.invert(e).shouldBeComposedWith(t);this.undoManager.add(o.invert(e),u),this.applyClient(o)},a.prototype.updateCursor=function(){this.cursor=this.editorAdapter.getCursor()},a.prototype.onCursorActivity=function(){var t=this.cursor;this.updateCursor();if(t&&this.cursor.equals(t))return;if(this.state instanceof e.AwaitingWithBuffer)this.state.buffer.meta.cursorAfter=this.cursor;else{var n=this;this.serverAdapter.sendCursor(this.cursor)}},a.prototype.sendOperation=function(e,t){this.serverAdapter.sendOperation(e,{meta:{cursor:t.meta.cursorAfter},operation:t.wrapped.toJSON()})},a.prototype.applyOperation=function(e){this.editorAdapter.applyOperation(e.wrapped),this.updateCursor();var t=this.getClientObject(e.meta.clientId);t.updateCursor(e.meta.cursor),this.undoManager.transform(e)},a}();