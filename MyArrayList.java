class MyArrayList {

	// 列表数组
	int[] elementData;

	// 列表中的元素个数
	int size;

	// 构造函数

	// 默认构造函数，构造一个容量为10的空列表
	MyArrayList() {
		this.size = 0;
		this.elementData = new int[10];
	}

	// 构造一个指定初始容量的空列表
	MyArrayList(int initialCapacity) {
		this.size = 0;
		if (initialCapacity < 0) {
			this.elementData = null;
		} else {
			this.elementData = new int[initialCapacity];
		}
	}

	// 存储

	// 用指定元素替代此列表中指定位置上的元素，并返回以前位于该位置上的元素
	int set(int index, int element) {
		if (RangeCheck(index)) {
			int oldValue = this.elementData[index];
			this.elementData[index] = element;
			return oldValue;
		}
		return 0;
	}

	// 将指定元素添加到此列表的尾部
	boolean add(int element) {
		ensureCapacity(this.size + 1);
		this.elementData[this.size++] = element;
		return true;
	}

	// 将指定元素插入此列表中的指定位置。
	// 如果当前位置有元素，则向右移动位于当前位置的元素以及所有后续元素（将其索引+1）
	boolean add(int index, int element) {
		if (index > this.size || index < 0) {
			return false;
		} else {
			ensureCapacity(++this.size);
			for (int i = this.size - 1; i > index; i--) {
				this.elementData[i] = this.elementData[i - 1];
			}
			this.elementData[index] = element;
			return true;
		}
	}

	// 读取

	// 返回此列表中指定位置上的元素
	int get(int index) {
		if (RangeCheck(index)) {
			return this.elementData[index];
		}
		return 0;
	}

	// 删除

	// 移除此列表中指定位置上的元素
	int remove(int index) {
		if (RangeCheck(index)) {
			int oldValue = this.elementData[index];
			for (int i = index; i < this.size - 1; i++) {
				this.elementData[i] = this.elementData[i + 1];
			}
			this.elementData[--this.size] = 0;
			return oldValue;
		}
		return 0;
	}

	// 辅助函数

	// 检测下标是否越界
	boolean RangeCheck(int index) {
		if (index >= this.size) {
			return false;
		} else {
			return true;
		}
	}

	// 调整数组容量
	// 若minCapacity大于原来容量，则将容量调整为(oldCapacity * 3) / 2 + 1
	// 若minCapacity仍然大于增加后的容量，则使用minCapacity作为新容量
	// 若minCapacity不大于增加后的容量，则使用增加后的容量
	void ensureCapacity(int minCapacity) {
		int oldCapacity = this.elementData.length;
		if (minCapacity > oldCapacity) {
			int oldData[] = this.elementData;
			int newCapacity = (oldCapacity * 3) / 2 + 1;
			if (minCapacity > newCapacity) {
				newCapacity = minCapacity;
			}
			this.elementData = newCopyArray(oldData, newCapacity);

		}
	}

	// 新建一个容量为capacity的数组，并将一个数组的内容复制其中.
	int[] newCopyArray(int[] list, int capacity) {
		int[] newList = new int[capacity];
		for (int i = 0; i < list.length && i < capacity; i++) {
			newList[i] = list[i];
		}
		return newList;
	}

	// 用于测试的main函数
	public static void main(String[] args) {
		
		// initial test
		MyArrayList list1 = new MyArrayList();
		MyArrayList list2 = new MyArrayList(5);
		
		// add test
		for (int i = 1; i <= 5; i++) {
			list1.add(-i);
			list2.add(i);
		}
		for (int i = 0; i < 5; i++) {
			list2.add(0, -1);
		}
		
		// get & set test
		for(int i = 0; i < 5; i++) {
			int x = list1.get(i);
			list2.set(i, x);
		}
		
		// remove test
		for(int i = 0; i < 5; i++) {
			list2.remove(0);
		}
	}

}
