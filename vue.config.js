module.exports = {
    lintOnSave: true,
    devServer: {
	    overlay: {
	      warnings: true,
	      errors: true
	    }
    },
    configureWebpack: {
        externals: {
            'vue': 'Vue',
            'vuex': 'Vuex',
            'vue-router': 'VueRouter',
            'vant': 'vant'
        }
    }
};
