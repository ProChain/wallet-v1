<template>
	<div class="transaction">
		<van-tabs v-model="active" :border="false" sticky>
		  <van-tab title="交易记录">
			  <van-list v-model="loading" :finished="finished" :offset="100" finished-text="没有更多了" @load="onLoad">
			  	<van-cell v-for="(item, index) in list"
				class="copy"
				:key="index"
				:class="{ sent: item.from_did === metadata.did, receive: item.from_did !== metadata.did }"
				:data-clipboard-text="item.from_did === metadata.did ? item.to_did : item.from_did"
				:center="true"
				:value="item.balance | money"
				:label="item.datetime | date">
					<span v-if="item.from_did === metadata.did" slot="title">{{ item.to_did | clip }}</span>
					<span v-else slot="title">{{ item.from_did | clip }}</span>
					<!-- <van-icon v-if="item.from_did === metadata.did" name="after-sale" slot="icon" />
					<van-icon v-else name="refund-o" slot="icon" /> -->
					<i class="icon" :class="{income: item.from_did === metadata.did}" slot="icon"></i>
				</van-cell>
			  </van-list>
		  </van-tab>
		  <van-tab disabled></van-tab>
		  <van-tab disabled></van-tab>
		  <van-tab disabled></van-tab>
		</van-tabs>
	</div>
</template>
<script>
import { getTransaction } from '@/util/api'
export default {
	name: 'transaction',
	props: ['metadata'],
	data() {
		return {
			list: [],
			loading: false,
			finished: false,
			active: 0,
			page: 1
		}
	},
	methods: {
	    async onLoad() {
			try {
				const result = await this.queryData(this.metadata.did, this.page)
				this.list.push(...result.filter(v => v.to_did))
				this.loading = false
				this.page++
				if (result.length < 10 || result.length === 0) this.finished = true
			} catch (e) {
				console.log(e)
			}
	    },
		async queryData(did, page) {
			const { data } = await getTransaction(did, page)
			const result = data.map(v => v.attributes)

			return result
		}
	}
}
</script>
<style lang='scss'>
	@import '../../assets/css/variables.scss';
	.transaction {
		margin-top: $mediumGutter;
		.van-cell {
			.van-icon {
				font-size: 30px;
				margin-right: $smallGutter;
			}
			&.sent {
				.van-icon-after-sale, .van-cell__value {
					color: $green;
				}
			}
			&.receive {
				.van-icon-refund-o, .van-cell__value {
					color: $blue;
				}
			}
			.icon {
				width: 30px;
				height: 30px;
				background-repeat: no-repeat;
				background-position: center;
				background-size: 90%;
				margin-right: $smallGutter;
				background-image: url(../../assets/images/income.svg);
				&.income {
					width: 28px;
					height: 28px;
					background-image: url(../../assets/images/spense.svg);
				}
			}
		}
		.van-cell:nth-last-child(3)::after {
			display: none;
		}
	}
</style>
