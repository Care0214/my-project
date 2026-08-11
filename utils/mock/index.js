/**
 * Mock 请求处理器 — 拾闲小栈（整合版）
 *
 * 模拟后端接口，返回假数据。每个接口模拟 200-500ms 网络延迟。
 *
 * 使用方式：
 *   在 request.js 中设置 USE_MOCK = true 即可启用
 *   接入后端时改为 false，无需修改任何业务代码
 */

import {
	users, categories, schools, campuses,
	items, leaseItems, exchangePosts,
	conversations, notifications,
	recommendations, matches,
	favorites, browseHistory,
	orders, rentals, blacklist,
	priceReference, aiRecognition, priceConfig,
	myPublish, myCollections, myExchange, myLease,
	creditHistory,
	adminStats, adminReviews, adminUsers, adminReports,
} from './data.js';

let currentUser = null;
let seeded = false;

const CONDITION_MULTIPLIER = { '全新': 1.2, '9成新': 1, '7成新': 0.75, '有磨损': 0.5 };

/* 初始数据快照（用于演示数据一键重置） */
const initialItems = items.slice();
const initialLeaseItems = leaseItems.slice();
const initialExchangePosts = exchangePosts.slice();
const initialFavorites = favorites.slice();
const initialBrowseHistory = browseHistory.slice();
const initialBlacklist = blacklist.slice();

function resetMockData() {
	items.length = 0;
	items.push(...initialItems);
	leaseItems.length = 0;
	leaseItems.push(...initialLeaseItems);
	exchangePosts.length = 0;
	exchangePosts.push(...initialExchangePosts);
	favorites.length = 0;
	favorites.push(...initialFavorites);
	browseHistory.length = 0;
	browseHistory.push(...initialBrowseHistory);
	blacklist.length = 0;
	blacklist.push(...initialBlacklist);
	currentUser = null;
}

