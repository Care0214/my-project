/**
 * Mock 请求处理器
 *
 * 模拟后端接口，返回假数据。
 * 每个接口模拟 200-500ms 的网络延迟。
 *
 * 使用方式：
 *   在 request.js 中设置 USE_MOCK = true 即可启用
 *   接入后端时改为 false，无需修改任何业务代码
 */

import {
	users,
	categories,
	items,
	exchangePosts,
	conversations,
	notifications,
	browseHistory,
	favorites,
	schools,
	orders,
	rentals,
	blacklist,
} from './data.js';

// 当前登录用户（模拟）
let currentUser = null;

/**
 * 随机延迟 200-500ms，模拟真实网络请求
 */
function delay() {
	const ms = 200 + Math.random() * 300;
	return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 成功响应格式
 */
function ok(data, msg = 'success') {
	return { code: 0, data, msg };
}

/**
 * 失败响应格式
 */
function fail(msg, code = -1) {
	return { code, msg, data: null };
}

/**
 * 根据 url 和 method 匹配对应的 mock 处理函数
 */
async function handle(url, method, data) {
	await delay();

	// ========== 用户 / 登录 ==========

	// 微信登录
	if (url === '/api/user/wechat-login' && method === 'POST') {
		return ok({
			token: 'mock_token_' + Date.now(),
			isNewUser: false,
			userInfo: users[0],
		});
	}

	// 获取学校列表
	if (url === '/api/schools' && method === 'GET') {
		return ok(schools);
	}

	// 学号验证（模拟）
	if (url === '/api/user/verify-student' && method === 'POST') {
		const { studentId } = data;
		// 模拟验证：学号长度 >= 6 且包含数字即通过
		if (studentId && studentId.length >= 6 && /\d/.test(studentId)) {
			return ok({ verified: true, school: schools[0].name });
		}
		return fail('学号验证失败，请检查后重试');
	}

	// 补全用户信息
	if (url === '/api/user/complete-profile' && method === 'POST') {
		const { nickname, avatar } = data;
		const user = { ...users[0], nickname: nickname || users[0].nickname };
		currentUser = user;
		return ok({ userInfo: user });
	}

	// 获取当前用户信息
	if (url === '/api/user/info' && method === 'GET') {
		return ok(currentUser || users[0]);
	}

	// 更新用户信息
	if (url === '/api/user/update' && method === 'POST') {
		currentUser = { ...currentUser, ...data };
		return ok({ userInfo: currentUser });
	}

	// ========== 物品 ==========

	// 物品列表（首页）
	if (url === '/api/items' && method === 'GET') {
		const { page = 1, pageSize = 10, categoryId, keyword, sort = 'latest' } = data || {};

		let filtered = [...items];

		if (categoryId) {
			filtered = filtered.filter((i) => i.categoryId === categoryId);
		}
		if (keyword) {
			filtered = filtered.filter(
				(i) => i.title.includes(keyword) || i.description.includes(keyword)
			);
		}

		// 排序
		if (sort === 'latest') {
			filtered.sort((a, b) => new Date(b.publishTime) - new Date(a.publishTime));
		} else if (sort === 'hot') {
			filtered.sort((a, b) => b.viewCount - a.viewCount);
		}

		const start = (page - 1) * pageSize;
		const list = filtered.slice(start, start + pageSize);

		return ok({
			list,
			total: filtered.length,
			page,
			pageSize,
			hasMore: start + pageSize < filtered.length,
		});
	}

	// 物品详情
	if (url.match(/^\/api\/items\/\w+$/) && method === 'GET') {
		const id = url.split('/').pop();
		const item = items.find((i) => i.id === id);
		if (!item) return fail('物品不存在');
		return ok(item);
	}

	// 发布物品
	if (url === '/api/items' && method === 'POST') {
		const newItem = {
			id: 'i' + Date.now(),
			...data,
			publishTime: new Date().toISOString(),
			publishTimeText: '刚刚',
			viewCount: 0,
			favoriteCount: 0,
			seller: currentUser || users[0],
			images: [],
			imageBg: '#F3F4F8',
		};
		items.unshift(newItem);
		return ok(newItem);
	}

	// ========== 分类 ==========

	if (url === '/api/categories' && method === 'GET') {
		return ok(categories);
	}

	// ========== 交流/互助 ==========

	if (url === '/api/exchange-posts' && method === 'GET') {
		const { page = 1, pageSize = 10, type, tab } = data || {};
		let filtered = [...exchangePosts];

		if (type) {
			filtered = filtered.filter((p) => p.type === type);
		}

		const start = (page - 1) * pageSize;
		return ok({
			list: filtered.slice(start, start + pageSize),
			total: filtered.length,
			hasMore: start + pageSize < filtered.length,
		});
	}

	// 互助帖子详情
	if (url.match(/^\/api\/exchange-posts\/\w+$/) && method === 'GET') {
		const id = url.split('/').pop();
		const post = exchangePosts.find((p) => p.id === id);
		if (!post) return fail('帖子不存在');
		return ok(post);
	}

	// 发布互助帖子
	if (url === '/api/exchange-posts' && method === 'POST') {
		const newPost = {
			id: 'e' + Date.now(),
			...data,
			createdAt: new Date().toISOString(),
			createdAtText: '刚刚',
			status: 'active',
			views: 0,
			user: currentUser || users[0],
			images: [],
			imageBg: '#F3F4F8',
		};
		exchangePosts.unshift(newPost);
		return ok(newPost);
	}

	// ========== 消息 ==========

	if (url === '/api/conversations' && method === 'GET') {
		return ok(conversations);
	}

	// 查找或创建会话
	if (url === '/api/conversations/find-or-create' && method === 'GET') {
		// 简单返回第一个会话 id，模拟"找到已有会话"
		const conv = conversations[0];
		return ok({ id: conv ? conv.id : 'conv1' });
	}

	// 会话详情
	if (url.match(/^\/api\/conversations\/\w+$/) && method === 'GET') {
		const id = url.split('/').pop();
		const conv = conversations.find((c) => c.id === id);
		if (!conv) return fail('会话不存在');
		return ok(conv);
	}

	// 发送消息
	if (url.match(/^\/api\/conversations\/\w+\/send$/) && method === 'POST') {
		return ok({
			id: 'm' + Date.now(),
			from: 'me',
			text: data.text,
			time: '刚刚',
		});
	}

	// 未读消息数
	if (url === '/api/conversations/unread-count' && method === 'GET') {
		const count = conversations.reduce((sum, c) => sum + c.unreadCount, 0);
		return ok({ count });
	}

	// 系统通知
	if (url === '/api/notifications' && method === 'GET') {
		return ok(notifications);
	}

	// ========== 收藏 ==========

	if (url === '/api/favorites' && method === 'GET') {
		return ok(favorites);
	}

	// 添加收藏
	if (url === '/api/favorites' && method === 'POST') {
		const item = items.find((i) => i.id === data.itemId);
		if (!item) return fail('物品不存在');
		if (!favorites.find((f) => f.id === item.id)) {
			favorites.unshift(item);
		}
		return ok({ favorited: true });
	}

	// 取消收藏
	if (url.match(/^\/api\/favorites\/\w+$/) && method === 'DELETE') {
		const id = url.split('/').pop();
		const idx = favorites.findIndex((f) => f.id === id);
		if (idx > -1) favorites.splice(idx, 1);
		return ok({ favorited: false });
	}

	// ========== 浏览记录 ==========

	if (url === '/api/browse-history' && method === 'GET') {
		return ok(browseHistory);
	}

	// ========== 用户发布 ==========

	if (url === '/api/user/posts' && method === 'GET') {
		const userPosts = items.filter((i) => i.seller.id === (currentUser || users[0]).id);
		return ok(userPosts);
	}

	if (url === '/api/user/exchange-posts' && method === 'GET') {
		const userExchanges = exchangePosts.filter((e) => e.user.id === (currentUser || users[0]).id);
		return ok(userExchanges);
	}

	// ========== 交易订单 ==========

	if (url === '/api/orders' && method === 'GET') {
		const { role } = data || {};
		let filtered = [...orders];
		if (role === 'buyer') {
			filtered = orders.filter((o) => o.role === 'buyer');
		} else if (role === 'seller') {
			filtered = orders.filter((o) => o.role === 'seller');
		}
		return ok(filtered);
	}

	// ========== 租借订单 ==========

	if (url === '/api/rentals' && method === 'GET') {
		const { role } = data || {};
		let filtered = [...rentals];
		if (role === 'borrower') {
			filtered = rentals.filter((r) => r.role === 'borrower');
		} else if (role === 'lender') {
			filtered = rentals.filter((r) => r.role === 'lender');
		}
		return ok(filtered);
	}

	// ========== 黑名单 ==========

	if (url === '/api/blacklist' && method === 'GET') {
		return ok(blacklist);
	}

	if (url.match(/^\/api\/blacklist\/\w+$/) && method === 'DELETE') {
		const id = url.split('/').pop();
		const idx = blacklist.findIndex((b) => b.id === id);
		if (idx > -1) blacklist.splice(idx, 1);
		return ok({ removed: true });
	}

	// ========== 404 ==========

	console.warn('[Mock] 未匹配的接口:', method, url);
	return fail('接口未找到', 404);
}

export { handle, delay };
