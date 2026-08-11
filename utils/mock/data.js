/**
 * Mock 数据 — 拾闲小栈（整合版）
 *
 * 合并 项目开发 的 API 结构和 8月项目 的丰富数据。
 * 所有图片使用占位色块，头像使用渐变色模拟。
 */

/* ========================================
   用户数据
   ======================================== */
const users = [
	{ id: 'u1', nickname: '小林同学', avatar: '', avatarBg: '#4F6EF7', online: true,
		bio: '计算机学院大三，喜欢折腾数码产品', school: '山东师范大学', campus: '长清湖校区',
		studentId: '20210001', stats: { posts: 12, exchanges: 3, rentals: 1 } },
	{ id: 'u2', nickname: '图书馆在逃书虫', avatar: '', avatarBg: '#FF6B3D', online: false,
		bio: '文学院研一，买书如山倒，出书如抽丝', school: '山东师范大学', campus: '长清湖校区',
		studentId: '20230001', stats: { posts: 8, exchanges: 5, rentals: 0 } },
	{ id: 'u3', nickname: '北区快递侠', avatar: '', avatarBg: '#22C55E', online: true,
		bio: '住在北区，日常代取快递，顺便出点闲置', school: '山东师范大学', campus: '千佛山校区',
		studentId: '20220005', stats: { posts: 15, exchanges: 10, rentals: 2 } },
	{ id: 'u4', nickname: '安静如鸡', avatar: '', avatarBg: '#F59E0B', online: false,
		bio: '经管院大四，毕业季清宿舍出各种东西', school: '山东师范大学', campus: '千佛山校区',
		studentId: '20200003', stats: { posts: 20, exchanges: 2, rentals: 3 } },
	{ id: 'u5', nickname: '运动不息', avatar: '', avatarBg: '#EF4444', online: true,
		bio: '体院篮球专业，装备党，不定期出运动装备', school: '山东师范大学', campus: '长清湖校区',
		studentId: '20210008', stats: { posts: 6, exchanges: 1, rentals: 1 } },
];

/* ========================================
   分类数据（统一用 id 作为 key）
   ======================================== */
const categories = [
	{ id: 'c1', name: '教材教辅', icon: 'book', color: '#4F6EF7', key: 'book' },
	{ id: 'c2', name: '数码电子', icon: 'digital', color: '#6366F1', key: 'digital' },
	{ id: 'c3', name: '生活用品', icon: 'daily', color: '#FF6B3D', key: 'daily' },
	{ id: 'c4', name: '运动户外', icon: 'sports', color: '#22C55E', key: 'sports' },
	{ id: 'c5', name: '服饰箱包', icon: 'fashion', color: '#F59E0B', key: 'fashion' },
	{ id: 'c6', name: '免费赠送', icon: 'gift', color: '#EF4444', key: 'free' },
];

/* ========================================
   学校 & 校区
   ======================================== */
const schools = [
	{ id: 's1', name: '山东师范大学', campuses: ['长清湖校区', '千佛山校区'] },
	{ id: 's2', name: '山东大学', campuses: ['中心校区', '兴隆山校区', '软件园校区', '千佛山校区', '洪家楼校区'] },
	{ id: 's3', name: '山东理工大学', campuses: ['西校区', '东校区'] },
	{ id: 's4', name: '山东财经大学', campuses: ['燕山校区', '舜耕校区'] },
];

const campuses = [
	{ id: 1, name: '长清湖校区' }, { id: 2, name: '千佛山校区' },
	{ id: 3, name: '中心校区' }, { id: 4, name: '兴隆山校区' },
	{ id: 5, name: '软件园校区' }, { id: 6, name: '洪家楼校区' },
	{ id: 7, name: '西校区' }, { id: 8, name: '东校区' },
	{ id: 9, name: '燕山校区' }, { id: 10, name: '舜耕校区' },
];

/* ========================================
   物品数据（首页 Feed 流）
   ======================================== */
