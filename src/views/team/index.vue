<template>
		<div class="team-component">
			<div class="sumary">
				<ul>
					<li>
						已抵押
						<p>
							{{ lockedRecords.locked_funds | money }}
						</p>
					</li>
					<li>
						已赎回
						<p>
							{{ unlockRecords.unlock_funds | money  }}
						</p>
					</li>
				</ul>
			</div>
			<div class="team">
					<div class="mysuperior">
						<h3>我的推荐人</h3>
						<p v-if="superior">
							{{ superior }}
						</p>
						<p v-else>
							您还没有推荐人
						</p>
					</div>
					<div class="myteam">
						<h3>我的团队</h3>
						<p v-if="!lockedRecords.locked_funds">
							您尚未抵押足够的PRA
							<van-button size="large" type="primary" @click="becomePartner">
								立刻成为共识合伙人
							</van-button>
						</p>
						<p v-else-if="lockedRecords.locked_funds >= 25 && !teamInfo.name">
							您尚未创建团队
							<van-button size="large" type="primary" :to="{ path: '/team/create' }">
								立即创建团队
							</van-button>
						</p>
						<div v-else class="team-info">
							<van-cell title="团队名称" :border="false" :label="teamInfo.name" :center="true" is-link to="/team/update" />
							<van-cell title="团队规模" :border="false" :value="`${lockedRecords.max_quota || 0}人`" />
							<van-cell title="团队成员" :border="false" :label="`${num}人`" :center="true" is-link to="/team/member" />
							<van-cell title="团队logo" :border="false" is-link :to="{ path: '/team/logo', query: { url: teamInfo.url } }">
								<i i class="icon" :style="{ backgroundImage: `url(${teamInfo.url})`}" slot="icon"></i>
							</van-cell>
							<div class="btns">
								<van-button type="primary" to="/redemption">
									赎回
								</van-button>
								<van-button type="primary" to="/lock">
									抵押
								</van-button>
							</div>
						</div>
					</div>
					<div v-if="!lockedRecords.locked_funds" class="desc">
						<h3>成为共识合伙人，您将拥有以下特权</h3>
						<p>
							·定制社群名称和logo，并在区块链上登记。<br>
							·绑定社群成员关系，为社群成员带去福利，同时获得成员福利分成。<br>
							·社群成员有人成为共识合伙人后，您将获得推荐奖励。<br>
							·如果您是区块链项目方，可使用般若DID协议绑定自身主链地址，从而获取到用户的数字身份档案。
						</p>
						<p class="tips">
							注：成为共识合伙人需要50PRA<br>
							我的当前余额 <b>{{ walletInfo.free_balance | money }}</b>
						</p>
					</div>
			</div>
		</div>
</template>
<script>
import { mapState, mapActions } from 'vuex'
import { getTeamInfo, getMembers } from '@/util/api'
import { didToHex, clipAddress, formatNumber, sleep } from '@/util/common'
import { SET_TEAM_INFO, SET_WALLET_INFO } from '@/vuex/constants'
export default {
	name: 'teamIndex',
	data() {
		return {
			teamInfo: {},
			num: 0
		}
	},
	async mounted() {
		try {
			await sleep(300)
			const didHash = didToHex(this.walletInfo.did)
			const { data: { page }} = await getMembers(didHash)
			this.num = page.dataTotal

			const rs = await getTeamInfo(this.walletInfo.did)
			if (rs.hasErrors) return this.$toast.error(rs.message)
			this.teamInfo = rs.data || {}
			this[SET_TEAM_INFO](this.teamInfo)
		} catch (error) {
			console.log(error);
		}
	},
	computed: {
		superior() {
			const superior = this.walletInfo.superior;
			return superior && clipAddress(superior, 18, -10)
		},
		lockedRecords() {
			return this.walletInfo.locked_records || {}
		},
		unlockRecords() {
			return this.walletInfo.unlocked_records || {}
		},
		...mapState([
			'walletInfo'
		])
	},
	methods: {
		becomePartner() {
			const self = this
			this.$dialog.confirm({
				title: '温馨提示',
				message: '确认成为共识合伙人，将扣除您50个币！',
			}).then(() => {
				const period = 30 * 60 * 60 * 24
				const amount = formatNumber(50)
				const data = JSON.stringify({
					address: self.walletInfo.address,
					method: 'lock',
					params: [amount, period]
				});
				console.log(data, 'lock data')
				self.$socket.emit('sign', data)
			}).catch(console.log)
		},
		...mapActions([
			SET_TEAM_INFO,
			SET_WALLET_INFO
		])
	}
};
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';
	.team-component {
		font-size: $mediumFontSize;
		color: #515a6e;
		.sumary {
			padding: 25px 0;
			background: #19be6b;
			color: #fff;
			overflow: hidden;
			li {
				float: left;
				width: 50%;
				text-align: center;
				line-height: 40px;
				p {
					font-size: $largeFontSize*1.3;
				}
			}
		}
		.team {
			padding: 18px;
			h3 {
				margin-bottom: $smallGutter;
			}
			p {
				padding-bottom: $largeGutter;
			}
			button {
				margin: $mediumGutter 0;
			}
			.team-info {
				.van-cell {
					background: transparent;
					padding: 5px 0;
				}
				.icon {
					display: inline-block;
					width: 28px;
					height: 28px;
					background-repeat: no-repeat;
					background-size: 90%;
					background-position: center;
					vertical-align: middle;
					margin-right: $smallGutter;
					border-radius: 100%;
					background-color: #999;
				}
				li {
					line-height: 30px;
					height: 30px;
					overflow: hidden;
					button {
						margin-top: 8px;
						float: right;
						font-size: $mediumFontSize;
						padding: 0;
					}
				}
			}
			.btns {
				text-align: center;
				margin-top: 150px;
				button {
					min-width: 100px;
					margin: 0 15px;
				}
			}
		 .desc {
				.tips {
					margin-top: 30px;
					font-weight: bold;
				}
				button {
					margin-top: 100px;
				}
			}
		}
	}
</style>
