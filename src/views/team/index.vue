<template>
	<div class="team-component">
		<van-row type="flex" class="sumary" v-if="walletInfo.donate >= 5">
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
		<van-notice-bar v-if="walletInfo.donate >= 5" text="邀请更多朋友加入团队" left-icon="volume-o" mode="closeable" @click="show = true"
		 @close.stop />
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
				<van-cell-group v-if="walletInfo.donate >= 5 && teamInfo.name" title="我的团队" :border="false" class="team-info">
					<van-cell title="团队名称" :label="teamInfo.name" :center="true" is-link to="/team/update" />
					<van-cell title="团队规模" :center="true" :label="lockedRecords.max_quota | person" is-link to="/team/member" />
					<van-cell title="团队logo" :center="true" is-link to="/team/logo">
						<i i class="icon team-logo" :style="{ backgroundImage: `url(${teamInfo.url})`}" slot="icon"></i>
					</van-cell>
				</van-cell-group>
				<van-panel v-else-if="lockedRecords.locked_funds >= 5 && !teamInfo.name" :border="false">
					<div class="van-cell-group__title van-hairline--bottom page-bg" slot="header">我的团队</div>
					<p>您尚未创建团队</p>
					<van-button size="large" type="primary" :to="{ path: '/team/update?type=create' }">
						立即创建团队
					</van-button>
				</van-panel>
				<van-panel v-else>
					<div class="van-cell-group__title van-hairline--bottom page-bg" slot="header">我的团队</div>
					<p>您尚未抵押足够的币</p>

				</van-panel>
			</div>
			<van-panel v-if="walletInfo.donate < 5" class="desc">
				<div class="van-cell-group__title page-bg" slot="header">成为共识合伙人，您将拥有以下特权</div>
				<p>
					·定制社群名称和logo，并在区块链上登记。<br>
					·绑定社群成员关系，为社群成员带去福利，同时获得成员福利分成。<br>
					·社群成员有人成为共识合伙人后，您将获得推荐奖励。<br>
					·如果您是区块链项目方，可使用般若DID协议绑定自身主链地址，从而获取到用户的数字身份档案。
				</p>
				<p class="tips">
					注：成为共识合伙人需要 10PRM<br>
					我的当前余额 <b>{{ walletInfo.free_balance | money }}</b>
				</p>
			</van-panel>
		</div>
		<van-row class="footer" v-if="walletInfo.donate >= 5">
			<van-col span="12">
				<van-button square type="primary" size="large" to="/lock">抵押</van-button>
			</van-col>
			<van-col span="12">
				<van-button square color="#ccc" size="large" to="/redemption">赎回</van-button>
			</van-col>
		</van-row>
		<van-button v-else size="large" type="primary" @click="becomePartner" class="become-partner">
			立刻成为共识合伙人
		</van-button>
		<van-overlay :show="show">
			<div class="tips">
				<div class="con">
					<i class="png">
						<i class="png_shadow shadow_color-1"></i>
					</i>
				</div>
				<div class="desc">
					1、点击右上角<br>
					2、点击 “发送给朋友” 按钮发送到群里
				</div>
				<van-button plain type="default" @click="show = false">我知道了</van-button>
			</div>
		</van-overlay>
	</div>
</template>
<script>
	import { mapState, mapActions } from 'vuex'
	import { getTeamInfo, getMembers, getWxSignature } from '@/util/api'
	import { convert } from '@/util/chain'
	import { didToHex, formatNumber, sleep } from '@/util/common'
	import { SET_TEAM_INFO, SET_WALLET_INFO, DISPATCH_SIGN } from '@/vuex/constants'
	export default {
		name: 'teamIndex',
		data() {
			return {
				superior: '',
				num: 0,
				active: 0,
				show: false
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

				this.share()
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
				'teamInfo',
				'userInfo'
			])
		},
		methods: {
			becomePartner() {
				const self = this
				this.$dialog.confirm({
					title: '温馨提示',
					message: '确认成为共识合伙人，将扣除您10个币！',
				}).then(() => {
					const period = 30 * 60 * 60 * 24 * 1000
					const amount = formatNumber(10)
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
					short_index: this.walletInfo.short_index,
					nick_name: this.userInfo.nickname
				}
				this.$router.push({ path, query })
			},
			async share() {
				const shortIndex = this.walletInfo.short_index
				const nickName = this.userInfo.nickname
				const title = `"${nickName}"赠送你一个DID名额`
				const link = window.location.href.split('#')[0]
				const url = `${link}#/activity/promotion?short_index=${shortIndex}&nick_name=${encodeURIComponent(nickName)}`
				const { data } = await getWxSignature(link)
				const imgUrl = 'https://static.chain.pro/chain/praad.gif'
				wx.config({
					debug: process.env.VUE_APP_MODE === 'development',
					appId: data.appId,
					timestamp: data.timestamp,
					nonceStr: data.nonceStr,
					signature: data.signature,
					jsApiList: ['updateAppMessageShareData', 'updateTimelineShareData']
				})
				wx.ready(() => {
					console.log('wx ready')
					wx.updateAppMessageShareData({
						title,
						desc: '拥有DID，轻松领奖励，奖励秒到账，越领越丰厚',
						link: url,
						imgUrl,
						success() {
							console.log('share success')
						}
					})

					wx.updateTimelineShareData({
						title,
						link: url,
						imgUrl,
						success() {
							console.log('share to timeline success')
						}
					})
				})
				wx.error((e) => {
					console.log(e)
					alert(e)
				})
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

				.team-logo {
					border-radius: 3px;
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

		.footer,
		.become-partner {
			width: 100%;
			position: fixed;
			left: 0;
			bottom: 0;
		}

		.van-overlay {
			.tips {
				color: #fff;
				text-align: center;

				.con {
					display: inline-block;
					width: 150px;

					.png {
						display: block;
						position: absolute;
						right: -10px;
						height: 150px;
						width: 150px;
						margin-top: -160px; //使用 margin-top 偏移，将原图片隐藏到窗口之外
					}

					.png_shadow {
						display: inline-block;
						width: 100%;
						height: 100%;
						background: url(../../assets/images/arrow.png) no-repeat;
						background-size: 150px 150px;
					}

					.shadow_color-1 {
						filter: drop-shadow(0 130px #fff);
					}
				}

				.desc {
					margin-top: 80px;
					padding: 0 20px;
					font-size: 18px;
					text-align: left;
				}

				.van-button {
					width: 35%;
					background-color: transparent;
					font-size: 16px;
					color: #fff;
					margin-top: 30px;
				}
			}
		}
	}
</style>