const items = [
	{ id: 'i1', title: '全新《算法导论》第三版 考研必备', description: '考研结束便宜出，9成新，几乎没写过字，附赠电子笔记资料~',
		type: 'sell', price: 35, categoryId: 'c1', category: 'book', campus: '长清湖校区', location: '长清湖校区',
		images: ['/static/goods/book.jpg'], imageBg: '#EEF4FF', viewCount: 328, favoriteCount: 25, isHot: true, isNew: true,
		seller: users[0], publishTime: new Date(Date.now() - 300000).toISOString(), publishTimeText: '5分钟前' },
	{ id: 'i2', title: '华为蓝牙耳机 FreeBuds 4i', description: '去年买的，电池续航正常，轻微使用痕迹，送一个保护套',
		type: 'sell', price: 99, categoryId: 'c2', category: 'digital', campus: '长清湖校区', location: '长清湖校区',
		images: ['/static/goods/earbuds.jpg'], imageBg: '#F5F0FF', viewCount: 567, favoriteCount: 42, isHot: true, isNew: false,
		seller: users[1], publishTime: new Date(Date.now() - 1800000).toISOString(), publishTimeText: '30分钟前' },
	{ id: 'i3', title: '台灯 LED 护眼灯 可调节亮度', description: '宿舍用不到了，三档调光，USB充电，造型好看',
		type: 'sell', price: 18, categoryId: 'c3', category: 'daily', campus: '长清湖校区', location: '长清湖校区',
		images: ['/static/goods/lamp.jpg'], imageBg: '#FFF5EE', viewCount: 189, favoriteCount: 15, isHot: false, isNew: true,
		seller: users[2], publishTime: new Date(Date.now() - 7200000).toISOString(), publishTimeText: '2小时前' },
	{ id: 'i4', title: '吉他 Yamaha F310 入门民谣吉他', description: '大二买的，没弹几次就闲置了，保养得还不错，音色很好',
		type: 'sell', price: 450, categoryId: 'c4', category: 'sports', campus: '千佛山校区', location: '千佛山校区',
		images: ['/static/goods/guitar.jpg'], imageBg: '#F0FFF0', viewCount: 892, favoriteCount: 67, isHot: true, isNew: false,
		seller: users[4], publishTime: new Date(Date.now() - 28800000).toISOString(), publishTimeText: '8小时前' },
	{ id: 'i5', title: '冬季羽绒服 男款中长款（L码）', description: 'ZARA黑色，就穿过一个冬天，几乎全新',
		type: 'sell', price: 120, categoryId: 'c5', category: 'fashion', campus: '千佛山校区', location: '千佛山校区',
		images: ['/static/goods/jacket.jpg'], imageBg: '#FFF8F0', viewCount: 234, favoriteCount: 18, isHot: false, isNew: false,
		seller: users[3], publishTime: new Date(Date.now() - 86400000).toISOString(), publishTimeText: '1天前' },
	{ id: 'i6', title: '高等数学第七版 上下册 全新', description: '考研数学必备教材，上册轻微笔记，下册全新',
		type: 'sell', price: 28, categoryId: 'c1', category: 'book', campus: '长清湖校区', location: '长清湖校区',
		images: ['/static/goods/textbook.jpg'], imageBg: '#EEF4FF', viewCount: 456, favoriteCount: 34, isHot: false, isNew: false,
		seller: users[0], publishTime: new Date(Date.now() - 172800000).toISOString(), publishTimeText: '2天前' },
	{ id: 'i7', title: '卡西欧计算器 fx-991CN X', description: '考试可用，功能完好，附说明书和原装保护盖',
		type: 'sell', price: 55, categoryId: 'c2', category: 'digital', campus: '长清湖校区', location: '长清湖校区',
		images: ['/static/goods/calculator.jpg'], imageBg: '#F5F0FF', viewCount: 178, favoriteCount: 22, isHot: false, isNew: false,
		seller: users[1], publishTime: new Date(Date.now() - 259200000).toISOString(), publishTimeText: '3天前' },
	{ id: 'i8', title: 'Kindle Paperwhite 4 电子书阅读器', description: '自用一年，屏幕完美，电池一周一充，送保护壳',
		type: 'sell', price: 380, categoryId: 'c2', category: 'digital', campus: '长清湖校区', location: '长清湖校区',
		images: ['/static/goods/kindle.jpg'], imageBg: '#FAFAFA', viewCount: 621, favoriteCount: 53, isHot: true, isNew: false,
		seller: users[3], publishTime: new Date(Date.now() - 345600000).toISOString(), publishTimeText: '4天前' },
	{ id: 'i9', title: '桌面收纳盒套装 3个装', description: '全新未拆封，透明磨砂材质，适合桌面/衣柜收纳',
		type: 'sell', price: 15, categoryId: 'c3', category: 'daily', campus: '千佛山校区', location: '千佛山校区',
		images: ['/static/goods/organizer.jpg'], imageBg: '#FFF5EE', viewCount: 98, favoriteCount: 7, isHot: false, isNew: true,
		seller: users[2], publishTime: new Date(Date.now() - 120000).toISOString(), publishTimeText: '刚刚' },
	{ id: 'i10', title: '索尼WH-1000XM4降噪耳机', description: '头戴式降噪耳机，考研自习室神器，续航30小时',
		type: 'sell', price: 680, categoryId: 'c2', category: 'digital', campus: '长清湖校区', location: '长清湖校区',
		images: ['/static/goods/headphones.jpg'], imageBg: '#F5F0FF', viewCount: 1024, favoriteCount: 89, isHot: true, isNew: false,
		seller: users[4], publishTime: new Date(Date.now() - 10800000).toISOString(), publishTimeText: '3小时前' },
];

