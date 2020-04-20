<template>
	<div class="team-component">
		<van-row type="flex" class="sumary">
			<van-col span="12">
				已抵押
				<p>
					{{ lockedRecords.locked_funds | money }}
				</p>
			</van-col>
			<van-col span="12">
				最近赎回
				<p>
					{{ unlockRecords.unlocked_funds | money  }}
				</p>
			</van-col>
		</van-row>
		<van-notice-bar text="邀请更多朋友加入团队" left-icon="volume-o" mode="closeable" @click="invite" @close.stop />
		<van-panel v-if="teamInfo.tags && teamInfo.tags.length > 0">
			<div class="van-cell-group__title mp-0" slot="header">团队标签</div>
			<van-tag v-for="(tag, idx) in teamInfo.tags" round type="success" size="large" :key="idx">{{ tag }}</van-tag>
		</van-panel>
		<van-cell-group title="我的推荐人" :border="false">
			<van-cell :title="superior | clip(18, -10) || '您没有推荐人'" :center="true" />
			<van-cell title="团队管理信息" :center="true" is-link to="/team/qrcode" />
		</van-cell-group>
		<div class="team">
			<div class="myteam">
				<van-cell-group v-if="walletInfo.is_partner && teamInfo.name" title="我的团队" :border="false" class="team-info">
					<van-cell title="团队名称" :label="teamInfo.name" :center="true" is-link to="/team/update" />
					<van-cell title="团队规模" :center="true" :label="lockedRecords.max_quota | person" is-link to="/team/member" />
					<van-cell title="团队logo" :center="true" is-link to="/team/logo">
						<i i class="icon" :style="{ backgroundImage: `url(${teamInfo.url})`}" slot="icon"></i>
					</van-cell>
				</van-cell-group>
				<van-panel v-else-if="lockedRecords.locked_funds >= 25 && !teamInfo.name">
					<div class="van-cell-group__title van-hairline--bottom page-bg" slot="header">我的团队</div>
					<p>您尚未创建团队</p>
					<van-button size="large" type="primary" :to="{ path: '/team/update?type=create' }">
						立即创建团队
					</van-button>
				</van-panel>
				<van-panel v-else>
					<div class="van-cell-group__title van-hairline--bottom page-bg" slot="header">我的团队</div>
					<p>您尚未抵押足够的币</p>
					<van-button size="large" type="primary" @click="becomePartner">
						立刻成为共识合伙人
					</van-button>
				</van-panel>
			</div>
			<van-panel v-if="!walletInfo.is_partner" class="desc">
				<div class="van-cell-group__title page-bg" slot="header">成为共识合伙人，您将拥有以下特权</div>
				<p>
					·定制社群名称和logo，并在区块链上登记。<br>
					·绑定社群成员关系，为社群成员带去福利，同时获得成员福利分成。<br>
					·社群成员有人成为共识合伙人后，您将获得推荐奖励。<br>
					·如果您是区块链项目方，可使用般若DID协议绑定自身主链地址，从而获取到用户的数字身份档案。
				</p>
				<p class="tips">
					注：成为共识合伙人需要50PRM<br>
					我的当前余额 <b>{{ walletInfo.free_balance | money }}</b>
				</p>
			</van-panel>
		</div>
		<van-row class="footer">
			<van-col span="12">
				<van-button square type="primary" size="large" to="/lock">抵押</van-button>
			</van-col>
			<van-col span="12">
				<van-button square color="#ccc" size="large" to="/redemption">赎回</van-button>
			</van-col>
		</van-row>
	</div>
</template>
<script>
	import { mapState, mapActions } from 'vuex'
	import { getTeamInfo, getMembers } from '@/util/api'
	import { convert } from '@/util/chain'
	import { didToHex, formatNumber, sleep } from '@/util/common'
	import { SET_TEAM_INFO, SET_WALLET_INFO, DISPATCH_SIGN } from '@/vuex/constants'
	export default {
		name: 'teamIndex',
		data() {
			return {
				superior: '',
				num: 0,
				active: 0
			}
		},
		async mounted() {
			try {
				await sleep()
				// 上级did
				const { result } = await convert(this.walletInfo.superior, 'hash')
				this.superior = result

				const didHash = didToHex(this.walletInfo.did)
				const { meta } = await getMembers(didHash)
				this.num = meta.total

				const rs = await getTeamInfo(this.walletInfo.did)
				this[SET_TEAM_INFO](rs.data || {})
			} catch (error) {
				console.log(error);
			}
		},
		computed: {
			lockedRecords() {
				return this.walletInfo.locked_records || {}
			},
			unlockRecords() {
				return this.walletInfo.unlocked_records || {}
			},
			...mapState([
				'walletInfo',
				'teamInfo'
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
					const data = {
						address: self.walletInfo.address,
						method: 'lock',
						params: [amount, period]
					}
					console.log(data, 'lock data')
					self[DISPATCH_SIGN](data)
				}).catch(console.log)
			},
			invite() {
				const path = '/activity/promotion'
				const query = {
					short_index: this.walletInfo.short_index
				}
				this.$router.push({ path, query })
			},
			...mapActions([
				SET_TEAM_INFO,
				SET_WALLET_INFO,
				DISPATCH_SIGN
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
			background: $green;
			color: #fff;
			text-align: center;

			p {
				margin-top: $largeGutter;
				font-size: $largeFontSize*1.3;
			}
		}

		.van-panel {
			.van-panel__content {
				padding: $smallGutter;
			}

			.van-tag {
				margin: $smallGutter;
			}
		}

		.team {
			padding-bottom: $largeGutter*2.5;

			.myteam {
				p {
					color: $grey;
					padding: $mediumGutter;
				}
			}

			.team-info {
				.icon {
					width: 28px;
					height: 28px;
					background-size: 80%;
					border-radius: 100%;
					background-color: $grey;
				}

				.van-button {
					margin-top: $mediumGutter;
				}
			}

			.desc {
				line-height: 25px;

				p {
					padding: $mediumGutter;
				}

				.tips {
					margin-top: 30px;
					font-weight: bold;
				}
			}
		}

		.footer {
			width: 100%;
			position: fixed;
			left: 0;
			bottom: 0;
		}
	}
</style>
