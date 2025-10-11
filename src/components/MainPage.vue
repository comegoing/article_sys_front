<template>
  <div class="min-h-screen bg-gray-50 text-gray-800">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm sticky top-0 z-50">
      <div class="container mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <i class="fa fa-book text-primary text-2xl"></i>
          <h1 class="text-xl font-bold text-primary">
            arXiv论文筛选与管理系统
          </h1>
        </div>
        <div class="flex items-center space-x-4">
          <button 
            @click="showSearchModal = true" 
            class="btn btn-primary flex items-center"
          >
            <i class="fa fa-search mr-2"></i>检索论文
          </button>
          <button 
            @click="exportSelectedPapers" 
            class="btn btn-primary flex items-center"
          >
            <i class="fa fa-download mr-2"></i>导出选中论文
          </button>
          <button 
            @click="showHelpModal = true" 
            class="btn btn-outline"
          >
            <i class="fa fa-question-circle"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="container mx-auto px-4 py-6">
      <div class="flex flex-col lg:flex-row gap-6">
        <!-- 左侧筛选面板 -->
        <aside class="lg:w-1/4 bg-white rounded-lg shadow-sm p-4">
          <h2 class="text-lg font-semibold mb-4 flex items-center">
            <i class="fa fa-filter mr-2 text-primary"></i>筛选条件
          </h2>

          <!-- 全选/取消全选 -->
          <div class="mb-6 p-3 bg-gray-50 rounded-md">
            <div class="flex items-center justify-between">
              <label class="flex items-center cursor-pointer">
                <input 
                  v-model="selectAll" 
                  type="checkbox" 
                  class="checkbox-lg" 
                  @change="toggleSelectAll"
                />
                <span class="ml-2 font-medium">全选/取消全选</span>
              </label>
              <span class="badge badge-blue">已选: {{ selectedPapers.length }}</span>
            </div>
          </div>

          <!-- 分类筛选 -->
          <div class="mb-6">
            <h3 class="font-medium mb-2">分类筛选</h3>
            <div class="space-y-2">
              <div 
                v-for="category in categories" 
                :key="category.id" 
                class="flex items-center"
              >
                <label class="flex items-center cursor-pointer w-full">
                  <input 
                    type="radio" 
                    name="category" 
                    :value="category.id" 
                    v-model="currentCategoryFilter" 
                    class="category-radio h-4 w-4 text-primary focus:ring-primary/50" 
                  />
                  <span class="ml-2 flex-grow">{{ category.name }}</span>
                  <span 
                    :class="currentCategoryFilter === category.id ? 'badge-primary' : 'badge-blue'" 
                    class="badge"
                  >
                    {{ category.count }}
                  </span>
                </label>
              </div>
            </div>
            <div class="mt-3">
              <button 
                @click="showAddCategoryModal = true" 
                class="btn btn-outline w-full text-sm flex items-center justify-center"
              >
                <i class="fa fa-plus mr-1"></i>添加自定义分类
              </button>
            </div>
          </div>

          <!-- 时间范围筛选 -->
          <div class="mb-6">
            <h3 class="font-medium mb-2">时间范围</h3>
            <div class="space-y-2">
              <div>
                <label class="block text-sm text-gray-600 mb-1">开始日期</label>
                <input
                  type="date"
                  v-model="startDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div>
                <label class="block text-sm text-gray-600 mb-1">结束日期</label>
                <input
                  type="date"
                  v-model="endDate"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>

          <!-- 关键词搜索 -->
          <div>
            <h3 class="font-medium mb-2">关键词搜索</h3>
            <div class="relative">
              <input
                type="text"
                v-model="keywordSearch"
                placeholder="输入关键词搜索..."
                class="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <i
                class="fa fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              ></i>
            </div>
          </div>
        </aside>

        <!-- 右侧论文列表 -->
        <div class="lg:w-3/4">
          <!-- 顶部统计信息 -->
          <div
            class="bg-white rounded-lg shadow-sm p-4 mb-6 flex flex-wrap justify-between items-center"
          >
            <div>
              <span class="font-semibold">{{ filteredPapers.length }}</span>
              <span>篇论文</span>
            </div>
            <div class="flex items-center space-x-4 mt-2 sm:mt-0">
              <div class="flex items-center">
                <span class="text-sm text-gray-600 mr-2">排序方式:</span>
                <select
                  v-model="sortBy"
                  class="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="published-desc">发布日期 (新→旧)</option>
                  <option value="published-asc">发布日期 (旧→新)</option>
                  <option value="title-asc">标题 (A→Z)</option>
                  <option value="title-desc">标题 (Z→A)</option>
                </select>
              </div>
              <button 
                @click="clearFilters" 
                class="btn btn-outline text-sm"
              >
                <i class="fa fa-refresh mr-1"></i>清除筛选
              </button>
            </div>
          </div>

          <!-- 论文时间分布图表 -->
          <div class="bg-white rounded-lg shadow-sm p-4 mb-6" v-if="filteredPapers.length > 0">
            <h3 class="font-medium mb-3">论文时间分布</h3>
            <div class="h-48">
              <canvas ref="papersChart"></canvas>
            </div>
          </div>

          <!-- 论文列表 -->
          <div class="space-y-4">
            <!-- 欢迎信息 -->
            <div 
              v-if="filteredPapers.length === 0 && !hasSearched" 
              class="bg-white rounded-lg shadow-sm p-8 text-center"
            >
              <i class="fa fa-search text-primary text-4xl mb-4"></i>
              <h3 class="text-lg font-medium text-gray-900 mb-2">欢迎使用arXiv论文筛选与管理系统</h3>
              <p class="text-gray-500 mb-4">请点击顶部的"检索论文"按钮开始</p>
              <button 
                @click="showSearchModal = true" 
                class="btn btn-primary"
              >
                <i class="fa fa-search mr-2"></i>立即检索
              </button>
            </div>

            <!-- 无结果提示 -->
            <div 
              v-else-if="filteredPapers.length === 0 && hasSearched" 
              class="bg-white rounded-lg shadow-sm p-8 text-center"
            >
              <i class="fa fa-search text-gray-400 text-4xl mb-4"></i>
              <h3 class="text-lg font-medium text-gray-900 mb-2">未找到匹配的论文</h3>
              <p class="text-gray-500">请尝试调整筛选条件或关键词</p>
            </div>

            <!-- 论文卡片 -->
            <div 
              v-for="paper in filteredPapers" 
              :key="paper.id" 
              :class="['paper-card', { 'selected': paper.selected }]"
            >
              <div class="flex items-start">
                <div class="flex-shrink-0 mt-1">
                  <input 
                    type="checkbox" 
                    v-model="paper.selected" 
                    class="paper-checkbox checkbox-lg" 
                    @change="togglePaperSelection(paper.id, paper.selected)"
                  />
                </div>
                <div class="ml-4 flex-grow">
                  <div class="flex flex-wrap justify-between items-start">
                    <h3 
                      class="paper-title text-lg font-semibold text-gray-900 hover:text-primary cursor-pointer"
                      @click="togglePaperAbstract(paper.id)"
                    >
                      {{ paper.title.zh }}
                    </h3>
                    <div class="flex items-center space-x-2 mt-1 sm:mt-0">
                      <span class="badge badge-blue">{{ formatDate(paper.published) }}</span>
                      <div 
                        :class="['paper-category-select', { 'hidden': !paper.showCategorySelect }]"
                      >
                        <select 
                          v-model="paper.selectedCategory" 
                          class="text-sm border border-gray-300 rounded-md px-2 py-1"
                          @change="assignCategoryToPaper(paper.id, paper.selectedCategory)"
                        >
                          <option value="">选择分类...</option>
                          <option 
                            v-for="cat in categories" 
                            :key="cat.id" 
                            :value="cat.id"
                          >
                            {{ cat.name }}
                          </option>
                        </select>
                      </div>
                      <button 
                        class="paper-category-btn text-gray-400 hover:text-primary"
                        @click="paper.showCategorySelect = !paper.showCategorySelect"
                      >
                        <i class="fa fa-tag"></i>
                      </button>
                      <button 
                        class="paper-delete-btn text-gray-400 hover:text-danger"
                        @click="deletePaper(paper.id)"
                      >
                        <i class="fa fa-trash"></i>
                      </button>
                    </div>
                  </div>
                  <div class="mt-2">
                    <p class="text-sm text-gray-600">
                      <span class="font-medium">作者:</span> {{ paper.authors.join(', ') }}
                    </p>
                  </div>
                  <div 
                    :class="['mt-3', 'paper-abstract-collapsed', { 'hidden': paper.showFullAbstract }]"
                  >
                    <p class="text-gray-700 line-clamp-3">{{ paper.abstract.zh }}</p>
                    <button 
                      class="paper-expand-btn text-primary hover:text-primary/80 text-sm mt-1 flex items-center"
                      @click="togglePaperAbstract(paper.id)"
                    >
                      <span>展开全文</span>
                      <i class="fa fa-chevron-down ml-1 text-xs"></i>
                    </button>
                  </div>
                  <div 
                    :class="['mt-3', 'paper-abstract-expanded', { 'hidden': !paper.showFullAbstract }]"
                  >
                    <p class="text-gray-700">{{ paper.abstract.zh }}</p>
                    <div class="mt-3 pt-3 border-t border-gray-100">
                      <h4 class="font-medium text-gray-900 mb-1">英文标题</h4>
                      <p class="text-gray-700 italic">{{ paper.title.en }}</p>
                    </div>
                    <div class="mt-2 pt-2 border-t border-gray-100">
                      <h4 class="font-medium text-gray-900 mb-1">英文摘要</h4>
                      <p class="text-gray-700 italic">{{ paper.abstract.en }}</p>
                    </div>
                    <button 
                      class="paper-collapse-btn text-primary hover:text-primary/80 text-sm mt-2 flex items-center"
                      @click="togglePaperAbstract(paper.id)"
                    >
                      <span>收起</span>
                      <i class="fa fa-chevron-up ml-1 text-xs"></i>
                    </button>
                  </div>
                  <div class="mt-3 flex flex-wrap gap-2">
                    <a 
                      :href="paper.url" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      class="btn btn-outline text-sm flex items-center"
                    >
                      <i class="fa fa-external-link mr-1"></i>查看原文
                    </a>
                    <a 
                      :href="paper.pdfUrl" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      class="btn btn-outline text-sm flex items-center"
                    >
                      <i class="fa fa-file-pdf-o mr-1"></i>下载PDF
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 加载更多 -->
          <div class="text-center mt-6" v-if="filteredPapers.length > 0">
            <button 
              @click="loadMore" 
              :disabled="loadingMore"
              :class="['btn btn-outline', { 'opacity-50 cursor-not-allowed': loadingMore }]"
            >
              <i 
                :class="loadingMore ? 'fa fa-spinner fa-spin' : 'fa fa-refresh'" 
                class="mr-2"
              ></i>
              {{ loadingMore ? '加载中...' : '加载更多' }}
            </button>
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="bg-white border-t mt-8">
      <div class="container mx-auto px-4 py-4 text-center text-sm text-gray-600">
        <p>© 2025 arXiv论文筛选与管理系统 | 专为学术研究人员设计</p>
      </div>
    </footer>

    <!-- 检索论文模态框 -->
    <div 
      v-if="showSearchModal" 
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">检索arXiv论文</h3>
          <button 
            @click="showSearchModal = false" 
            class="text-gray-500 hover:text-gray-700"
          >
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >研究方向</label
            >
            <select
              v-model="researchDirection"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <option value="">请选择研究方向...</option>
              <option value="all_adversarial">所有对抗性学习相关论文</option>
              <option value="rs_adversarial">推荐系统中的对抗性学习论文</option>
              <option value="mm_adversarial">多模态中的对抗性学习论文</option>
              <option value="llm_adversarial">
                大语言模型中的对抗性学习论文
              </option>
              <option value="rs">推荐系统相关论文</option>
              <option value="mm">多模态相关论文</option>
              <option value="llm">大语言模型相关论文</option>
            </select>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >开始日期</label
              >
              <input
                type="date"
                v-model="searchStartDate"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1"
                >结束日期</label
              >
              <input
                type="date"
                v-model="searchEndDate"
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-ring-primary/50"
              />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >最大结果数量</label
            >
            <input
              type="number"
              v-model="maxResults"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              min="10"
              max="300"
            />
          </div>
          <div class="flex justify-end space-x-3 pt-4">
            <button 
              @click="showSearchModal = false" 
              class="btn btn-outline"
            >
              取消
            </button>
            <button 
              @click="searchPapers" 
              class="btn btn-primary flex items-center"
            >
              <i class="fa fa-search mr-2"></i>开始检索
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 添加分类模态框 -->
    <div 
      v-if="showAddCategoryModal" 
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">添加自定义分类</h3>
          <button 
            @click="showAddCategoryModal = false" 
            class="text-gray-500 hover:text-gray-700"
          >
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1"
              >分类名称</label
            >
            <input
              type="text"
              v-model="newCategoryName"
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="输入分类名称"
            />
          </div>
          <div class="flex justify-end space-x-3 pt-2">
            <button 
              @click="showAddCategoryModal = false" 
              class="btn btn-outline"
            >
              取消
            </button>
            <button 
              @click="addNewCategory" 
              class="btn btn-primary"
            >
              添加
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 帮助模态框 -->
    <div 
      v-if="showHelpModal" 
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
    >
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">使用帮助</h3>
          <button 
            @click="showHelpModal = false" 
            class="text-gray-500 hover:text-gray-700"
          >
            <i class="fa fa-times"></i>
          </button>
        </div>
        <div class="space-y-4">
          <div>
            <h4 class="font-medium text-primary">基本操作</h4>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>勾选论文卡片左上角的复选框来选择论文</li>
              <li>使用顶部的"全选/取消全选"功能快速选择或取消所有论文</li>
              <li>点击论文标题可以展开或收起查看完整摘要</li>
              <li>点击"导出选中论文"按钮将选中的论文保存为Markdown文件</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-primary">筛选功能</h4>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>使用分类筛选可以按研究领域筛选论文</li>
              <li>使用时间范围筛选可以按发布日期筛选论文</li>
              <li>使用关键词搜索可以按标题或摘要中的关键词筛选论文</li>
              <li>点击"清除筛选"按钮可以重置所有筛选条件</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-primary">分类管理</h4>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>点击"添加自定义分类"可以创建新的分类标签</li>
              <li>为论文选择分类标签可以更好地组织和管理论文</li>
              <li>分类标签会显示该分类下的论文数量</li>
            </ul>
          </div>
          <div>
            <h4 class="font-medium text-primary">导出功能</h4>
            <ul class="list-disc pl-5 mt-2 space-y-1">
              <li>导出的Markdown文件包含选中论文的详细信息</li>
              <li>包括标题、作者、发布日期、摘要和链接</li>
              <li>导出的文件可以直接在Markdown编辑器中打开和编辑</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