/* 注入更多演示数据（仅一次） */
const SEED_ITEMS = [
	{ title: '考研英语词汇书《恋练有词》', description: '去年备考用的，词汇标注很全，附赠网课笔记', type: 'sell', price: 18, categoryId: 'c1', category: 'book', campus: '长清湖校区', location: '长清湖校区', images: ['/static/goods/book.jpg'], imageBg: '#EEF4FF', viewCount: 156, favoriteCount: 12, isHot: false, isNew: true, seller: users[0] },
	{ title: '华为 FreeBuds 4E 无线耳机', description: '用过两三次，几乎全新，充电盒无划痕', type: 'sell', price: 129, categoryId: 'c2', category: 'digital', campus: '长清湖校区', location: '长清湖校区', images: ['/static/goods/earbuds.jpg'], imageBg: '#F5F0FF', viewCount: 233, favoriteCount: 21, isHot: false, isNew: true, seller: users[1] },
	{ title: '宜家工作台灯 白色', description: '宿舍换灯闲置，三档色温可调，很护眼', type: 'sell', price: 35, categoryId: 'c3', category: 'daily', campus: '长清湖校区', location: '长清湖校区', images: ['/static/goods/lamp.jpg'], imageBg: '#FFF5EE', viewCount: 89, favoriteCount: 6, isHot: false, isNew: false, seller: users[2] },
	{ title: '尤克里里 23寸 桃花芯', description: '入门琴，音色不错，送调音器和琴包', type: 'sell', price: 99, categoryId: 'c4', category: 'sports', campus: '千佛山校区', location: '千佛山校区', images: ['/static/goods/guitar.jpg'], imageBg: '#F0FFF0', viewCount: 178, favoriteCount: 14, isHot: false, isNew: true, seller: users[4] },
	{ title: '户外冲锋衣 男款 L码', description: '防风防水，就穿过一次，尺码不合适出掉', type: 'sell', price: 260, categoryId: 'c5', category: 'fashion', campus: '千佛山校区', location: '千佛山校区', images: ['/static/goods/jacket.jpg'], imageBg: '#FFF8F0', viewCount: 145, favoriteCount: 11, isHot: false, isNew: false, seller: users[3] },
	{ title: '考研数学真题大全解', description: '数一数二通用，答案解析很详细，九成新', type: 'sell', price: 25, categoryId: 'c1', category: 'book', campus: '长清湖校区', location: '长清湖校区', images: ['/static/goods/textbook.jpg'], imageBg: '#EEF4FF', viewCount: 342, favoriteCount: 29, isHot: true, isNew: true, seller: users[0] },
	{ title: '卡西欧 fx-82ES 科学计算器', description: '大二买的，考试用了一年，功能全部正常', type: 'sell', price: 30, categoryId: 'c2', category: 'digital', campus: '长清湖校区', location: '长清湖校区', images: ['/static/goods/calculator.jpg'], imageBg: '#F5F0FF', viewCount: 76, favoriteCount: 5, isHot: false, isNew: false, seller: users[4] },
	{ title: 'Kindle 青春版 8GB', description: '背光可调，电池很耐用，送保护套', type: 'sell', price: 260, categoryId: 'c2', category: 'digital', campus: '长清湖校区', location: '长清湖校区', images: ['/static/goods/kindle.jpg'], imageBg: '#FAFAFA', viewCount: 415, favoriteCount: 36, isHot: true, isNew: false, seller: users[1] },
	{ title: '桌面理线收纳盒', description: '整理数据线的神器，全新未用', type: 'sell', price: 12, categoryId: 'c3', category: 'daily', campus: '长清湖校区', location: '长清湖校区', images: ['/static/goods/organizer.jpg'], imageBg: '#FFF5EE', viewCount: 54, favoriteCount: 3, isHot: false, isNew: true, seller: users[2] },
	{ title: 'JBL T500BT 头戴蓝牙耳机', description: '低频不错，续航20小时，轻微使用痕迹', type: 'sell', price: 180, categoryId: 'c2', category: 'digital', campus: '千佛山校区', location: '千佛山校区', images: ['/static/goods/headphones.jpg'], imageBg: '#F5F0FF', viewCount: 267, favoriteCount: 24, isHot: false, isNew: false, seller: users[3] },
	{ title: '佳能 M50 微单 + 套机镜头', description: '毕业季出摄影器材，快门数不高，成色新', type: 'sell', price: 2200, categoryId: 'c2', category: 'digital', campus: '长清湖校区', location: '长清湖校区', images: ['/static/goods/camera.jpg'], imageBg: '#F5F0FF', viewCount: 521, favoriteCount: 48, isHot: true, isNew: false, seller: users[2] },
	{ title: '捷安特山地车 26寸', description: '大二买的，车况好，刹车灵敏，配锁', type: 'sell', price: 380, categoryId: 'c4', category: 'sports', campus: '长清湖校区', location: '长清湖校区', images: ['/static/goods/bicycle.jpg'], imageBg: '#F0FFF0', viewCount: 298, favoriteCount: 31, isHot: false, isNew: false, seller: users[4] },
	{ title: '宿舍小冰吧 6L', description: '夏天放饮料水果，功率小宿舍可用，静音', type: 'sell', price: 65, categoryId: 'c3', category: 'daily', campus: '长清湖校区', location: '长清湖校区', images: ['/static/goods/fridge.jpg'], imageBg: '#FFF5EE', viewCount: 132, favoriteCount: 9, isHot: false, isNew: true, seller: users[0] },
	{ title: 'Switch Lite 港版 黄色', description: '掌机成色极好，屏幕无划痕，带收纳包', type: 'sell', price: 950, categoryId: 'c2', category: 'digital', campus: '长清湖校区', location: '长清湖校区', images: ['/static/goods/switch.jpg'], imageBg: '#F5F0FF', viewCount: 603, favoriteCount: 55, isHot: true, isNew: false, seller: users[1] },
	{ title: '双人露营帐篷 三季帐', description: '户外社闲置，防雨防风，含地钉收纳袋', type: 'sell', price: 120, categoryId: 'c4', category: 'sports', campus: '千佛山校区', location: '千佛山校区', images: ['/static/goods/tent.jpg'], imageBg: '#F0FFF0', viewCount: 87, favoriteCount: 7, isHot: false, isNew: false, seller: users[2] },
	{ title: '拍立得相纸 10张装', description: '白边经典款，还剩两盒，毕业季拍照用', type: 'sell', price: 45, categoryId: 'c2', category: 'digital', campus: '长清湖校区', location: '长清湖校区', images: ['/static/goods/polaroid.jpg'], imageBg: '#FAFAFA', viewCount: 112, favoriteCount: 8, isHot: false, isNew: true, seller: users[3] },
	{ title: '折叠午休床 加厚海绵', description: '办公室午休神器，可折叠不占地方', type: 'sell', price: 88, categoryId: 'c3', category: 'daily', campus: '长清湖校区', location: '长清湖校区', images: ['/static/goods/bed.jpg'], imageBg: '#FFF5EE', viewCount: 143, favoriteCount: 13, isHot: false, isNew: false, seller: users[4] },
	{ title: '枫木长板滑板', description: '新手练习板，轴承很顺滑，含护具一套', type: 'sell', price: 150, categoryId: 'c4', category: 'sports', campus: '千佛山校区', location: '千佛山校区', images: ['/static/goods/skateboard.jpg'], imageBg: '#F0FFF0', viewCount: 98, favoriteCount: 6, isHot: false, isNew: false, seller: users[0] },
];

