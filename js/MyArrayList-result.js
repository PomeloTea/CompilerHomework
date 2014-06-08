var MyArrayList = class_(function(){

	this.elementData = [];

	this.size;

	MyArrayList._(function() {
		this.size = 0;
		this.elementData = new Array(10);
	});

	MyArrayList._(Integer, function(initialCapacity) {
		this.size = 0;
		if(initialCapacity < 0) {
			this.elementData = null;
		} else {
			this.elementData = new Array(initialCapacity);
		}
	});

	this.set = function(index, element) {
		if(this.RangeCheck(index)) {
			var oldValue = parseInt(this.elementData[index]);
			this.elementData[index] = element;
			return oldValue;
		}
		return 0;
	};

	this.add = FunctionH.overload({
		'number': function() {
			this.ensureCapacity(this.size+1);
			this.elementData[this.size++] = arguments[0];
			return true;
		},
		'number,number': function() {
			if(arguments[0] > this.size || arguments[0] < 0) {
				return false;
			} else {
				this.ensureCapacity(++this.size);
				for(var i = parseInt(this.size-1); i > arguments[0]; i--) {
					this.elementData[i] = this.elementData[i-1];
				}
				this.elementData[arguments[0]] = arguments[1];
				return true;
			}
		}
	});

	this.get = function(index) {
		if(this.RangeCheck(index)) {
			return this.elementData[index];
		}
		return 0;
	};

	this.remove = function(index) {
		if(this.RangeCheck(index)) {
			var oldValue = parseInt(this.elementData[index]);
			for(var i = parseInt(index); i < this.size-1; i++) {
				this.elementData[i] = this.elementData[i+1];
			}
			this.elementData[--this.size] = 0;
			return oldValue;
		}
		return 0;
	};

	this.RangeCheck = function(index) {
		if(index >= this.size) {
			return false;
		} else {
			return true;
		}
	};

	this.ensureCapacity = function(minCapacity) {
		var oldCapacity = parseInt(this.elementData.length);
		if(minCapacity > oldCapacity) {
			var oldData = this.elementData;
			var newCapacity = parseInt((oldCapacity*3)/2+1);
			if(minCapacity > newCapacity) {
				newCapacity = minCapacity;
			}
			this.elementData = this.newCopyArray(oldData, newCapacity);
		}
	};

	this.newCopyArray = function(list, capacity) {
		var newList = new Array(capacity);
		for(var i = parseInt(0); i < list.length && i < capacity; i++) {
			newList[i] = list[i];
		}
		return newList;
	};

});

function main(args) {
	var list1 = new MyArrayList();
	var list2 = new MyArrayList(5);
	for(var i = parseInt(1); i <= 5; i++) {
		list1.add(-i);
		list2.add(i);
	}
	for(var i = parseInt(0); i < 5; i++) {
		list2.add(0, -1);
	}
	for(var i = parseInt(0); i < 5; i++) {
		var x = parseInt(list1.get(i));
		list2.set(i, x);
	}
	for(var i = parseInt(0); i < 5; i++) {
		list2.remove(0);
	}
}

main();