/* ========================================
   租借物品（独立列表，用于 /api/lease-items）
   ======================================== */
const leaseItems = [
	{ id: 'l1', title: '单反相机 Canon 700D 套机', desc: '入门单反，配18-55镜头，适合摄影课或出游拍照使用',
		price: 30, deposit: 500, category: 'digital', campus: '长清湖校区',
		images: ['/static/goods/camera.jpg'], user: users[2], publishTime: Date.now() - 3600000 },
	{ id: 'l2', title: '折叠自行车 26寸', desc: '平时不怎么骑，可以按天出租，车况良好，刹车灵敏',
		price: 8, deposit: 200, category: 'sports', campus: '长清湖校区',
		images: ['/static/goods/bicycle.jpg'], user: users[3], publishTime: Date.now() - 18000000 },
	{ id: 'l3', title: '宿舍小冰箱 迷你冷藏箱', desc: '小龙门冰箱，适合夏天放饮料和水果，功率小宿舍能用',
		price: 5, deposit: 150, category: 'daily', campus: '长清湖校区',
		images: ['/static/goods/fridge.jpg'], user: users[0], publishTime: Date.now() - 172800000 },
	{ id: 'l4', title: 'Switch 游戏机 续航版+三款游戏', desc: '续航版红蓝手柄，附塞尔达+动森+马车8三款游戏卡带',
		price: 20, deposit: 600, category: 'digital', campus: '长清湖校区',
		images: ['/static/goods/switch.jpg'], user: users[4], publishTime: Date.now() - 21600000 },
	{ id: 'l5', title: '露营帐篷 双人双层防雨', desc: '户外社团用的帐篷，双层防雨，含地钉和收纳袋',
		price: 25, deposit: 300, category: 'sports', campus: '长清湖校区',
		images: ['/static/goods/tent.jpg'], user: users[1], publishTime: Date.now() - 43200000 },
	{ id: 'l6', title: '拍立得相机 富士Instax Mini11', desc: '粉色款，成色很新，适合毕业季拍照留念，附送5张相纸',
		price: 15, deposit: 200, category: 'digital', campus: '千佛山校区',
		images: ['/static/goods/polaroid.jpg'], user: users[3], publishTime: Date.now() - 86400000 },
];

/* ========================================
   互助帖子
   ======================================== */
