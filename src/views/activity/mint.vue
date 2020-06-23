<template>
	<div class="mint-component">
		<div class="mint">
			<div class="top">
				<h2>奖池总剩余 <span>{{ detail.balance | money }}</span></h2>
				<div class="sumary">
					<ul>
						<li>
							昨日活跃数
							<h3>{{ detail.yday_active_num }}</h3>
						</li>
						<li>
							当前个人系数
							<h3>{{ detail.self_ratio }}</h3>
						</li>
					</ul>
				</div>
			</div>
			<div class="center">
				<h2 class="reward-pool">
					今日奖池
					<span>{{ detail.tday_pool | money }}</span>
				</h2>
				<van-button class="newbie" type="warning" to="/show">新手训练营</van-button>
				<ul>
					<li>
						全网今日总算力
						<h3>{{ detail.total_devote_rate }}</h3>
					</li>
					<li>
						我的今日算力
						<h3>{{ detail.self_devote_rate }}</h3>
					</li>
				</ul>
			</div>
			<div class="bottom">
				<span>待领取奖励 {{ detail.withdraw | money }}</span><van-button type="warning" @click="withdraw">点击领取</van-button>
			</div>
			<!-- <div class="notice">
				昨日活跃数：即昨天所有参与挖矿的人数<br>
				当前个人系数：即每个人平均每天可以得到币的数量<br>
				今日奖池：昨日活跃数 × 当前个人系数<br>
				我的算力：每日发言 + 1，给上级 + 0.5（待定）<br>
				每日PRM收益：今日奖池 × （我的算力 / 全网总算力）
			</div> -->
		</div>
	</div>
</template>
<script>
	import { mapState } from 'vuex'
	import { getMineDetail, withdraw } from '@/util/api'
	import { sleep } from '@/util/common'
	export default {
		name: 'mint',
		data() {
			return {
				detail: {},
				whitelist: [
					'did:pra:LsbTGSzqn1FtmTQTUwRxh7gUCZBSVev7cL',
					'did:pra:LsoqGTKPrsppGZTKoUeb2vSnNkRumP66mE',
					'did:pra:LkHmbT5qCubLfMBtyfzJHW8UEUopKprfTR',
					'did:pra:LvVE2k7TDmkqKZZvbt2R7xTJdR3pK3JFMA'
				]
			}
		},
		computed: {
			...mapState([
				'walletInfo',
				'token'
			])
		},
		async mounted() {
			try {
				await sleep()
				this.$store.commit('hideLoading')
				const { data } = await getMineDetail(this.walletInfo.did)
				console.log(data)
				this.detail = data
			} catch (e) {
				alert(e)
			}
		},
		methods: {
			async withdraw() {
				if (!this.whitelist.includes(this.walletInfo.did)) {
					return this.$toast('当前不能提现')
				}
				if (this.detail.withdraw < 1 * 10**15) return this.$toast('1个PRM起提')
				const rs = await withdraw(this.token)
				if (!rs.hasErrors) {
					this.$toast('提现成功')
					this.detail.withdraw = 0
				}
			}
		}
	}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';

	.mint-component {
		font-size: $mediumFontSize;
		text-align: center;

		h2,
		h3 {
			font-weight: normal;
		}

		ul {
			overflow: hidden;
		}

		li {
			width: 50%;
			float: left;
			line-height: 30px;
			padding: $largeGutter 0;
			font-size: $smallFontSize;

			h3 {
				font-size: $largeFontSize*1.2;
			}
		}

		.top {
			background: #ff6034;
			color: #fff;
			h2 {
				padding: $largeGutter  0;
				border-bottom: 1px solid #f54f21;
				span {
					font-size: $largeFontSize;
				}
			}
			li {
				position: relative;

				&:nth-of-type(2n+1)::after {
					content: '';
					display: block;
					position: absolute;
					right: 0;
					top: 0;
					height: 100%;
					width: 1px;
					background-color: #f54f21;
				}
			}
		}
		.center {
			ul {
				background-color: #f1e5d7;
			}
			h2 {
				color: #f54f21;
				padding: $largeGutter*1.6 0 0;
				font-size: $largeFontSize;
				span {
					font-size: $largeFontSize*1.5;
					margin-left: $mediumGutter;
				}
			}
			h3 {
				color: #f54f21;
				font-size: $largeFontSize*1.5;
			}
		}
		.bottom {
			display: flex;
			text-align: left;
			padding: $largeGutter;
			color: $grey;
			align-items: center;
			justify-content: space-between;
		}
		.notice {
			font-size: $smallFontSize;
			text-align: left;
			color: $grey;
			padding: 30px $mediumGutter 0;
		}
		.newbie {
			margin: $largeGutter 0;
			animation: scaleDrew 2.5s ease-in-out infinite;
		}
	}
</style>
