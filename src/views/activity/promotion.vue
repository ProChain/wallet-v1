<template>
	<div class="promotion">
		<van-notice-bar v-if="!teamInfo.name " text="请先创建团队再分享此页面!" left-icon="volume-o" />
		<div class="bg"></div>
		<div class="bg-color"></div>
		<div class="content">
			<div class="profile">
				<div class="user">
					<van-image round width="1.5rem" height="1.5rem" :src="teamInfo.url" />
					<div>
						<p>
							{{ teamInfo.name }} 共识合伙人
						</p>
						<p>
							{{ nickName }}
						</p>
					</div>
				</div>
				<h2>
					赠送你一个DID名额
				</h2>
				<h3>
					他只剩下 {{ members }} 个名额了
				</h3>
			</div>
			<div class="code">
				<h3>推荐码</h3>
				<h2>{{ shortIndex }}</h2>
			</div>
			<div class="desc">
				<p>
					“DID（分散式身份）是Web3.0的重要基础设施，让您真正掌握自己的注意力价值与数据主权，随时随地获得Web3.0的广告收益”
				</p>
				<van-button type="warning" round size="large" @click="create">立即创建</van-button>
			</div>
		</div>
	</div>
</template>

<script>
	import { convert, getMetadata } from '@/util/chain'
	import { getTeamInfo, getWxSignature } from '@/util/api'
	import wx from 'weixin-js-sdk'
	export default {
		name: 'promotion',
		data() {
			return {
				shortIndex: '',
				nickName: '',
				members: 0,
				teamInfo: {}
			}
		},
		async created() {
			try {
				const { short_index: short, nick_name: nickName } = this.$route.query
				this.shortIndex = short
				this.nickName = nickName

				const { result } = await convert(short, 'index')
				const { data: metadata } = await getMetadata(result)
				const maxQuota = metadata.locked_records ? metadata.locked_records.max_quota : 0
				this.members = maxQuota === 0 ? 0 : maxQuota - metadata.subordinate_count
				const teamInfo = await getTeamInfo(result)
				this.teamInfo = teamInfo.data || {}

				const link = window.location.href
				const { data } = await getWxSignature(link)
				const imgUrl = 'https://static.chain.pro/chain/praad.gif'
				wx.config({
					debug: process.env.VUE_APP_MODE === 'development',
					appId: data.appId,
					timestamp: data.timestamp,
					nonceStr: data.nonceStr,
					signature: data.signature,
					jsApiList: ['hideAllNonBaseMenuItem', 'updateAppMessageShareData']
				})
				wx.ready(() => {
					console.log('wx ready')
					wx.hideAllNonBaseMenuItem()
					wx.updateAppMessageShareData({
						title: `"${this.nickName}"赠送你一个DID名额`,
						desc: '拥有DID，轻松领奖励，奖励秒到账，越领越丰厚',
						link,
						imgUrl,
						success() {
							console.log('share success')
						}
					})
				})
				wx.error((e) => {
					console.log(e)
					alert(e)
				})
			} catch (e) {
				console.log(e)
				alert(e)
			}
		},
		methods: {
			create() {
				window.location.href = `${process.env.VUE_APP_DOMAIN}/#/?short_index=${this.shortIndex}`
			},
			async getOpenId() {
				const url = window.location.href
				const part1 = url.split('&state')[0]
				const code = part1.split('code=')[1]
				const { apply_id: applyId } = this.$route.query
				const { data: { result, wxidmd5 } } = await applySn(applyId, code)
				this.code = result
				if (wxidmd5) this.rewardUrl = `/wallet?queryid=${wxidmd5}`
			}
		}
	}
</script>

<style lang="scss">
	@import '../../assets/css/variables.scss';

	.promotion {
		font-size: $baseFontSize;
		text-align: center;
		color: #fff;
		background: url(../../assets/images/activity/bg.jpg) no-repeat;
		background-size: cover;

		.bg {
			width: 100%;
			height: 100%;
			background: #ff0000;
			opacity: 0.7;
			position: absolute;
			left: 0;
			top: 0;
			z-index: 2;
		}

		.content {
			padding: $largeGutter*2 $mediumGutter;
			position: relative;
			z-index: 3;

			h2,
			h3 {
				font-weight: normal;
			}

			h2 {
				font-size: $largeFontSize*1.35;
			}

			h3 {
				margin: $smallGutter;
			}

			.profile {
				.user {
					display: flex;
					justify-content: center;
					align-items: center;
					p {
						text-align: left;
						padding-left: $mediumGutter;
					}
				}
				h2 {
					margin-top: $largeGutter*2;
				}
			}

			.code {
				border: 2px solid #d4220e;
				width: 80%;
				margin: $largeGutter auto;
				padding: $largeGutter 0;
				border-radius: $smallGutter;

				h3 {
					margin-top: 0;
				}
			}

			.desc {
				width: 70%;
				margin: 0 auto;

				.van-button {
					margin-top: $largeGutter;
				}
			}

			.van-image--round {
				border: 3px solid #fff;
			}
		}

		.van-notice-bar {
			z-index: 999;
		}
	}

	@keyframes move {
		0% {
			font-size: $mediumFontSize;
		}

		50% {
			font-size: $largeFontSize;
		}

		100% {
			font-size: $mediumFontSize;
		}
	}
</style>
