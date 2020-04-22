import * as Handles from './constants'

export const mutations = {
	[Handles.SET_TOKEN]: (state, token) => {
		state.token = token
	},
	[Handles.SET_WALLET_INFO]: (state, walletInfo) => {
		state.walletInfo = walletInfo
	},
	[Handles.SET_TEAM_INFO]: (state, teamInfo) => {
		state.teamInfo = teamInfo
	},
	[Handles.SET_USER_INFO]: (state, userInfo) => {
		state.userInfo = userInfo
	},
	[Handles.CHANGE_MODE]: (state, mode) => {
		state.mode = mode
	},
	showLoading: (state) => {
		state.showLoading = true
	},
	hideLoading: (state) => {
		state.showLoading = false
	},
	setNewbie: (state, status) => {
		state.isNewbie = status
	},
	initDid: (state, status) => {
		state.isInit = status
	}
}