// 注意：这里需要导入ArxivManager，但在Vue组件中通常通过import语句引入
// 由于这是一个独立的组件文件，我们假设ArxivManager可以通过其他方式引入
// 在实际项目中，您需要确保正确导入ArxivManager

export default {
  name: 'MainPage',
  data() {
    // 设置默认日期范围（最近7天）
    const today = new Date();
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(today.getDate() - 7);
    
    return {
      // 模态框状态
      showSearchModal: false,
      showAddCategoryModal: false,
      showHelpModal: false,
      
      // 筛选条件
      selectAll: false,
      currentCategoryFilter: null,
      startDate: oneWeekAgo.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      keywordSearch: '',
      sortBy: 'published-desc',
      
      // 检索参数
      researchDirection: '',
      searchStartDate: oneWeekAgo.toISOString().split('T')[0],
      searchEndDate: today.toISOString().split('T')[0],
      maxResults: 100,
      
      // 分类管理
      categories: [
        { id: "cat1", name: "对抗机器学习", count: 0 },
        { id: "cat2", name: "推荐系统", count: 0 },
        { id: "cat3", name: "多模态学习", count: 0 },
        { id: "cat4", name: "大语言模型", count: 0 },
      ],
      newCategoryName: '',
      
      // 论文数据
      papers: [],
      filteredPapers: [],
      selectedPapers: [],
      
      // 状态标记
      hasSearched: false,
      loadingMore: false,
      
      // 图表引用
      chart: null
    };
  },
  computed: {
    // 计算选中论文数量
    selectedCount() {
      return this.selectedPapers.length;
    }
  },
  watch: {
    // 监听筛选条件变化
    currentCategoryFilter() {
      this.applyFilters();
    },
    startDate() {
      this.applyFilters();
    },
    endDate() {
      this.applyFilters();
    },
    keywordSearch() {
      this.applyFilters();
    },
    sortBy() {
      this.applySorting();
      this.renderPapers();
    }
  },
  mounted() {
    // 初始化页面
    this.initializePage();
  },
  methods: {
    // 初始化页面
    initializePage() {
      // 设置默认日期范围
      const today = new Date();
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(today.getDate() - 7);

      this.startDate = oneWeekAgo.toISOString().split('T')[0];
      this.endDate = today.toISOString().split('T')[0];
      this.searchStartDate = oneWeekAgo.toISOString().split('T')[0];
      this.searchEndDate = today.toISOString().split('T')[0];

      // 渲染分类筛选
      this.renderCategories();
    },

    // 渲染分类筛选
    renderCategories() {
      // 在Vue中，我们通过数据绑定自动渲染，这里不需要额外操作
    },

    // 应用筛选条件
    applyFilters() {
      this.filteredPapers = [...this.papers];

      // 应用分类筛选
      if (this.currentCategoryFilter) {
        this.filteredPapers = this.filteredPapers.filter(
          (paper) =>
            paper.categories &&
            paper.categories.includes(this.currentCategoryFilter)
        );
      }

      // 应用时间范围筛选
      if (this.startDate) {
        this.filteredPapers = this.filteredPapers.filter(
          (paper) => paper.published >= this.startDate
        );
      }

      if (this.endDate) {
        this.filteredPapers = this.filteredPapers.filter(
          (paper) => paper.published <= this.endDate
        );
      }

      // 应用关键词筛选
      if (this.keywordSearch) {
        const keyword = this.keywordSearch.toLowerCase();
        this.filteredPapers = this.filteredPapers.filter(
          (paper) =>
            paper.title.zh.toLowerCase().includes(keyword) ||
            paper.abstract.zh.toLowerCase().includes(keyword) ||
            paper.title.en.toLowerCase().includes(keyword) ||
            paper.abstract.en.toLowerCase().includes(keyword)
        );
      }

      // 应用排序
      this.applySorting();

      // 更新统计信息
      this.updateStatistics();
    },

    // 应用排序
    applySorting() {
      switch (this.sortBy) {
        case "published-desc":
          this.filteredPapers.sort(
            (a, b) => new Date(b.published) - new Date(a.published)
          );
          break;
        case "published-asc":
          this.filteredPapers.sort(
            (a, b) => new Date(a.published) - new Date(b.published)
          );
          break;
        case "title-asc":
          this.filteredPapers.sort((a, b) =>
            a.title.zh.localeCompare(b.title.zh)
          );
          break;
        case "title-desc":
          this.filteredPapers.sort((a, b) =>
            b.title.zh.localeCompare(a.title.zh)
          );
          break;
      }
    },

    // 更新统计信息
    updateStatistics() {
      // 更新分类计数
      this.categories.forEach((category) => {
        category.count = this.filteredPapers.filter(
          (paper) =>
            paper.categories && paper.categories.includes(category.id)
        ).length;
      });

      // 更新全选复选框状态
      this.updateSelectAllStatus();
    },

    // 更新全选复选框状态
    updateSelectAllStatus() {
      if (this.filteredPapers.length === 0) {
        this.selectAll = false;
        return;
      }

      const allSelected = this.filteredPapers.every((paper) => paper.selected);
      const noneSelected = this.filteredPapers.every((paper) => !paper.selected);

      if (allSelected) {
        this.selectAll = true;
      } else if (noneSelected) {
        this.selectAll = false;
      } else {
        // 在Vue中，我们使用计算属性或方法来处理不确定状态
        // 这里简化处理，设置为false
        this.selectAll = false;
      }
    },

    // 切换全选/取消全选
    toggleSelectAll() {
      const isChecked = this.selectAll;

      this.filteredPapers.forEach((paper) => {
        this.togglePaperSelection(paper.id, isChecked);
      });
    },

    // 切换论文选择状态
    togglePaperSelection(paperId, isSelected) {
      // 更新论文数据
      const paperIndex = this.papers.findIndex((p) => p.id === paperId);
      if (paperIndex !== -1) {
        this.papers[paperIndex].selected = isSelected;
      }

      const filteredIndex = this.filteredPapers.findIndex(
        (p) => p.id === paperId
      );
      if (filteredIndex !== -1) {
        this.filteredPapers[filteredIndex].selected = isSelected;
      }

      // 更新选中论文列表
      if (isSelected) {
        if (!this.selectedPapers.includes(paperId)) {
          this.selectedPapers.push(paperId);
        }
      } else {
        this.selectedPapers = this.selectedPapers.filter((id) => id !== paperId);
      }

      // 更新统计信息
      this.updateStatistics();
    },

    // 切换论文摘要显示状态
    togglePaperAbstract(paperId) {
      const paper = this.filteredPapers.find(p => p.id === paperId);
      if (paper) {
        paper.showFullAbstract = !paper.showFullAbstract;
      }
    },

    // 为论文分配分类
    assignCategoryToPaper(paperId, categoryId) {
      // 更新论文数据
      const paperIndex = this.papers.findIndex((p) => p.id === paperId);
      if (paperIndex !== -1) {
        if (!this.papers[paperIndex].categories) {
          this.papers[paperIndex].categories = [];
        }

        // 如果选择了分类，则添加；否则清除
        if (categoryId) {
          if (!this.papers[paperIndex].categories.includes(categoryId)) {
            this.papers[paperIndex].categories.push(categoryId);
          }
        } else {
          this.papers[paperIndex].categories = [];
        }
      }

      const filteredIndex = this.filteredPapers.findIndex(
        (p) => p.id === paperId
      );
      if (filteredIndex !== -1) {
        if (!this.filteredPapers[filteredIndex].categories) {
          this.filteredPapers[filteredIndex].categories = [];
        }

        if (categoryId) {
          if (
            !this.filteredPapers[filteredIndex].categories.includes(categoryId)
          ) {
            this.filteredPapers[filteredIndex].categories.push(categoryId);
          }
        } else {
          this.filteredPapers[filteredIndex].categories = [];
        }
      }

      // 更新统计信息
      this.updateStatistics();
      
      // 隐藏分类选择框
      const paper = this.filteredPapers.find(p => p.id === paperId);
      if (paper) {
        paper.showCategorySelect = false;
      }
    },

    // 添加新分类
    addNewCategory() {
      if (!this.newCategoryName || this.newCategoryName.trim() === "") {
        alert("请输入分类名称");
        return;
      }

      // 检查分类是否已存在
      const existingCategory = this.categories.find((cat) => cat.name === this.newCategoryName);
      if (existingCategory) {
        alert("该分类已存在");
        return;
      }

      // 创建新分类
      const newCategory = {
        id: `cat${this.categories.length + 1}`,
        name: this.newCategoryName,
        count: 0,
      };

      // 添加到分类列表
      this.categories.push(newCategory);

      // 清空输入框
      this.newCategoryName = '';

      // 关闭模态框
      this.showAddCategoryModal = false;
    },

    // 清除筛选
    clearFilters() {
      // 重置筛选条件
      this.currentCategoryFilter = null;
      this.keywordSearch = '';
      this.startDate = '';
      this.endDate = '';

      // 应用筛选
      this.applyFilters();
    },

    // 检索论文
    async searchPapers() {
      try {
        // 验证参数
        if (!this.researchDirection) {
          alert("请选择研究方向");
          return;
        }

        if (!this.searchStartDate || !this.searchEndDate) {
          alert("请选择时间范围");
          return;
        }

        if (new Date(this.searchStartDate) > new Date(this.searchEndDate)) {
          alert("开始日期不能晚于结束日期");
          return;
        }

        // 关闭模态框
        this.showSearchModal = false;
        this.hasSearched = true;

        // 显示加载状态
        // 在实际实现中，这里会调用API获取数据
        // 这里使用模拟数据
        this.papers = this.getMockPapers();
        this.filteredPapers = [...this.papers];
        this.selectedPapers = [];

        // 应用筛选
        this.applyFilters();

        // 初始化图表
        this.initializeChart();

      } catch (error) {
        alert(`检索失败: ${error.message}`);
        console.error("检索论文失败:", error);
      }
    },

    // 导出选中的论文为Markdown
    exportSelectedPapers() {
      try {
        // 在实际实现中，这里会调用ArxivManager的方法
        // 这里简化处理，直接生成Markdown内容
        let markdownContent = "# 选中的arXiv论文\n\n";
        
        this.selectedPapers.forEach(paperId => {
          const paper = this.papers.find(p => p.id === paperId);
          if (paper) {
            markdownContent += `## ${paper.title.zh}\n\n`;
            markdownContent += `**作者**: ${paper.authors.join(', ')}\n\n`;
            markdownContent += `**发布日期**: ${this.formatDate(paper.published)}\n\n`;
            markdownContent += `**摘要**: ${paper.abstract.zh}\n\n`;
            markdownContent += `[查看原文](${paper.url}) | [下载PDF](${paper.pdfUrl})\n\n`;
            markdownContent += "---\n\n";
          }
        });

        // 创建下载链接
        const blob = new Blob([markdownContent], { type: "text/markdown" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        // 获取当前日期作为文件名
        const today = new Date();
        const formattedDate = today.toISOString().split("T")[0];

        // 设置文件名
        a.download = `${formattedDate}-selected-papers.md`;
        a.href = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // 显示成功提示
        alert("论文导出成功！");
      } catch (error) {
        alert(`导出失败: ${error.message}`);
        console.error("导出论文失败:", error);
      }
    },

    // 删除论文
    deletePaper(paperId) {
      try {
        if (confirm("确定要删除这篇论文吗？此操作不可撤销。")) {
          // 更新本地数据
          this.papers = this.papers.filter(p => p.id !== paperId);
          this.filteredPapers = this.filteredPapers.filter(p => p.id !== paperId);
          this.selectedPapers = this.selectedPapers.filter(id => id !== paperId);

          // 更新统计信息
          this.updateStatistics();

          return true;
        }
      } catch (error) {
        alert(`删除失败: ${error.message}`);
        console.error("删除论文失败:", error);
      }

      return false;
    },

    // 加载更多
    loadMore() {
      this.loadingMore = true;

      // 模拟加载更多
      setTimeout(() => {
        // 在实际实现中，这里会加载更多数据
        this.loadingMore = false;
      }, 1500);
    },

    // 初始化图表
    initializeChart() {
      // 在实际实现中，这里会使用Chart.js初始化图表
      // 这里简化处理
      if (this.$refs.papersChart) {
        const ctx = null;
                // 图表初始化代码
        const dateCounts = {};
        this.papers.forEach((paper) => {
          const date = paper.published.split("T")[0];
          dateCounts[date] = (dateCounts[date] || 0) + 1;
        });

        const labels = Object.keys(dateCounts).sort();
        const data = labels.map((date) => dateCounts[date]);

        // 如果已有图表实例，先销毁
        if (this.chart) {
          this.chart.destroy();
        }

        // 创建新图表
        this.chart = new Chart(ctx, {
          type: "bar",
          data: {
            labels: labels,
            datasets: [
              {
                label: "论文数量",
                data: data,
                backgroundColor: "#3b82f6",
                borderColor: "#2563eb",
                borderWidth: 1,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                },
              },
            },
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  title: function (tooltipItems) {
                    const date = new Date(tooltipItems[0].label);
                    return date.toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    });
                  },
                },
              },
            },
          },
        });
      }
    },

    // 格式化日期
    formatDate(dateString) {
      return new Date(dateString).toLocaleDateString("zh-CN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    // 获取模拟论文数据（用于演示）
    getMockPapers() {
      return [
        {
          id: "1",
          title: {
            zh: "基于深度学习的图像分类方法研究",
            en: "Research on Image Classification Methods Based on Deep Learning"
          },
          authors: ["张三", "李四", "王五"],
          abstract: {
            zh: "本文提出了一种基于深度学习的图像分类方法，该方法在多个数据集上取得了优异的表现。我们通过引入注意力机制和多尺度特征融合，显著提升了分类准确率。",
            en: "This paper proposes an image classification method based on deep learning, which achieves excellent performance on multiple datasets. By introducing attention mechanisms and multi-scale feature fusion, we significantly improve classification accuracy."
          },
          published: "2024-01-15T00:00:00Z",
          url: "https://arxiv.org/abs/2401.12345",
          pdfUrl: "https://arxiv.org/pdf/2401.12345.pdf",
          selected: false,
          showFullAbstract: false,
          showCategorySelect: false,
          selectedCategory: "",
          categories: ["cat1"]
        },
        {
          id: "2",
          title: {
            zh: "推荐系统中的对抗性攻击与防御",
            en: "Adversarial Attacks and Defenses in Recommendation Systems"
          },
          authors: ["赵六", "钱七"],
          abstract: {
            zh: "本文研究了推荐系统中的对抗性攻击问题，并提出了一种基于对抗训练的防御方法。实验结果表明，该方法能有效提升推荐系统的鲁棒性。",
            en: "This paper studies the problem of adversarial attacks in recommendation systems and proposes a defense method based on adversarial training. Experimental results show that this method can effectively improve the robustness of recommendation systems."
          },
          published: "2024-01-10T00:00:00Z",
          url: "https://arxiv.org/abs/2401.12346",
          pdfUrl: "https://arxiv.org/pdf/2401.12346.pdf",
          selected: false,
          showFullAbstract: false,
          showCategorySelect: false,
          selectedCategory: "",
          categories: ["cat2"]
        },
        {
          id: "3",
          title: {
            zh: "多模态学习在视觉问答中的应用",
            en: "Application of Multimodal Learning in Visual Question Answering"
          },
          authors: ["孙八", "周九", "吴十"],
          abstract: {
            zh: "本文探讨了多模态学习在视觉问答任务中的应用，提出了一种新的跨模态注意力机制，能够更好地融合视觉和文本信息。",
            en: "This paper explores the application of multimodal learning in visual question answering tasks, proposing a new cross-modal attention mechanism that can better integrate visual and textual information."
          },
          published: "2024-01-05T00:00:00Z",
          url: "https://arxiv.org/abs/2401.12347",
          pdfUrl: "https://arxiv.org/pdf/2401.12347.pdf",
          selected: false,
          showFullAbstract: false,
          showCategorySelect: false,
          selectedCategory: "",
          categories: ["cat3"]
        },
        {
          id: "4",
          title: {
            zh: "大语言模型在文本生成中的优化策略",
            en: "Optimization Strategies for Large Language Models in Text Generation"
          },
          authors: ["郑十一", "王十二"],
          abstract: {
            zh: "本文研究了大语言模型在文本生成任务中的优化策略，包括参数效率训练、推理加速等技术，显著提升了模型性能。",
            en: "This paper studies optimization strategies for large language models in text generation tasks, including parameter-efficient training and inference acceleration techniques, significantly improving model performance."
          },
          published: "2024-01-01T00:00:00Z",
          url: "https://arxiv.org/abs/2401.12348",
          pdfUrl: "https://arxiv.org/pdf/2401.12348.pdf",
          selected: false,
          showFullAbstract: false,
          showCategorySelect: false,
          selectedCategory: "",
          categories: ["cat4"]
        }
      ];
    }
  }
};
</script>

