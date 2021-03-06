import store from '@/vuex';
import i18n from '@/i18n';
import ErrorComponent from '@/components/error'

const lazyLoadView = AsyncView => {
	const AsyncHandler = () => ({
		component: AsyncView,
		error: ErrorComponent,
		delay: 200,
		timeout: 2000
	})

	return Promise.resolve({
		functional: true,
		render(h, { data, children }) {
			return h(AsyncHandler, data, children)
		}
	})
}

const router = new VueRouter({
	routes: [
		/* wallet */
		{
			path: '/',
			name: 'walletHome',
			component: () => lazyLoadView(import('@/views/wallet/index')),
			meta: {
				index: 1,
				title: 'meta.walletHome',
				keepAlive: true,
				requireAuth: false
			}
		},
		{
			path: '/transfer',
			name: 'walletTransfer',
			component: () => lazyLoadView(import('@/views/wallet/transfer')),
			meta: {
				index: 6,
				title: 'meta.walletTransfer',
				keepAlive: true,
				requireAuth: false
			}
		},
		{
			path: '/lock',
			name: 'walletLock',
			component: () => lazyLoadView(import('@/views/wallet/lock')),
			meta: {
				index: 6,
				title: 'meta.walletLock',
				keepAlive: true,
				requireAuth: false
			}
		},
		{
			path: '/redemption',
			name: 'walletRedemption',
			component: () => lazyLoadView(import('@/views/wallet/redemption')),
			meta: {
				index: 6,
				title: 'meta.walletRedemption',
				keepAlive: true,
				requireAuth: false
			}
		},
		{
			path: '/avatar',
			name: 'walletAvatar',
			component: () => lazyLoadView(import('@/views/wallet/avatar-old')),
			delay: 5000,
			meta: {
				index: 6,
				title: 'meta.walletAvatar',
				keepAlive: true,
				requireAuth: false
			}
		},
		{
			path: '/decode',
			name: 'walletDecode',
			component: () => lazyLoadView(import('@/views/wallet/decode')),
			meta: {
				index: 6,
				title: 'meta.walletDecode',
				keepAlive: true,
				requireAuth: false
			}
		},
		{
			path: '/update',
			name: 'walletUpdate',
			component: () => lazyLoadView(import('@/views/wallet/update')),
			meta: {
				index: 6,
				title: 'meta.walletUpdate',
				keepAlive: false,
				requireAuth: false
			}
		},
		{
			path: '/update-pubkey',
			name: 'walletUpdatePubkey',
			component: () => lazyLoadView(import('@/views/wallet/updatePubkey')),
			meta: {
				index: 6,
				title: 'meta.walletUpdatePubkey',
				keepAlive: true,
				requireAuth: false
			}
		},
		{
			path: '/profile',
			name: 'profile',
			component: () => lazyLoadView(import('@/views/wallet/profile')),
			meta: {
				index: 3,
				title: 'meta.profile',
				keepAlive: true,
				requireAuth: false
			}
		},
		/* team */
		{
			path: '/team',
			name: 'teamIndex',
			component: () => lazyLoadView(import('@/views/team/index')),
			meta: {
				index: 2,
				title: 'meta.teamIndex',
				keepAlive: true,
				requireAuth: false
			}
		},
		{
			path: '/team/logo',
			name: 'teamLogo',
			component: () => lazyLoadView(import('@/views/team/logo')),
			meta: {
				index: 3,
				title: 'meta.teamLogo',
				keepAlive: false,
				requireAuth: false
			}
		},
		{
			path: '/team/update',
			name: 'teamUpdate',
			component: () => lazyLoadView(import('@/views/team/update')),
			meta: {
				index: 3,
				title: 'meta.teamUpdate',
				keepAlive: true,
				requireAuth: false
			}
		},
		{
			path: '/team/member',
			name: 'teamMember',
			component: () => lazyLoadView(import('@/views/team/member')),
			meta: {
				index: 3,
				title: 'meta.teamMember',
				keepAlive: true,
				requireAuth: false
			}
		},
		{
			path: '/team/tags',
			name: 'tags',
			component: () => lazyLoadView(import('@/views/team/tags')),
			meta: {
				index: 4,
				title: 'meta.tags',
				keepAlive: true,
				requireAuth: false
			}
		},
		{
			path: '/team/qrcode',
			name: 'qrcode',
			component: () => lazyLoadView(import('@/views/team/qrcode')),
			meta: {
				index: 4,
				title: 'meta.qrcode',
				keepAlive: false,
				requireAuth: false
			}
		},
		/* common */
		{
			path: '/register',
			name: 'register',
			component: () => lazyLoadView(import('@/views/register')),
			meta: {
				index: 3,
				title: 'meta.register',
				keepAlive: true,
				requireAuth: false
			}
		},
		{
			path: '/help',
			name: 'help',
			component: () => lazyLoadView(import('@/views/help')),
			meta: {
				index: 3,
				title: 'meta.help',
				keepAlive: true,
				requireAuth: false
			}
		},
		/* acticity */
		{
			path: '/activity/lucky-wheel',
			name: 'luckyWheel',
			component: () => lazyLoadView(import('@/views/activity/luckyWheel')),
			meta: {
				index: 6,
				title: 'meta.luckyWheel',
				keepAlive: false,
				requireAuth: false
			}
		},
		{
			path: '/activity/promotion',
			name: 'promotion',
			component: () => lazyLoadView(import('@/views/activity/promotion')),
			meta: {
				index: 6,
				title: 'meta.promotion',
				keepAlive: false,
				requireAuth: false
			}
		},
		{
			path: '/activity/faucet',
			name: 'faucet',
			component: () => lazyLoadView(import('@/views/activity/faucet')),
			meta: {
				index: 6,
				title: 'meta.faucet',
				keepAlive: false,
				requireAuth: false
			}
		},
		{
			path: '/activity/mint',
			name: 'faucet',
			component: () => lazyLoadView(import('@/views/activity/mint')),
			meta: {
				index: 6,
				title: 'meta.mint',
				keepAlive: false,
				requireAuth: false
			}
		}, {
			path: '/show',
			name: 'show',
			component: () => lazyLoadView(import('@/views/activity/show')),
			meta: {
				index: 7,
				title: 'meta.show',
				keepAlive: false,
				requireAuth: false
			}
		}
	]
});

router.beforeEach(async(to, from, next) => {
	window.document.title = i18n.t(to.meta.title) || 'Task'
	if (to.matched.some(r => r.meta.requireAuth)) {
		if (store.state.token) {
			next()
		} else {
			next({
				name: 'home'
			})
		}
	} else if (to.name === 'walletHome' && window.location.href.indexOf('code') === -1) {
		const redirectUri = encodeURIComponent(window.location.href)
		window.location.href =
			`https://open.weixin.qq.com/connect/oauth2/authorize?appid=wx48f51627bef8bcdf&redirect_uri=${redirectUri}&response_type=code&scope=snsapi_userinfo&state=123#wechat_redirect`
	} else {
		next()
	}
})

export default router