const exchangePosts = [
	{ id: 'e1', title: '求购二手考研数学资料（数一）', description: '有没有上岸的学长学姐出考研数学一的资料呀~',
		type: 'wish', tab: '求购心愿', isBorrow: false, campus: '长清湖校区', views: 234,
		user: users[0], createdAt: new Date(Date.now() - 900000).toISOString(), createdAtText: '15分钟前',
		replyCount: 3, reward: null, images: [], imageBg: '#FFF5EE' },
	{ id: 'e2', title: 'Kindle Paperwhite 4 换一个计算器', description: '吃灰kindle换一个卡西欧计算器，考试用，要求功能正常',
		type: 'exchange', tab: '以物换物', campus: '长清湖校区', views: 456,
		user: users[1], createdAt: new Date(Date.now() - 2700000).toISOString(), createdAtText: '45分钟前',
		myItem: { name: 'Kindle Paperwhite 4' }, wantItem: { name: '卡西欧计算器' },
		replyCount: 5, images: [], imageBg: '#F5F0FF' },
	{ id: 'e3', title: '帮忙去南门取个快递', description: '今天下午有快递到南门菜鸟驿站，有没有顺路的同学帮忙取一下，10元感谢费',
		type: 'wish', tab: '求助帮忙', isBorrow: false, campus: '长清湖校区', views: 178,
		user: users[2], createdAt: new Date(Date.now() - 600000).toISOString(), createdAtText: '10分钟前',
		replyCount: 2, reward: 10, images: [], imageBg: '#F0FFF0' },
	{ id: 'e4', title: '拼单买纸巾，一箱太多用不完', description: '趁活动买了一箱24包抽纸，太多了，有没有同学一起拼，一箱50，对半分也行',
		type: 'wish', tab: '拼单', campus: '长清湖校区', views: 312,
		user: users[3], createdAt: new Date(Date.now() - 10800000).toISOString(), createdAtText: '3小时前',
		replyCount: 7, reward: null, images: [], imageBg: '#FFF8F0' },
	{ id: 'e5', title: '代跑一次体测800米', description: '女生，帮忙代跑，价格私聊',
		type: 'wish', tab: '求助帮忙', isBorrow: false, campus: '千佛山校区', views: 189,
		user: users[4], createdAt: new Date(Date.now() - 36000000).toISOString(), createdAtText: '10小时前',
		replyCount: 4, reward: 30, images: [], imageBg: '#FFF0F0' },
	{ id: 'e6', title: '求借一辆自行车用一周', description: '考试周需要用，长清湖校区范围内，会好好保管，可付押金',
		type: 'wish', tab: '求购心愿', isBorrow: true, campus: '长清湖校区', views: 145,
		user: users[3], createdAt: new Date(Date.now() - 7200000).toISOString(), createdAtText: '2小时前',
		replyCount: 2, reward: 15, images: [], imageBg: '#EEF4FF' },
];

/* ========================================
   会话 / 消息
   ======================================== */
const conversations = [
	{ id: 'conv1', user: users[0], lastMessage: '你好，这个耳机还在吗？', lastMessageTime: '2分钟前',
		unreadCount: 2, relatedItem: items[1],
		messages: [
			{ id: 'm1', from: 'other', text: '你好，这个耳机还在吗？', time: '10:28' },
			{ id: 'm2', from: 'me', text: '在的，你要看一下吗', time: '10:29' },
			{ id: 'm3', from: 'other', text: '好的，下午方便面交吗？', time: '10:30' },
		] },
	{ id: 'conv2', user: users[2], lastMessage: '好的，我明天给你送过去', lastMessageTime: '1小时前',
		unreadCount: 0,
		messages: [
			{ id: 'm4', from: 'other', text: '台灯还在吗？', time: '09:15' },
			{ id: 'm5', from: 'me', text: '在的', time: '09:16' },
			{ id: 'm6', from: 'other', text: '好的，我明天给你送过去', time: '09:17' },
		] },
	{ id: 'conv3', user: users[4], lastMessage: '吉他最低多少出？', lastMessageTime: '昨天',
		unreadCount: 1, relatedItem: items[3],
		messages: [
			{ id: 'm7', from: 'other', text: '吉他最低多少出？', time: '昨天 20:05' },
			{ id: 'm8', from: 'me', text: '450已经是底价了', time: '昨天 20:06' },
		] },
	{ id: 'conv4', user: { id: 'u99', nickname: '系统通知', avatarBg: '#4F6EF7', online: false },
		lastMessage: '你的商品「台灯 LED 护眼灯」审核通过啦', lastMessageTime: '2天前',
		unreadCount: 0,
		messages: [
			{ id: 'm9', from: 'other', text: '你的商品「台灯 LED 护眼灯」审核通过啦', time: '2天前' },
		] },
];

