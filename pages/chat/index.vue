<template>
	<view class="chat-page">
		<!-- 顶部关联物品卡片 -->
		<view v-if="relatedItem" class="item-ref" @click="goItemDetail">
			<view class="item-ref__image" :style="{ background: relatedItem.imageBg || '#F2F3F8' }">
				<image v-if="relatedItem.images && relatedItem.images.length > 0" :src="relatedItem.images[0]" class="item-ref__img" mode="aspectFill" />
				<AppIcon v-else name="image" :size="28" color="#D0D3E0" />
			</view>
			<view class="item-ref__info">
				<text class="item-ref__label">正在咨询</text>
				<text class="item-ref__title text-ellipsis">{{ relatedItem.title }}</text>
			</view>
			<view class="item-ref__price">
				<text v-if="relatedItem.price === 0" class="price-free">免费</text>
				<text v-else class="price-num">¥{{ relatedItem.price }}</text>
			</view>
			<view class="item-ref__arrow">
				<AppIcon name="arrow-right" :size="28" color="#8B8FA3" />
			</view>
		</view>

		<!-- 消息列表 -->
		<scroll-view
			class="msg-scroll"
			scroll-y
			:scroll-into-view="scrollToId"
			:scroll-with-animation="true"
			@scrolltoupper="loadMore"
			ref="msgScroll"
		>
			<!-- 加载更多指示 -->
			<view v-if="hasMore" class="load-more" @click="loadMore">
				<text class="load-more-text">查看更早的消息</text>
			</view>

			<!-- 空状态 -->
			<view v-if="messages.length === 0" class="chat-empty">
				<AppIcon name="chat-bubble" :size="72" color="#8B8FA3" />
				<text class="chat-empty-text">打个招呼，开始聊聊吧</text>
			</view>

			<view v-for="msg in messages" :key="msg.id" :id="'msg-' + msg.id">
				<!-- 时间标签 -->
				<view v-if="msg.showTime" class="time-label-wrap">
					<text class="time-label">{{ msg.showTime }}</text>
				</view>

				<!-- 消息行：对方 -->
				<view v-if="msg.from !== 'me'" class="msg-bubble-row msg-other anim-in">
					<view class="msg-avatar" :style="{ background: otherUser.avatarBg || '#8FA1F8' }">
						<text class="avatar-text">{{ otherInitial }}</text>
					</view>
					<view class="msg-bubble bubble-other">
						<text class="bubble-text">{{ msg.text }}</text>
					</view>
				</view>

				<!-- 消息行：自己 -->
				<view v-else class="msg-bubble-row msg-mine anim-in">
					<view class="msg-bubble bubble-mine">
						<text class="bubble-text">{{ msg.text }}</text>
					</view>
					<view class="msg-avatar msg-avatar--self">
						<text class="avatar-text--self">{{ myInitial }}</text>
					</view>
				</view>
			</view>

			<!-- 对方正在输入 -->
			<view v-if="isTyping" id="msg-typing" class="msg-bubble-row msg-other anim-in">
				<view class="msg-avatar" :style="{ background: otherUser.avatarBg || '#8FA1F8' }">
					<text class="avatar-text">{{ otherInitial }}</text>
				</view>
				<view class="msg-bubble bubble-other typing-bubble">
					<view class="typing-dots">
						<view class="typing-dot"></view>
						<view class="typing-dot"></view>
						<view class="typing-dot"></view>
					</view>
				</view>
			</view>

			<!-- 底部空白，防止最后一条被输入栏遮挡 -->
			<view class="scroll-bottom-spacer"></view>
		</scroll-view>

		<!-- 表情面板 -->
		<view v-if="showEmoji" class="emoji-panel">
			<scroll-view scroll-y class="emoji-scroll">
				<view class="emoji-grid">
					<view
						v-for="(emoji, idx) in emojiList"
						:key="idx"
						class="emoji-item"
						@click="insertEmoji(emoji)"
					>
						<text class="emoji-char">{{ emoji }}</text>
					</view>
				</view>
			</scroll-view>
		</view>

		<!-- 底部输入栏 -->
		<view class="input-bar">
			<view class="input-bar__inner">
				<!-- 表情按钮 -->
				<view class="input-bar__emoji-btn" @click="toggleEmoji">
					<AppIcon name="emoji" :size="40" :color="showEmoji ? '#4F6EF7' : '#8B8FA3'" />
				</view>
				<input
					class="input-bar__field"
					v-model="inputText"
					placeholder="输入消息..."
					confirm-type="send"
					@confirm="sendMessage"
					:adjust-position="true"
					@focus="showEmoji = false"
				/>
				<view
					:class="['input-bar__send', { disabled: !inputText.trim() }]"
					@click="sendMessage"
				>
					<AppIcon name="send" :size="36" :color="inputText.trim() ? '#FFFFFF' : '#6B6F80'" />
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import AppIcon from '@/components/AppIcon.vue';
import { get, post } from '@/utils/request.js';
import store from '@/utils/store.js';

