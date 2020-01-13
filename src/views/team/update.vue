<template>
	<div class="team-update-component">
		<div class="team-update">
			<ValidationObserver v-slot="{ invalid }" ref="form">
				<van-cell-group title="团队名称" :border="false">
					<ValidationProvider v-slot="{ errors }" rules="required" name="name">
						<van-field v-if="pageType !== 'create'" v-model="teamInfo.name" disabled />
						<van-field v-else v-model="didForm.name" :error-message="errors[0]" placeholder="请输入团队名称" />
					</ValidationProvider>
				</van-cell-group>
				<van-cell-group title="团队标识" :border="false">
					<ValidationProvider v-slot="{ errors }" rules="required" name="symbol">
						<van-field v-model="didForm.symbol" :error-message="errors[0]" placeholder="请设置您的团队标识" @input="debouncedSearch" />
					</ValidationProvider>
				</van-cell-group>
				<van-image v-if="symbolPic" :src="symbolPic" width="1rem" height="1rem" round>
					<template v-slot:loading>
						<van-loading type="spinner" size="20" />
					</template>
				</van-image>
				<van-cell-group title="描述信息" :border="false">
					<ValidationProvider v-slot="{ errors }" name="description">
						<van-field v-model="didForm.description" :error-message="errors[0]" placeholder="请输入描述" />
					</ValidationProvider>
				</van-cell-group>
				<van-cell-group title="团队网址" :border="false">
					<ValidationProvider v-slot="{ errors }" name="website">
						<van-field v-model="didForm.website" :error-message="errors[0]" placeholder="请输入团队网址" />
					</ValidationProvider>
				</van-cell-group>
				<van-cell-group title="团队标签" :border="false">
					<van-cell is-link :to="{path: '/team/tags', query: {...$route.query}}" title-class="tag-title">
						<div v-if="didForm.tags.length > 0" slot="title">
							<span v-for="item in didForm.tags">
								{{ item }}
							</span>
						</div>
						<span v-else slot="title">请选择标签</span>
					</van-cell>
				</van-cell-group>
				<van-button type="primary" square class="btn-submit" size="large" :disabled="invalid" @click="handleSubmit">{{ btnText }}</van-button>
			</ValidationObserver>
		</div>
	</div>
</template>
<script>
	import { mapState, mapActions } from 'vuex'
	import { ValidationObserver, ValidationProvider } from 'vee-validate'
	import { SET_TEAM_INFO, DISPATCH_SIGN } from '@/vuex/constants'
	import { getPicBySymbol, buildTeam } from '@/util/api'
	import { debounce } from '@/util/common'
	const intialFormData = {
		name: '',
		symbol: '',
		url: '',
		website: '',
		description: '',
		tags: []
	}
	export default {
		name: 'teamUpdate',
		data() {
			return {
				pageType: '',
				didForm: Object.assign({}, intialFormData),
				btnText: '更新团队',
				symbolPic: ''
			}
		},
		computed: {
			...mapState([
				'walletInfo',
				'teamInfo'
			])
		},
		components: {
			ValidationProvider,
			ValidationObserver
		},
		created() {
			this.debouncedSearch = debounce(this.handleInputChange)
			const { type } = this.$route.query
			if (type === 'create') {
				this.btnText = '创建团队'
			} else {
				this.didForm = {
					...intialFormData,
					...this.teamInfo
				}
			}
			this.pageType = type
		},
		activated() {
			const tags = sessionStorage.getItem('tags')
			if (tags) {
				this.didForm.tags = JSON.parse(tags)
			}
		},
		methods: {
			async handleSubmit() {
				// register name to chain
				if (this.pageType === 'create') {
					const data = {
						address: this.walletInfo.address,
						method: 'setGroupName',
						params: [this.didForm.name]
					}
					this[DISPATCH_SIGN](data)
				} else {
					this.didForm.name = this.teamInfo.name
				}

				const rs = await buildTeam({
					...this.didForm,
					did: this.walletInfo.did,
					url: ''
				})
				if (rs.hasErrors) {
					return this.$toast.error(rs.message)
				}

				// update team info
				const teamInfo = {
					...this.teamInfo,
					...this.didForm
				}
				if (this.symbolPic) teamInfo.url = this.symbolPic
				this[SET_TEAM_INFO](teamInfo)

				this.$router.go(-1)
			},
			async handleInputChange(symbol) {
				const { data } = await getPicBySymbol(symbol)
				this.symbolPic = data && data.url
			},
			...mapActions([
				SET_TEAM_INFO,
				DISPATCH_SIGN
			])
		}
	}
</script>
<style lang="scss">
	@import '../../assets/css/variables.scss';

	.team-update-component {
		.tag-title {
			color: #969799;
		}

		.van-image {
			background-color: #c1bdbd;
			margin: $mediumGutter 0 0 $mediumGutter;
		}
	}
</style>
