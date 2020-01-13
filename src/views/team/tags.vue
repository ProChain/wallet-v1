<template>
	<div class="tags-component">
		<van-panel v-for="(item, index) in tagList" :key="index" :title="item.group">
			<van-tag v-for="(tag, idx) in item.tags" round type="primary" size="large" :key="idx" @click="handleClick(tag)">{{ tag }}</van-tag>
		</van-panel>
		<van-panel v-if="selected.length > 0" title="已选标签">
			<van-tag v-for="(tag, idx) in selected" round type="success" size="large" :key="idx" :closeable="true" @close="handleClose(idx)">{{ tag }}</van-tag>
			<van-button type="primary" slot="footer" size="large" @click="confirm">确认选择</van-button>
		</van-panel>
	</div>
</template>
<script>
	import { mapState } from 'vuex'
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
		computed: {
			...mapState([
				'teamInfo'
			])
		},
		async mounted() {
			try {
				await sleep()
				const { data } = await getTeamTags()
				this.tagList = data
				this.selected = [...this.teamInfo.tags]
			} catch (e) {
				console.log(e)
			}
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
			},
			confirm() {
				sessionStorage.setItem('tags', JSON.stringify(this.selected))
				this.$router.go(-1)
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

			.van-panel__footer {
				padding: 0;
				margin: $largeGutter 0;

				&::after,
				&::before {
					display: none;
				}
			}
		}
	}
</style>
