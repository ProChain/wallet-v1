<template>
	<div class="member-component">
		<div class="member">
			<h3>我的团队成员列表</h3>
			<div class="members" v-if="page.total > 0">
				<ul class="list">
					<li v-for="(item, index) in members" :key="index">
						{{ item.id }}
					</li>
				</ul>
				<van-pagination v-if="page.total > 12" v-model="currentPage" :total-items="page.total" :items-per-page="12"
				 mode="simple" @change="handlePageChange" />
			</div>
			<p v-else class="no-content">
				您暂时没有团队成员
			</p>
		</div>
	</div>
</template>
<script>
	import { mapState } from 'vuex'
	import { getMembers } from '@/util/api'
	import { didToHex, sleep } from '@/util/common'
	export default {
		name: 'teamMember',
		data() {
			return {
				members: [],
				page: {},
				currentPage: 1
			};
		},
		computed: {
			...mapState([
				'walletInfo'
			])
		},
		async mounted() {
			try {
				await sleep()
				this.didHash = didToHex(this.walletInfo.did)
				this.queryRecord()
			} catch (e) {
				console.log(e)
			}
		},
		methods: {
			handlePageChange(page) {
				this.queryRecord(page)
			},
			async queryRecord(pageNum = 1) {
				const { meta, data } = await getMembers(this.didHash, pageNum)
				this.members = data
				this.page = meta
			}
		}
	}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';
	.member-component {
		background: #fff;
		.member {
			font-size: $baseFontSize;
			line-height: $baseLineHeight;
			h3 {
				font-weight:normal;
				color: $grey;
				padding: $smallGutter $mediumGutter;
				margin-top: $mediumGutter;
			}
			.list {
				margin-bottom: $largeGutter;
				li {
					line-height: 45px;
					padding: 0 $mediumGutter;
					&:nth-of-type(2n+1) {
						background: #eee;
					}
				}
			}
		}
		.van-pagination {
			padding: 0 $largeGutter;
		}
	}
</style>
