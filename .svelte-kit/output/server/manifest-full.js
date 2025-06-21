export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.M3nNHU-T.js",app:"_app/immutable/entry/app.wj9zZEv5.js",imports:["_app/immutable/entry/start.M3nNHU-T.js","_app/immutable/chunks/CVfseeaj.js","_app/immutable/chunks/BsYuGYGz.js","_app/immutable/chunks/Blb9x2fo.js","_app/immutable/entry/app.wj9zZEv5.js","_app/immutable/chunks/BsYuGYGz.js","_app/immutable/chunks/DlEsUiIj.js","_app/immutable/chunks/B9ZnqaTz.js","_app/immutable/chunks/Blb9x2fo.js","_app/immutable/chunks/BPmbYIwI.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