function seedDemoData() {
	if (seeded) return { added: 0 };
	SEED_ITEMS.forEach((item, i) => {
		items.unshift({
			...item,
			id: 'seed' + (i + 1),
			publishTime: new Date(Date.now() - (i + 1) * 3600000).toISOString(),
			publishTimeText: (i + 1) + '小时前',
		});
	});
	seeded = true;
	return { added: SEED_ITEMS.length };
}

function delay() {
	const ms = 200 + Math.random() * 300;
	return new Promise((resolve) => setTimeout(resolve, ms));
}

function ok(data, msg = 'success') {
	return { code: 0, data, msg };
}

function fail(msg, code = -1) {
	return { code, msg, data: null };
}

async function handle(url, method, data) {
	await delay();

	// ==================== 用户 / 登录 ====================

	if (url === '/api/user/wechat-login' && method === 'POST') {
		return ok({ token: 'mock_token_' + Date.now(), isNewUser: false, userInfo: users[0] });
	}

	if (url === '/api/schools' && method === 'GET') {
		return ok(schools);
	}

	if (url === '/api/campuses' && method === 'GET') {
		const { school } = data || {};
		if (school) {
			const s = schools.find((x) => x.name === school);
			if (s) return ok(s.campuses.map((name, i) => ({ id: i + 1, name })));
		}
		return ok(campuses);
	}

	if (url === '/api/user/verify-student' && method === 'POST') {
		const { studentId, school, campus } = data;
		if (studentId && studentId.length >= 6 && /\d/.test(studentId)) {
			return ok({ verified: true, school, campus });
		}
		return fail('学号验证失败，请检查后重试');
	}

	if (url === '/api/user/complete-profile' && method === 'POST') {
		const { nickname, school, campus, studentId } = data;
		const user = {
			...users[0],
			nickname: nickname || users[0].nickname,
			school: school || users[0].school,
			campus: campus || users[0].campus,
			studentId: studentId || users[0].studentId,
		};
		currentUser = user;
		return ok({ userInfo: user });
	}

	if (url === '/api/user/info' && method === 'GET') {
		return ok(currentUser || users[0]);
	}

	if (url === '/api/user/update' && method === 'POST') {
		currentUser = { ...(currentUser || users[0]), ...data };
		return ok({ userInfo: currentUser });
	}

	// ==================== 物品 ====================

	if (url === '/api/items' && method === 'GET') {
		const { page = 1, pageSize = 10, categoryId, keyword, sort = 'latest', type, campus } = data || {};
		let filtered = [...items];

		if (type === 'lease') {
			// 筛选出租类物品（如果有的话）
			filtered = filtered.filter((i) => i.type === 'lease');
		}
		if (campus && campus !== '全部校区') {
			filtered = filtered.filter((i) => i.campus === campus);
		}
		if (categoryId) {
			filtered = filtered.filter((i) => i.categoryId === categoryId);
		}
		if (keyword) {
			filtered = filtered.filter((i) => i.title.includes(keyword) || i.description.includes(keyword));
		}

		if (sort === 'latest') {
			filtered.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));
		} else if (sort === 'hot') {
			filtered.sort((a, b) => b.viewCount - a.viewCount);
		} else if (sort === 'price_asc') {
			filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
		} else if (sort === 'price_desc') {
			filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
		}

		const start = (page - 1) * pageSize;
		return ok({
			list: filtered.slice(start, start + pageSize),
			total: filtered.length, page, pageSize,
			hasMore: start + pageSize < filtered.length,
		});
	}

	if (url.match(/^\/api\/items\/\w+$/) && method === 'GET') {
		const id = url.split('/').pop();
		const item = items.find((i) => i.id === id);
		if (!item) return fail('物品不存在');
		return ok(item);
	}

	if (url === '/api/items' && method === 'POST') {
		const cat = categories.find((c) => c.id === data.category);
		const baseUser = currentUser || users[0];
		const seller = data.anonymous
			? {
				id: 'anon_' + Date.now(),
				nickname: data.anonymousTitle || '拾闲用户',
				avatarBg: '#8B5CF6',
				anonymous: true,
				school: baseUser.school,
				campus: baseUser.campus,
			}
			: baseUser;
		const newItem = {
			id: 'i' + Date.now(), ...data,
			publishTime: new Date().toISOString(), publishTimeText: '刚刚',
			viewCount: 0, favoriteCount: 0,
			seller,
			images: data.images || [], imageBg: '#F3F4F8',
			categoryId: data.categoryId || data.category || 'c6',
			category: data.categoryKey || (cat ? cat.key : 'other'),
		};
		items.unshift(newItem);
		return ok(newItem);
	}

	// ==================== 分类 ====================

	if (url === '/api/categories' && method === 'GET') {
		return ok(categories);
	}

	// ==================== 租借物品 ====================

	if (url === '/api/lease-items' && method === 'GET') {
		const { page = 1, pageSize = 10, keyword, sort = 'newest', campus } = data || {};
		let filtered = [...leaseItems];

		if (campus && campus !== '全部校区') {
			filtered = filtered.filter((i) => i.campus === campus);
		}
		if (keyword) {
			filtered = filtered.filter((i) => i.title.includes(keyword) || i.desc.includes(keyword));
		}

		if (sort === 'newest') {
			filtered.sort((a, b) => b.publishTime - a.publishTime);
		} else if (sort === 'price_asc') {
			filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
		} else if (sort === 'price_desc') {
			filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
		}

		const start = (page - 1) * pageSize;
		return ok({
			list: filtered.slice(start, start + pageSize),
			total: filtered.length, hasMore: start + pageSize < filtered.length,
		});
	}

	if (url.match(/^\/api\/lease-items\/\w+$/) && method === 'GET') {
		const id = url.split('/').pop();
		const item = leaseItems.find((i) => i.id === id);
		if (!item) return fail('租借物品不存在');
		return ok(item);
	}

	// ==================== 推荐 & 匹配 ====================

	if (url === '/api/recommendations' && method === 'GET') {
		return ok(recommendations);
	}

	if (url === '/api/matches' && method === 'GET') {
		return ok(matches);
	}

	// ==================== 浏览记录 ====================

	if (url === '/api/browse-history' && method === 'GET') {
		return ok(browseHistory);
	}

	if (url === '/api/browse-history' && method === 'POST') {
		const { itemId, title, price, type, category } = data || {};
		const record = { id: 'h' + Date.now(), itemId, title, price, type, category, time: Date.now() };
		// 去重
		const idx = browseHistory.findIndex((h) => h.itemId === itemId);
		if (idx > -1) browseHistory.splice(idx, 1);
		browseHistory.unshift(record);
		if (browseHistory.length > 50) browseHistory.pop();
		return ok(record);
	}

	if (url.match(/^\/api\/browse-history\/\w+$/) && method === 'DELETE') {
		const id = url.split('/').pop();
		const idx = browseHistory.findIndex((h) => h.id === id);
		if (idx > -1) browseHistory.splice(idx, 1);
		return ok({ removed: true });
	}

	// ==================== AI 识别 ====================

	if (url === '/api/ai/recognize' && method === 'POST') {
		const keys = Object.keys(aiRecognition.results);
		const key = keys[Math.floor(Math.random() * keys.length)];
		return ok(aiRecognition.results[key]);
	}

	// ==================== 估价参考 ====================

	if (url === '/api/price-reference' && method === 'GET') {
		return ok(priceReference);
	}

	if (url === '/api/price/estimate' && method === 'POST') {
		const { category = 'other', condition = '9成新', keyword = '' } = data || {};
		const cfg = priceConfig[category] || priceConfig.other;
		const mult = CONDITION_MULTIPLIER[condition] || 1;
		// 关键词微调：数码/品牌类上调，教材文具类下调
		let kwMult = 1;
		if (/(手机|耳机|平板|电脑|笔记本|相机|switch|ps5|kindle|iPad|Mac|索尼|华为|苹果|大疆)/.test(keyword)) kwMult = 1.15;
		else if (/(书|教材|资料|考研|笔记|文具|计算器)/.test(keyword)) kwMult = 0.85;
		const min = Math.round(cfg.min * mult * kwMult);
		const max = Math.round(cfg.max * mult * kwMult);
		return ok({
			category, condition,
			min, max,
			avg: Math.round((min + max) / 2),
			count: cfg.count,
			reason: cfg.reason,
		});
	}

	// ==================== 用户主页 ====================

	if (url.match(/^\/api\/users\/\w+$/) && method === 'GET') {
		const id = url.split('/').pop();
		const user = users.find((u) => u.id === id);
		if (!user) return fail('用户不存在');
		return ok({
			user,
			items: items.filter((i) => i.seller && i.seller.id === id),
			leaseItems: leaseItems.filter((i) => i.user && i.user.id === id),
			exchangePosts: exchangePosts.filter((p) => p.user && p.user.id === id),
		});
	}

	// ==================== 互助帖子 ====================

	if (url === '/api/exchange-posts' && method === 'GET') {
		const { page = 1, pageSize = 10, type, tab } = data || {};
		let filtered = [...exchangePosts];

		if (type) {
			filtered = filtered.filter((p) => p.type === type);
		}
		if (tab && tab !== '全部') {
			filtered = filtered.filter((p) => p.tab === tab);
		}

		const start = (page - 1) * pageSize;
		return ok({
			list: filtered.slice(start, start + pageSize),
			total: filtered.length,
			hasMore: start + pageSize < filtered.length,
		});
	}

	if (url.match(/^\/api\/exchange-posts\/\w+$/) && method === 'GET') {
		const id = url.split('/').pop();
		const post = exchangePosts.find((p) => p.id === id);
		if (!post) return fail('帖子不存在');
		return ok(post);
	}

	if (url === '/api/exchange-posts' && method === 'POST') {
		const baseUser = currentUser || users[0];
		const postUser = data.anonymous
			? {
				id: 'anon_' + Date.now(),
				nickname: data.anonymousTitle || '拾闲用户',
				avatarBg: '#8B5CF6',
				anonymous: true,
				school: baseUser.school,
				campus: baseUser.campus,
			}
			: baseUser;
		const newPost = {
			id: 'e' + Date.now(), ...data,
			createdAt: new Date().toISOString(), createdAtText: '刚刚',
			status: 'active', views: 0,
			user: postUser, images: data.images || [], imageBg: '#F3F4F8',
		};
		exchangePosts.unshift(newPost);
		return ok(newPost);
	}

	// ==================== 会话 / 消息 ====================

	if (url === '/api/conversations' && method === 'GET') {
		return ok(conversations);
	}

	if (url === '/api/conversations/find-or-create' && method === 'GET') {
		const conv = conversations[0];
		return ok({ id: conv ? conv.id : 'conv1' });
	}

	if (url.match(/^\/api\/conversations\/\w+$/) && method === 'GET') {
		const id = url.split('/').pop();
		const conv = conversations.find((c) => c.id === id);
		if (!conv) return fail('会话不存在');
		return ok(conv);
	}

	if (url.match(/^\/api\/conversations\/\w+\/send$/) && method === 'POST') {
		return ok({ id: 'm' + Date.now(), from: 'me', text: data.text, time: '刚刚' });
	}

	if (url === '/api/conversations/unread-count' && method === 'GET') {
		const count = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
		return ok({ count });
	}

	// ==================== 通知 ====================

	if (url === '/api/notifications' && method === 'GET') {
		return ok(notifications);
	}

	// ==================== 收藏 ====================

	if (url === '/api/favorites' && method === 'GET') {
		return ok(favorites);
	}

	if (url === '/api/favorites' && method === 'POST') {
		const found = items.find((i) => i.id === data.itemId);
		if (!found) return fail('物品不存在');
		if (!favorites.find((f) => f.id === found.id)) {
			favorites.unshift(found);
		}
		return ok({ favorited: true });
	}

	if (url.match(/^\/api\/favorites\/\w+$/) && method === 'DELETE') {
		const id = url.split('/').pop();
		const idx = favorites.findIndex((f) => f.id === id);
		if (idx > -1) favorites.splice(idx, 1);
		return ok({ favorited: false });
	}

	// ==================== 用户发布 ====================

	if (url === '/api/user/posts' && method === 'GET') {
		return ok(myPublish);
	}

	if (url === '/api/user/exchange-posts' && method === 'GET') {
		return ok(myExchange);
	}

	// ==================== 订单 & 租借 ====================

	if (url === '/api/orders' && method === 'GET') {
		const { role } = data || {};
		let filtered = [...orders];
		if (role === 'buyer') filtered = orders.filter((o) => o.role === 'buyer');
		else if (role === 'seller') filtered = orders.filter((o) => o.role === 'seller');
		return ok(filtered);
	}

	if (url === '/api/rentals' && method === 'GET') {
		const { role } = data || {};
		let filtered = [...rentals];
		if (role === 'borrower') filtered = rentals.filter((r) => r.role === 'borrower');
		else if (role === 'lender') filtered = rentals.filter((r) => r.role === 'lender');
		return ok(filtered);
	}

	if (url === '/api/user/lease-records' && method === 'GET') {
		return ok(myLease);
	}

	// ==================== 黑名单 ====================

	if (url === '/api/blacklist' && method === 'GET') {
		return ok(blacklist);
	}

	if (url.match(/^\/api\/blacklist\/\w+$/) && method === 'DELETE') {
		const id = url.split('/').pop();
		const idx = blacklist.findIndex((b) => b.id === id);
		if (idx > -1) blacklist.splice(idx, 1);
		return ok({ removed: true });
	}

	// ==================== 信誉积分 ====================

	if (url === '/api/credit/history' && method === 'GET') {
		return ok(creditHistory);
	}

	// ==================== 后台管理 ====================

	if (url === '/api/admin/statistics' && method === 'GET') {
		return ok({ ...adminStats, pendingReview: adminReviews.length });
	}

	if (url === '/api/admin/review-list' && method === 'GET') {
		return ok(adminReviews);
	}

	if (url === '/api/admin/review' && method === 'POST') {
		const { id } = data || {};
		const idx = adminReviews.findIndex((r) => r.id === id);
		if (idx > -1) adminReviews.splice(idx, 1);
		return ok({ handled: true });
	}

	if (url === '/api/admin/user-list' && method === 'GET') {
		return ok(adminUsers);
	}

	if (url === '/api/admin/handle-user' && method === 'POST') {
		const { id, action } = data || {};
		const u = adminUsers.find((x) => x.id === id);
		if (u) u.status = action === 'block' ? 'blocked' : 'normal';
		return ok({ handled: true });
	}

	if (url === '/api/admin/reports' && method === 'GET') {
		return ok(adminReports);
	}

	if (url === '/api/admin/report' && method === 'POST') {
		const { id } = data || {};
		const idx = adminReports.findIndex((r) => r.id === id);
		if (idx > -1) adminReports.splice(idx, 1);
		return ok({ handled: true });
	}

	// ==================== 演示数据重置 ====================

	if (url === '/api/mock/reset' && method === 'POST') {
		resetMockData();
		return ok({ reset: true });
	}

	if (url === '/api/mock/seed' && method === 'POST') {
		return ok(seedDemoData());
	}

	// ==================== 404 ====================

	console.warn('[Mock] 未匹配的接口:', method, url);
	return fail('接口未找到', 404);
}

export { handle, delay, resetMockData, seedDemoData };