export default {
	components: { AppIcon },
	data() {
		return {
			conversationId: '',
			exchangeId: '',
			otherUser: { nickname: '', avatarBg: '#8FA1F8' },
			relatedItem: null,
			messages: [],
			inputText: '',
			scrollToId: '',
			hasMore: true,
			page: 1,
			showEmoji: false,
			isTyping: false,
			emojiList: [
				'😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊',
				'😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗',
				'😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭',
				'🤔', '🤐', '😐', '😑', '😶', '😏', '😒', '🙄',
				'😬', '😮‍💨', '😔', '😪', '🤤', '😴', '😷', '🤒',
				'👍', '👎', '👏', '🙌', '🤝', '💪', '✌️', '🤞',
				'❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
				'🎉', '🎊', '🎈', '💐', '🌸', '🌺', '🌻', '🌷',
				'🍀', '🎓', '📚', '✏️', '💻', '📱', '💰', '💡',
				'☕', '🍕', '🎂', '🍰', '🎵', '🎶', '⭐', '🔥',
				'✅', '❌', '❓', '❗', '💯', '🔒', '📌', '📍',
			],
		};
	},
	computed: {
		myInitial() {
			const user = store.userInfo;
			return user && user.nickname ? user.nickname.charAt(0) : '我';
		},
		otherInitial() {
			return this.otherUser && this.otherUser.nickname ? this.otherUser.nickname.charAt(0) : '?';
		},
	},
	onLoad(options) {
		this.conversationId = options.id || '';
		this.exchangeId = options.exchangeId || '';
		if (this.conversationId) {
			this.loadConversation();
		}
	},
	methods: {
		async loadConversation() {
			try {
				const conv = await get('/api/conversations/' + this.conversationId);
				this.otherUser = conv.user || this.otherUser;
				this.relatedItem = conv.relatedItem || null;
				// 为消息添加时间标签
				this.messages = this.addTimeLabels(conv.messages || []);
				this.$nextTick(() => this.scrollToBottom());
			} catch (e) {
				// mock 兜底
				this.otherUser = { nickname: '对方用户', avatarBg: '#FF6B3D' };
				const msgs = [
					{ id: 'm1', from: 'other', text: '你好，请问东西还在吗？', time: new Date(Date.now() - 3600000).toISOString() },
					{ id: 'm2', from: 'me', text: '在的！', time: new Date(Date.now() - 1800000).toISOString() },
				];
				this.messages = this.addTimeLabels(msgs);
			}
		},

		addTimeLabels(msgs) {
			// 为消息添加时间标签（间隔超过5分钟显示时间）
			const now = new Date();
			return msgs.map((msg, i) => {
				const time = msg.time ? new Date(msg.time) : new Date();
				let showTime = '';
				if (i === 0) {
					showTime = this.formatTime(time);
				} else {
					const prev = msgs[i - 1];
					const prevTime = prev.time ? new Date(prev.time) : new Date(0);
					const diff = time - prevTime;
					if (diff > 5 * 60 * 1000) {
						showTime = this.formatTime(time);
					}
				}
				return { ...msg, showTime };
			});
		},

		formatTime(date) {
			const now = new Date();
			const diff = now - date;
			if (diff < 60000) return '刚刚';
			if (diff < 3600000) return Math.floor(diff / 60000) + '分钟前';
			if (diff < 86400000) {
				const h = date.getHours().toString().padStart(2, '0');
				const m = date.getMinutes().toString().padStart(2, '0');
				return h + ':' + m;
			}
			const M = (date.getMonth() + 1).toString();
			const D = date.getDate().toString();
			const h = date.getHours().toString().padStart(2, '0');
			const m = date.getMinutes().toString().padStart(2, '0');
			return M + '月' + D + '日 ' + h + ':' + m;
		},

		async sendMessage() {
			const text = this.inputText.trim();
			if (!text) return;

			const tempMsg = {
				id: 'm_' + Date.now(),
				from: 'me',
				text,
				time: new Date().toISOString(),
				showTime: '',
			};
			this.messages.push(tempMsg);
			this.inputText = '';
			this.showEmoji = false;

			this.$nextTick(() => {
				this.scrollToBottom();
			});

			try {
				const result = await post('/api/conversations/' + this.conversationId + '/send', { text });
				tempMsg.id = result.id || tempMsg.id;
			} catch (e) {
				// mock 模式
			}

			// 模拟对方正在输入，随后自动回复
			setTimeout(() => {
				this.isTyping = true;
				this.$nextTick(() => this.scrollToBottom());
				setTimeout(() => {
					this.simulateReply(text);
					this.isTyping = false;
				}, 1600 + Math.random() * 1200);
			}, 600);
		},

		simulateReply(myText) {
			const replies = [
				'好的，没问题~',
				'可以，你什么时候方便？',
				'还在的，要来看看吗？',
				'嗯嗯，那就这么定了',
				'不好意思刚看到消息',
				'可以的，我在学校',
				'哈哈好的👌',
				'没问题，到时候联系你😊',
			];
			const reply = replies[Math.floor(Math.random() * replies.length)];
			const autoMsg = {
				id: 'm_auto_' + Date.now(),
				from: 'other',
				text: reply,
				time: new Date().toISOString(),
				showTime: '',
			};
			this.messages.push(autoMsg);
			this.$nextTick(() => {
				this.scrollToBottom();
			});
		},

		loadMore() {
			if (!this.hasMore) return;
			this.hasMore = false;
			uni.showToast({ title: '没有更多消息了', icon: 'none', duration: 1500 });
		},

		scrollToBottom() {
			if (this.messages.length > 0) {
				const last = this.messages[this.messages.length - 1];
				this.scrollToId = this.isTyping ? 'msg-typing' : 'msg-' + last.id;
			}
		},

		toggleEmoji() {
			this.showEmoji = !this.showEmoji;
		},

		insertEmoji(emoji) {
			this.inputText += emoji;
		},

		goItemDetail() {
			if (this.relatedItem && this.relatedItem.id) {
				uni.navigateTo({ url: '/pages/goods-detail/index?id=' + this.relatedItem.id });
			}
		},
	},
};
</script>

