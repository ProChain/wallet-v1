<template>
  <div class="member-component">
	<div class="member">
	  <h3>团队成员</h3>
	  <div class="members" v-if="page.dataTotal > 0">
		<ul class="list">
		  <li v-for="(item, index) in members" :key="index">
			{{ item }}
		  </li>
		</ul>
		<van-pagination
		  v-if="page.dataTotal > 20"
		  v-model="currentPage"
		  :total-items="page.dataTotal"
		  :items-per-page="20"
		  mode="simple"
		  @change="handlePageChange"
		/>
	  </div>
	  <p v-else class="no-content">
		您没有下级
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
			this.queryRecord(page - 1)
		},
		async queryRecord(pageNum = 0) {
			// this.$Spin.show()
			const { data: { list, page }} = await getMembers(this.didHash, pageNum)
			this.members = list
			this.page = page
			// this.$Spin.hide()
		}
	}
}
</script>
<style lang="scss">
  @import '../../assets/css/variables.scss';
  .member {
	padding: $mediumGutter;
	font-size: $baseFontSize;
	line-height: $baseLineHeight;
	.list {
	  margin-bottom: $largeGutter;
	}
  }
</style>
