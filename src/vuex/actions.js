import { hexToString, hexAddPrefix } from '@polkadot/util'
import * as Actions from './constants'
import { formatHexNumber } from '../util/common'
import vm from '../main'

export const actions = {
	[Actions.SET_TOKEN]: async({ commit }, token) => {
		commit(Actions.SET_TOKEN, token)
	},
	[Actions.SET_WALLET_INFO]: async({ commit }, walletInfo) => {
		// set client name
		vm.$socket.emit('setName', {
			name: walletInfo.did,
			address: walletInfo.address
		})
		commit(Actions.SET_WALLET_INFO, walletInfo)
	},
	[Actions.SET_TEAM_INFO]: async({ commit }, teamInfo) => {
		commit(Actions.SET_TEAM_INFO, teamInfo)
	},
	[Actions.SET_AVATAR]: async({ commit }, avatar) => {
		commit(Actions.SET_AVATAR, avatar)
	},
	/**
	 * @@@
	 * all socket relevant state
	 */
	[Actions.SOCKET_CONNECT]: ({ state: { walletInfo }}) => {
		console.log('connect------')
		if (walletInfo.did) {
			vm.$socket.emit('setName', {
				name: walletInfo.did,
				address: walletInfo.address
			})
		}
	},
	[Actions.SOCKET_DISCONNECT]: () => {
		console.log('disconnect------')
	},
	[Actions.SOCKET_RECONNECT]: () => {
		console.log('reconnect------')
	},
	[Actions.SOCKET_BALANCE_CHANGE]: ({ commit, state }, payload) => {
		const walletInfo = {
			...state.walletInfo,
			free_balance: payload.balance
		}
		commit(Actions.SET_WALLET_INFO, walletInfo)
	},
	[Actions.SOCKET_FAILED]: ({ commit }, payload) => {
		vm.$toast(payload.msg)
		commit('hideLoading')
	},
	[Actions.SOCKET_TRANSFERED]: ({ commit }) => {
		commit('hideLoading')
	},
	[Actions.SOCKET_LOCKED]: ({ state, commit }, payload) => {
		const [, lockedFunds, lockedTime, lockedPeriod, rewardsRatio, maxQuota] = JSON.parse(payload.msg)
		const lockedRecords = {
			locked_funds: formatHexNumber(lockedFunds),
			locked_time: lockedTime,
			locked_period: lockedPeriod,
			rewards_ratio: rewardsRatio,
			max_quota: formatHexNumber(maxQuota)
		}
		const walletInfo = {
			...state.walletInfo,
			locked_records: lockedRecords
		}
		commit(Actions.SET_WALLET_INFO, walletInfo)
		commit('hideLoading')
	},
	[Actions.SOCKET_UNLOCKED]: ({ state: { walletInfo }, commit }, payload) => {
		const [, amount, unlockedTime] = JSON.parse(payload.msg)
		const unlockedRecords = walletInfo.unlocked_records
		const unlockedFunds = formatHexNumber(amount)
		let newUnlockedFunds = (unlockedRecords.unlocked_funds || 0) + unlockedFunds

		// update locked data
		const lockedRecords = walletInfo.locked_records
		const lockedFunds = lockedRecords.locked_funds - unlockedFunds
		let maxQuota = lockedFunds * 10
		let rewardsRatio
		if (maxQuota >= walletInfo.subordinate_count) {
			rewardsRatio = 20
		} else {
			rewardsRatio = 100 * (1 - maxQuota / walletInfo.subordinate_count)
		}

		const newWalletInfo = {
			...walletInfo,
			locked_records: {
				...lockedRecords,
				locked_funds: lockedFunds,
				max_quota: maxQuota,
				rewards_ratio: rewardsRatio
			},
			unlocked_records: {
				unlocked_funds: newUnlockedFunds,
				unlocked_time: unlockedTime
			}
		}
		commit(Actions.SET_WALLET_INFO, newWalletInfo)
		commit('hideLoading')
	},
	[Actions.SOCKET_ADDRESS_ADDED]: ({ state: { walletInfo }, commit }, payload) => {
		let [, addressType, address] = JSON.parse(payload.msg)
		const externalAddress = walletInfo.external_address

		addressType = hexToString(addressType)
		address = hexToString(address)
		if (addressType === 'eth') address = hexAddPrefix(address)
		const newWalletInfo = {
			...walletInfo,
			external_address: {
				...externalAddress,
				[addressType]: address
			}
		}
		commit(Actions.SET_WALLET_INFO, newWalletInfo)
		commit('hideLoading')
		vm.$router.push(('/'))
	},
	[Actions.SOCKET_GROUPNAME_SET]: ({ commit }) => {
		commit('hideLoading')
	},
	[Actions.SOCKET_UPDATED]: ({ commit }) => {
		commit('hideLoading')
	},
	[Actions.SOCKET_CREATED]: ({ state, commit }) => {
		const subordinateCount = state.walletInfo.subordinate_count + 1
		const walletInfo = {
			...state.walletInfo,
			subordinate_count: subordinateCount
		}
		commit(Actions.SET_WALLET_INFO, walletInfo)
		commit('hideLoading')
	},
	[Actions.DISPATCH_SIGN]: ({ state, commit }, data) => {
		const params = Object.assign({}, data, {
			token: state.token
		})
		console.log(params, 'new params------')
		vm.$socket.emit('sign', params)
		commit('showLoading')
	},
};