<style scoped>
.chat-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
	background: #F2F3F8;
}

/* ========== 关联物品卡片 ========== */
.item-ref {
	display: flex;
	align-items: center;
	background: #FFFFFF;
	padding: 16rpx 28rpx;
	margin: 16rpx 24rpx;
	border-radius: 20rpx;
	box-shadow: 0 2rpx 12rpx rgba(31, 41, 88, 0.06);
}

.item-ref:active {
	background: #F8F9FC;
}

.item-ref__image {
	width: 72rpx;
	height: 72rpx;
	border-radius: 16rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	margin-right: 16rpx;
	flex-shrink: 0;
	overflow: hidden;
}

.item-ref__img {
	width: 100%;
	height: 100%;
}

.item-ref__info {
	flex: 1;
	min-width: 0;
	display: flex;
	flex-direction: column;
}

.item-ref__label {
	font-size: 22rpx;
	color: #6B6F80;
	margin-bottom: 2rpx;
}

.item-ref__title {
	font-size: 26rpx;
	color: #1A1D28;
	font-weight: 500;
}

.item-ref__price {
	flex-shrink: 0;
	margin-left: 16rpx;
}

.item-ref__arrow {
	margin-left: 12rpx;
	flex-shrink: 0;
	display: flex;
}

.price-num {
	font-size: 28rpx;
	font-weight: 700;
	color: #FF6B3D;
}

.price-free {
	font-size: 24rpx;
	font-weight: 600;
	color: #22C55E;
}

/* ========== 消息滚动区 ========== */
.msg-scroll {
	flex: 1;
	padding: 20rpx 24rpx;
	overflow-y: auto;
}

.load-more {
	display: flex;
	justify-content: center;
	padding: 20rpx 0 30rpx;
}

.load-more-text {
	font-size: 24rpx;
	color: #4F6EF7;
	padding: 8rpx 24rpx;
}

.scroll-bottom-spacer {
	height: 16rpx;
}

/* ========== 时间标签 ========== */
.time-label-wrap {
	display: flex;
	justify-content: center;
	margin: 16rpx 0 24rpx;
}

.time-label {
	font-size: 22rpx;
	color: #6B6F80;
	padding: 6rpx 20rpx;
	border-radius: 20rpx;
	background: #EEF0F5;
}

/* ========== 空状态 ========== */
.chat-empty {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 16rpx;
	padding: 140rpx 0 120rpx;
}

.chat-empty-text {
	font-size: 24rpx;
	color: #8B8FA3;
}