/* 系统通知 */
const notifications = [
	{ id: 'n1', title: '审核通过', content: '你的商品「台灯 LED 护眼灯」审核通过啦', time: '2天前', unread: false },
	{ id: 'n2', title: '新消息', content: '小林同学给你发了一条私信', time: '2分钟前', unread: true },
	{ id: 'n3', title: '交易提醒', content: '你与「北区快递侠」的交易已确认', time: '1天前', unread: false },
];

/* ========================================
   个性化推荐（猜你喜欢）
   ======================================== */
const recommendations = [
	{ id: 'r1', title: '高等数学第七版 上下册 全新', desc: '考研数学必备教材，九成新，上册轻微笔记',
		price: 28, type: 'sell', category: 'book', campus: '长清湖校区',
		images: ['/static/goods/textbook.jpg'], user: users[0], publishTime: Date.now() - 1800000,
		matchReason: '浏览过考研资料', tag: 'hot' },
	{ id: 'r2', title: '索尼WH-1000XM4降噪耳机', desc: '头戴式降噪耳机，考研自习室神器，续航30小时',
		price: 680, type: 'sell', category: 'digital', campus: '长清湖校区',
		images: ['/static/goods/headphones.jpg'], user: users[3], publishTime: Date.now() - 10800000,
		matchReason: '浏览过蓝牙耳机', tag: 'hot' },
	{ id: 'r3', title: '桌面LED台灯 三档调光 USB充电', desc: '考研党必备护眼台灯，三档调光，无频闪',
		price: 22, type: 'sell', category: 'daily', campus: '长清湖校区',
		images: ['/static/goods/lamp.jpg'], user: users[2], publishTime: Date.now() - 21600000,
		matchReason: '浏览过台灯', tag: 'good' },
	{ id: 'r4', title: '卡西欧计算器 fx-991CN X', desc: '考试可用，功能完好，附说明书和原装保护盖',
		price: 55, type: 'sell', category: 'digital', campus: '长清湖校区',
		images: ['/static/goods/calculator.jpg'], user: users[1], publishTime: Date.now() - 43200000,
		matchReason: '收藏过数码产品', tag: 'match' },
	{ id: 'r5', title: '宿舍用小冰箱 迷你冷藏', desc: '4L容量，适合夏天冷藏饮料和水果，宿舍功率友好',
		price: 85, type: 'sell', category: 'daily', campus: '千佛山校区',
		images: ['/static/goods/fridge.jpg'], user: users[3], publishTime: Date.now() - 86400000,
		matchReason: '你可能喜欢的校园好物', tag: 'new' },
	{ id: 'r6', title: '折叠床 午休神器 加厚海绵', desc: '办公室/宿舍午休用，可折叠不占地方，舒适透气',
		price: 120, type: 'sell', category: 'daily', campus: '长清湖校区',
		images: ['/static/goods/bed.jpg'], user: users[4], publishTime: Date.now() - 172800000,
		matchReason: '根据浏览偏好推荐', tag: 'good' },
];

/* ========================================
   智能匹配
   ======================================== */