<style scoped>
/* 导入外部CSS */
@import url('https://cdn.tailwindcss.com');
@import url('https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css');

/* Tailwind 配置 */

/* 注意：在Vue单文件组件中，我们通常使用scoped样式 */
/* 但由于需要覆盖Tailwind配置，这里使用全局样式 */

/* 自定义工具类 */
.content-auto {
  content-visibility: auto;
}
.transition-all-300 {
  transition: all 0.3s ease;
}
.paper-card {
  @apply bg-white rounded-lg shadow-card p-4 mb-4 hover:shadow-card-hover transition-all-300 border border-gray-100 relative;
}
.paper-card.selected {
  @apply border-success bg-green-50;
}
/* 添加勾选标记 */
.paper-card.selected::after {
  content: "✓";
  position: absolute;
  top: 12px;
  right: 12px;
  width: 20px;
  height: 20px;
  background: #10b981;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
}
.btn {
  @apply px-4 py-2 rounded-md font-medium transition-all-300 focus:outline-none focus:ring-2 focus:ring-offset-2;
}
.btn-primary {
  @apply bg-primary text-white hover:bg-primary/90 focus:ring-primary/50;
}
.btn-secondary {
  @apply bg-secondary text-gray-700 hover:bg-secondary/90 focus:ring-gray-500/50;
}
.btn-success {
  @apply bg-success text-white hover:bg-success/90 focus:ring-success/50;
}
.btn-outline {
  @apply border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500/50;
}
.checkbox-lg {
  @apply w-5 h-5 text-primary focus:ring-primary/50;
}
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}
.badge-blue {
  @apply bg-blue-100 text-blue-800;
}
.badge-green {
  @apply bg-green-100 text-green-800;
}
.badge-purple {
  @apply bg-purple-100 text-purple-800;
}
.badge-yellow {
  @apply bg-yellow-100 text-yellow-800;
}
.badge-primary {
  @apply bg-primary text-white;
}

/* 文本截断 */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 隐藏类 */
.hidden {
  display: none;
}
</style>