/* ========== 消息气泡行 ========== */
.msg-bubble-row {
	display: flex;
	align-items: flex-start;
	margin-bottom: 24rpx;
	width: 100%;
}

/* 对方消息：头像在左，气泡在右 */
.msg-other {
	justify-content: flex-start;
}

/* 自己消息：气泡在左，头像在右 */
.msg-mine {
	justify-content: flex-end;
}

/* ========== 头像 ========== */
.msg-avatar {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
}

.msg-avatar--self {
	background: linear-gradient(135deg, #4F6EF7, #3D56D4) !important;
	margin-left: 12rpx;
}

.avatar-text {
	font-size: 28rpx;
	font-weight: 600;
	color: #FFFFFF;
}

.avatar-text--self {
	font-size: 28rpx;
	font-weight: 600;
	color: #FFFFFF;
}

/* ========== 气泡 ========== */
.msg-bubble {
	max-width: 68%;
	padding: 18rpx 26rpx;
	border-radius: 20rpx;
	word-break: break-all;
	position: relative;
}

/* 自己：深蓝气泡，靠右，小尾巴在右上角 */
.bubble-mine {
	background: #3D56D4;
	border-top-right-radius: 6rpx;
	border-top-left-radius: 20rpx;
	margin-right: 0;
}

.bubble-mine .bubble-text {
	font-size: 28rpx;
	color: #FFFFFF;
	line-height: 1.55;
}

/* 对方：白色气泡，靠左，小尾巴在左上角 */
.bubble-other {
	background: #FFFFFF;
	border-top-left-radius: 6rpx;
	margin-left: 12rpx;
	box-shadow: 0 1rpx 6rpx rgba(31, 41, 88, 0.06);
}

.bubble-other .bubble-text {
	font-size: 28rpx;
	color: #1A1D28;
	line-height: 1.55;
}

/* ========== 正在输入 ========== */
.typing-bubble {
	padding: 24rpx 28rpx;
}

.typing-dots {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.typing-dot {
	width: 12rpx;
	height: 12rpx;
	border-radius: 50%;
	background: #B0B4C0;
	animation: typing-bounce 1.2s ease-in-out infinite;
}

.typing-dot:nth-child(2) { animation-delay: 0.15s; }
.typing-dot:nth-child(3) { animation-delay: 0.3s; }

@keyframes typing-bounce {
	0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
	30% { transform: translateY(-8rpx); opacity: 1; }
}

/* ========== 表情面板 ========== */
.emoji-panel {
	height: 440rpx;
	background: #FFFFFF;
	border-top: 1px solid #E8EAF0;
}

.emoji-scroll {
	height: 100%;
	padding: 16rpx;
}

.emoji-grid {
	display: flex;
	flex-wrap: wrap;
}

.emoji-item {
	width: 14.28%;
	aspect-ratio: 1;
	display: flex;
	align-items: center;
	justify-content: center;
	border-radius: 12rpx;
	transition: background 0.15s;
}

.emoji-item:active {
	background: #F2F3F8;
}

.emoji-char {
	font-size: 48rpx;
	line-height: 1;
}

/* ========== 输入栏 ========== */
.input-bar {
	padding: 12rpx 16rpx;
	padding-bottom: calc(12rpx + env(safe-area-inset-bottom));
	background: #FFFFFF;
	border-top: 1px solid #E8EAF0;
}

.input-bar__inner {
	display: flex;
	align-items: center;
	gap: 10rpx;
}

.input-bar__emoji-btn {
	width: 68rpx;
	height: 68rpx;
	border-radius: 50%;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	transition: all 0.15s;
}

.input-bar__emoji-btn:active {
	background: #F2F3F8;
	transform: scale(0.95);
}

.input-bar__field {
	flex: 1;
	height: 72rpx;
	padding: 0 24rpx;
	border-radius: 36rpx;
	background: #F2F3F8;
	font-size: 28rpx;
	color: #1A1D28;
}

.input-bar__field::placeholder {
	color: #6B6F80;
}

.input-bar__send {
	width: 72rpx;
	height: 72rpx;
	border-radius: 50%;
	background: #3D56D4;
	display: flex;
	align-items: center;
	justify-content: center;
	flex-shrink: 0;
	transition: all 0.15s;
}

.input-bar__send:active {
	transform: scale(0.92);
}

.input-bar__send.disabled {
	background: #E8EAF0;
}

/* 减少动态效果偏好 */
@media (prefers-reduced-motion: reduce) {
	.typing-dot {
		animation: none;
	}
}
</style>