const matches = [
	{ id: 'm601', type: 'item-to-wish', title: '你的闲置《算法导论》可能匹配到这些需求',
		matches: [
			{ id: 'm6011', title: '求购算法导论或数据结构教材', user: users[0], campus: '长清湖校区',
				desc: '正在准备考研复试，急需算法相关教材', price: null, publishTime: Date.now() - 7200000 },
			{ id: 'm6012', title: '收计算机专业考研书籍', user: users[1], campus: '长清湖校区',
				desc: '想收408全套，单本也行，价格好商量', price: null, publishTime: Date.now() - 28800000 },
		] },
	{ id: 'm602', type: 'wish-to-item', title: '你的求购心愿「计算器」可能匹配到这些物品',
		matches: [
			{ id: 'm6021', title: '卡西欧计算器 fx-991CN X', price: 55, user: users[1], campus: '长清湖校区',
				desc: '考试可用，功能完好，附说明书和原装保护盖', publishTime: Date.now() - 43200000 },
			{ id: 'm6022', title: '卡西欧fx-82ES PLUS 科学计算器', price: 25, user: users[3], campus: '千佛山校区',
				desc: '基础款科学计算器，功能正常，考研可用', publishTime: Date.now() - 86400000 },
		] },
];

/* ========================================
   收藏 / 浏览记录 / 订单 / 租借订单 / 黑名单
   ======================================== */
const favorites = [items[1], items[3], items[7], items[9]];

const browseHistory = [
	{ id: 'h1', itemId: 'i2', title: items[1].title, price: items[1].price, type: items[1].type,
		category: items[1].category, time: Date.now() - 1800000 },
	{ id: 'h2', itemId: 'i4', title: items[3].title, price: items[3].price, type: items[3].type,
		category: items[3].category, time: Date.now() - 7200000 },
	{ id: 'h3', itemId: 'l2', title: leaseItems[1].title, price: leaseItems[1].price, type: 'lease',
		category: leaseItems[1].category, time: Date.now() - 28800000 },
	{ id: 'h4', itemId: 'l1', title: leaseItems[0].title, price: leaseItems[0].price, type: 'lease',
		category: leaseItems[0].category, time: Date.now() - 86400000 },
	{ id: 'h5', itemId: 'i5', title: items[4].title, price: items[4].price, type: items[4].type,
		category: items[4].category, time: Date.now() - 259200000 },
];

const orders = [
	{ id: 'o1', item: items[1], role: 'buyer', status: 'done', totalPrice: 99,
		createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), seller: users[1] },
	{ id: 'o2', item: items[2], role: 'seller', status: 'done', totalPrice: 18,
		createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), buyer: users[0] },
	{ id: 'o3', item: items[9], role: 'buyer', status: 'active', totalPrice: 680,
		createdAt: new Date(Date.now() - 86400000).toISOString(), seller: users[4] },
];

const rentals = [
	{ id: 'rl1', item: leaseItems[0], role: 'borrower', status: 'active',
		startDate: Date.now() - 86400000, endDate: Date.now() + 86400000 * 2, totalPrice: 90, deposit: 500 },
	{ id: 'rl2', item: leaseItems[1], role: 'lender', status: 'returned',
		startDate: Date.now() - 86400000 * 14, endDate: Date.now() - 86400000 * 7, totalPrice: 56, deposit: 200 },
	{ id: 'rl3', item: leaseItems[3], role: 'borrower', status: 'overdue',
		startDate: Date.now() - 86400000 * 20, endDate: Date.now() - 86400000 * 6, totalPrice: 100, deposit: 600 },
];

const blacklist = [
	{ id: 'b1', nickname: '恶意用户A', avatar: '', reason: '多次发布虚假物品信息', blockTime: Date.now() - 259200000 },
	{ id: 'b2', nickname: '失信买家B', avatar: '', reason: '确认交易后无故取消，态度恶劣', blockTime: Date.now() - 864000000 },
	{ id: 'b3', nickname: '骚扰用户C', avatar: '', reason: '在私信中发送骚扰信息', blockTime: Date.now() - 2160000000 },
];

/* ========================================
   AI识别 / 估价参考
   ======================================== */
const priceReference = { min: 25, max: 45, avg: 35, count: 12, condition: '9成新' };

