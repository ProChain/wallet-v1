<template>
  <div class="tags-component">
	  <van-panel v-for="(item, index) in tagList" :key="index" :title="item.group">
		  <van-tag v-for="(tag, idx) in item.tags" round type="primary" size="medium"
		  :key="idx"
		  @click="handleClick(tag)">{{ tag }}</van-tag>
	  </van-panel>
	  <van-panel v-if="selected.length > 0" title="已选标签" status="确认选择">
		<van-tag v-for="(tag, idx) in selected" round type="success" size="medium"
		  :key="idx"
		  :closeable="true"
		  @close="handleClose(idx)">{{ tag }}</van-tag>
		  <van-cell title="已选标签" slot="header" :to="{path: '/team/update', query: {...$route.query, selected}}" :replace="true">
			  <van-icon
			  color="#07c160"
			  slot="right-icon"
			  size="0.5rem"
			  name="success"/>
		 </van-cell>
	  </van-panel>
  </div>
</template>
<script>
import { getTeamTags } from '@/util/api'
import { sleep } from '@/util/common'
export default {
	name: 'tags',
	data() {
		return {
			tagList: '',
			selected: []
		};
	},
	async mounted() {
		try {
			await sleep()
			const { data } = await getTeamTags()
			this.tagList = data
		} catch (e) {
			console.log(e)
		}
	},
	deactivated() {
		this.selected = []
	},
	methods: {
		handleClose(idx) {
			this.selected.splice(idx, 1)
		},
		handleClick(tag) {
			if (this.selected.length > 4) {
				return this.$toast('最多只能选择5个标签')
			}
			if (!this.selected.includes(tag)) {
				this.selected.push(tag)
			}
		}
	}
}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';
	.tags-component {
		.van-panel {
			margin-bottom: $mediumGutter;
			.van-panel__content {
				display: flex;
				padding: $smallGutter $mediumGutter;
				flex-wrap: wrap;
				.van-tag {
					margin: 5px;
				}
			}
		}
	}
</style>
