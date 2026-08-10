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
	priceReference, aiRecognition,
	myPublish, myCollections, myExchange, myLease,
	creditHistory,
} from './data.js';

let currentUser = null;

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
		return ok(campuses);
	}

	if (url === '/api/user/verify-student' && method === 'POST') {
		const { studentId } = data;
		if (studentId && studentId.length >= 6 && /\d/.test(studentId)) {
			return ok({ verified: true, school: schools[0].name });
		}
		return fail('学号验证失败，请检查后重试');
	}

	if (url === '/api/user/complete-profile' && method === 'POST') {
		const { nickname } = data;
		const user = { ...users[0], nickname: nickname || users[0].nickname };
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
		const { page = 1, pageSize = 10, categoryId, keyword, sort = 'latest', type } = data || {};
		let filtered = [...items];

		if (type === 'lease') {
			// 筛选出租类物品（如果有的话）
			filtered = filtered.filter((i) => i.type === 'lease');
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
		const newItem = {
			id: 'i' + Date.now(), ...data,
			publishTime: new Date().toISOString(), publishTimeText: '刚刚',
			viewCount: 0, favoriteCount: 0,
			seller: currentUser || users[0], images: [], imageBg: '#F3F4F8',
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
		const newPost = {
			id: 'e' + Date.now(), ...data,
			createdAt: new Date().toISOString(), createdAtText: '刚刚',
			status: 'active', views: 0,
			user: currentUser || users[0], images: [], imageBg: '#F3F4F8',
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

	// ==================== 404 ====================

	console.warn('[Mock] 未匹配的接口:', method, url);
	return fail('接口未找到', 404);
}

export { handle, delay };