/* 按分类的估价基准（元） */
const priceConfig = {
	book:    { min: 10,  max: 60,  count: 36, reason: '教材类物品折旧快，考研资料在热门时段价格更高' },
	digital: { min: 50,  max: 600, count: 52, reason: '数码产品受成色、保修和热门程度影响较大' },
	daily:   { min: 5,   max: 80,  count: 28, reason: '生活用品整体价格较低，品牌和成色决定区间' },
	sports:  { min: 20,  max: 200, count: 17, reason: '运动器材比较保值，热门装备有一定溢价' },
	fashion: { min: 15,  max: 150, count: 23, reason: '服饰类价格波动较大，品牌和季节影响明显' },
	free:    { min: 0,   max: 0,   count: 12, reason: '免费赠送类物品，建议标注自取时间和地点' },
	other:   { min: 5,   max: 100, count: 15, reason: '其他类物品价格区间较宽，仅供参考' },
};

const aiRecognition = {
	results: {
		book: { category: 'book', name: '教材书籍', confidence: 0.94, tags: ['教材', '考研', '二手书'] },
		phone: { category: 'digital', name: '数码产品', confidence: 0.91, tags: ['电子', '手机', '配件'] },
		cup: { category: 'daily', name: '生活用品', confidence: 0.87, tags: ['日常', '家居', '宿舍'] },
		ball: { category: 'sports', name: '文体工具', confidence: 0.89, tags: ['运动', '器材', '户外'] },
		clothes: { category: 'fashion', name: '服饰箱包', confidence: 0.85, tags: ['衣物', '穿搭', '箱包'] },
		default: { category: 'other', name: '其他', confidence: 0.72, tags: ['其他', '杂项'] },
	},
};

/* ========================================
   用户自己的发布 / 收藏 / 互助 / 租借 记录
   ======================================== */
const myPublish = [
	{ id: 'mp1', title: items[5].title, desc: items[5].description, type: 'sell', price: 28,
		category: 'book', campus: '长清湖校区', status: 'active', publishTime: Date.now() - 259200000, viewCount: 456, favCount: 34 },
	{ id: 'mp2', title: items[0].title, desc: items[0].description, type: 'sell', price: 35,
		category: 'book', campus: '长清湖校区', status: 'active', publishTime: Date.now() - 300000, viewCount: 328, favCount: 25 },
	{ id: 'mp3', title: '闲置收纳盒套装 3个装', desc: '全新未拆封，透明磨砂材质', type: 'sell', price: 15,
		category: 'daily', campus: '长清湖校区', status: 'sold', publishTime: Date.now() - 1209600000, viewCount: 89, favCount: 6,
		images: ['/static/goods/organizer.jpg'] },
	{ id: 'mp4', title: '滑板 专业板 轻微使用痕迹', desc: '入门时买的，现在换了新板所以出掉', type: 'sell', price: 80,
		category: 'sports', campus: '长清湖校区', status: 'active', publishTime: Date.now() - 172800000, viewCount: 67, favCount: 9,
		images: ['/static/goods/skateboard.jpg'] },
];

const myCollections = [
	{ id: 'mc1', item: items[1], collectTime: Date.now() - 7200000 },
	{ id: 'mc2', item: items[3], collectTime: Date.now() - 86400000 },
	{ id: 'mc3', item: items[7], collectTime: Date.now() - 259200000 },
	{ id: 'mc4', item: items[9], collectTime: Date.now() - 432000000 },
];

const myExchange = [
	{ id: 'me1', title: exchangePosts[2].title, desc: exchangePosts[2].description, tab: '求助帮忙', type: 'help',
		role: 'publish', status: 'done', reward: 10, campus: '长清湖校区', publishTime: Date.now() - 172800000, replyCount: 3 },
	{ id: 'me2', title: exchangePosts[3].title, desc: exchangePosts[3].description, tab: '拼单', type: 'group',
		role: 'join', status: 'done', reward: null, campus: '长清湖校区', publishTime: Date.now() - 432000000, replyCount: 7 },
	{ id: 'me3', title: '求购二手考研数学资料（数一）', desc: '有没有上岸的学长学姐出考研数学一的资料呀~', tab: '求购心愿',
		type: 'wish', role: 'publish', status: 'active', reward: null, campus: '长清湖校区', publishTime: Date.now() - 43200000, replyCount: 5 },
];

const myLease = [
	{ id: 'ml1', title: leaseItems[0].title, desc: leaseItems[0].desc, price: 30, deposit: 500, duration: 3,
		category: 'digital', campus: '长清湖校区', role: 'renter', status: 'active',
		startDate: Date.now() - 86400000, endDate: Date.now() + 86400000 * 2 },
	{ id: 'ml2', title: leaseItems[1].title, desc: leaseItems[1].desc, price: 8, deposit: 200, duration: 7,
		category: 'sports', campus: '长清湖校区', role: 'lender', status: 'returned',
		startDate: Date.now() - 86400000 * 14, endDate: Date.now() - 86400000 * 7 },
	{ id: 'ml3', title: leaseItems[3].title, desc: leaseItems[3].desc, price: 20, deposit: 600, duration: 5,
		category: 'digital', campus: '长清湖校区', role: 'renter', status: 'overdue',
		startDate: Date.now() - 86400000 * 20, endDate: Date.now() - 86400000 * 6 },
];

/* ========================================
   信誉积分
   ======================================== */
const creditHistory = [
	{ id: 'cr1', title: '完成一笔闲置交易', desc: '售出「台灯 LED 护眼灯」给 @闲置达人，双方互评好评', score: 5, time: Date.now() - 172800000, type: 'earn' },
	{ id: 'cr2', title: '按时归还租借物品', desc: '归还「单反相机 Canon 700D」并获出租方好评', score: 3, time: Date.now() - 432000000, type: 'earn' },
	{ id: 'cr3', title: '首次发布闲置物品', desc: '发布第一件闲置物品，开启环保之旅', score: 10, time: Date.now() - 864000000, type: 'earn' },
	{ id: 'cr4', title: '注册账号初始积分', desc: '欢迎加入拾闲小栈！初始赠送基础积分', score: 50, time: Date.now() - 2592000000, type: 'init' },
];

/* ========================================
   后台管理数据
   ======================================== */
const adminStats = { totalUsers: 1256, totalItems: 3428, totalTrades: 892, pendingReview: 3 };

const adminReviews = [
	{ id: 'ar1', title: 'MacBook Pro 2023 16寸 几乎全新', category: '数码电子', userName: '校园用户A', image: '', createdAt: Date.now() - 3600000 },
	{ id: 'ar2', title: '华为手机 P60 Pro 256G 在保', category: '数码电子', userName: '校园用户B', image: '', createdAt: Date.now() - 7200000 },
	{ id: 'ar3', title: '耐克运动鞋 43码 只穿过一次', category: '服饰箱包', userName: '校园用户C', image: '', createdAt: Date.now() - 10800000 },
];

const adminUsers = [
	{ id: 'au1', nickname: '张三', studentId: '2021001001', creditScore: 120, status: 'normal', avatar: '' },
	{ id: 'au2', nickname: '李四', studentId: '2021001002', creditScore: 45, status: 'normal', avatar: '' },
	{ id: 'au3', nickname: '王五', studentId: '2021001003', creditScore: 30, status: 'blocked', avatar: '' },
];

const adminReports = [
	{ id: 'ap1', type: 'fake', reason: '商品描述与实际不符，图片盗用', targetTitle: '索尼WH-1000XM4降噪耳机', createdAt: Date.now() - 86400000 },
	{ id: 'ap2', type: 'violation', reason: '发布违规内容，涉嫌欺诈', targetTitle: '游戏账号出售', createdAt: Date.now() - 172800000 },
];

/* ========================================
   导出
   ======================================== */
export {
	users, categories, schools, campuses,
	items, leaseItems, exchangePosts,
	conversations, notifications,
	recommendations, matches,
	favorites, browseHistory,
	orders, rentals, blacklist,
	priceReference, aiRecognition,
	priceConfig,
	myPublish, myCollections, myExchange, myLease,
	creditHistory,
	adminStats, adminReviews, adminUsers, adminReports,
};
