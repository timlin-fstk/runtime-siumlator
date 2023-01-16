


function getRandomItemFromArray(arr) {
	return arr[Math.floor(Math.random()*arr.length)];
}

function makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

class Runtime {

	constructor(name, cpu, workerNumber) {

		this.name = name
		this.cpu = cpu || 1000
		this.workerNumber = workerNumber || 5
		this.taskList = []
		this.taskSlot1 = null
		this.taskSlot2 = null

		//TODO: Draw runtime slot

		console.log('New Runtime Created, name = ' + this.name + ' cpu = ' + this.cpu + ' workers = ' + this.workerNumber)
	}

	// Return available worker slot
	getAvailableWorker() {
		//return (this.workerNumber - this.taskList.length);

		for (var i = 1; i < 6 ; i++) {
			var slot = 'taskSlot' + i
			if (this[slot] == null) {
				return 1
			}
		}

		return 0

	}


	addTask(item) {
		//this.taskList.push(item);
		console.log('[Runtime Push]')
		console.log("Item added to runtime: " + this.name);
		//console.log(this.taskList);
		
		//var load = item['load']
		//var result = this.calculateExecutionTime(load)


		var runtimeClassName = this.name
		var remainTime = 5
		var randomTaskId = item['id']
		var taskType = item['taskType']
		console.log('taskid in push event = ' + randomTaskId);
		// Queue 的 Item (UI) 刪掉
		$('#'+randomTaskId+'-queue').remove()
		var template = $('#task-item').html();
		var rendered = Mustache.render(template, {
  			id: randomTaskId,
  			remain: remainTime,
  			type: taskType
  		});

		for (var i = 1; i < 6 ; i++) {
			var selector = '.' + this.name + ' > ' + '.slot' + i
			var slot = 'taskSlot' + i
			console.log('in for loop')
			console.log(selector);
			console.log(slot);
			if (this[slot] == null) {
				$(selector).html(rendered)
				this[slot] = item;
				break;
			} 
		}
		
		//console.log(selector);
		//$(selector).html(rendered)
		var timer = new Timer(randomTaskId, remainTime, runtimeClassName)

	}

	/**
	 *  核心計算執行時間的 function , 計算方式：
	 *  每個 worker 有 default 的運算速度, 運算速度 = cpu / worker 數量 
	 *  example: 1000 / 5 = 200 (每秒)
	 *  如果有一個 load = 1000 的 task 進來, 會需要 1000 / 200 = 5 秒處理時間
	 * 
	 *  如果 worker 數量減少, 運算速度會增加
	 *  example: 1000 / 2 = 500 (每秒)
	 *  同樣一個 load = 1000 的 task 進來 , 會需要 1000 / 500 = 2 秒
	 */
	calculateExecutionTime(taskLoad) {
		
	}


	removeLastTask(id) {
		console.log('[Remove Item from Runtime]')
		console.log(id);
		//console.log("Item removed from runtime: " + this.name);
		//var p = this.taskList.pop()
		for (var i = 1; i < 6; i++) {
			var slot = 'taskSlot' + i
				if (this[slot]) {
					if (this[slot]['id'] == id) {
					console.log('Remove Task with ID = ' + this[slot]['id']);
					this[slot] = null;
					break;
				}
			}
		}

		//console.log(p['id'] + ' removed from ' + this.name)
	}

}

/**
 * 
 *  
 */
class RuntimeSimulator {
  
  constructor() {

  	this.runtimeQueNumber = 5
  	
  	// Queue Task Array
  	this.queue = []
  	this.bindEvent()

  	// Runtime Task Array
  	this.runtime1 = new Runtime('runtime1')
  	this.runtime2 = new Runtime('runtime2')


  	// // Eventify Array
  	// eventify = function(arr, callback) {
		//     arr.push = function(e) {
		//         Array.prototype.push.call(arr, e);
		//         callback(arr);
		//     };
		// };

		// register queue array callback on push
		this.registerQueuePushEvent(this.queue);
		this.registerQueuePopEvent(this.queue);

		//this.registerRuntimePushEvent(this.runtime1, 1);
		//this.registerRuntimePushEvent(this.runtime2, 2);

		this.registerRuntimePopEvent(this.runtime1, 1);
		this.registerRuntimePopEvent(this.runtime2, 2);


		// register runtime array callback on push
		// eventify(this.queue, function(arr){
		// 	console.log("Damn I know you are pushing")
		// })

  }

  eventifyArrayPush(arr, callback) {
  	arr.push = function(e) {
  		Array.prototype.push.call(arr, e);
	    callback(arr, e);
	  };
  }

  eventifyArrayPop(arr, callback) {
  	arr.pop = function(e) {
	      Array.prototype.pop.call(arr, e);
	      callback(arr, e);
	  };
  }

  removeTaskFromRuntime(runtime, elementId) {
  	this[runtime].removeLastTask(elementId)

  	// 要 再先檢查 Queue 有沒有東西, 有的話再看 Node 1/2 Runtime 有沒有空有空的話就要從 Queue 再拿東西過來
		if (this.queue.length > 0) {

			this.runtime1.addTask(this.queue.shift())


			// console.log("Queue 還有" + this.queue.length + '筆 task');
			// if (this.runtime1.getAvailableWorker() > 0 && this.runtime2.getAvailableWorker() > 0) {
			// 	console.log("兩邊都有空位, 消化queue")
			// 	// 兩邊都有位子, 隨機丟
			// 	var targetRuntime = getRandomItemFromArray([this.runtime1, this.runtime2])
			// 	targetRuntime.addTask(this.queue.shift())

			// } else if (this.runtime1.getAvailableWorker() > 0) {
			// 	console.log("Runtime1 有位子, 消化queue")
			// 	this.runtime1.addTask(this.queue.shift())
			// } else {
			// 	console.log("Runtime2 有位子, 消化queue")
			// 	this.runtime2.addTask(this.queue.shift())
			// }
		} else {
			console.log('[Nothing in Queue]')
		}
  }

  registerQueuePushEvent(arr) {
  	var self = this
  	this.eventifyArrayPush(arr, function(arr, ele){
  		console.log('[Queue Push]')
			console.log("Item added to queue = ");
			console.log(ele);


			if (self.runtime1.getAvailableWorker() > 0 ) {
				console.log('Runtime1 有位子');
				self.queue.pop()
				self.runtime1.addTask(ele)
			} else {
				console.log('Runtime 滿了');
				var template = $('#queue-item').html();
				var randomTaskId = ele['id']
				var taskType = ele['taskType']
				var load = ele['load']
	  		var rendered = Mustache.render(template, {
	  			id: randomTaskId + '-queue',
	  			taskname: randomTaskId,
	  			type: taskType,
	  			load: load
	  		});
	  		$('.queue-area').append(rendered)
			}




			//先檢查 Node 1/2 Runtime 有沒有空
			// if (self.runtime1.getAvailableWorker() > 0 && self.runtime2.getAvailableWorker() > 0) {
			// 	console.log('兩邊 Runtime 都有位子');
			// 	var targetRuntime = getRandomItemFromArray([self.runtime1, self.runtime2])
			// 	self.queue.pop()
			// 	targetRuntime.addTask(ele)
			// } else if (self.runtime1.getAvailableWorker() > 0) {
			// 	console.log('Runtime1 有位子');
			// 	self.queue.pop()
			// 	self.runtime1.addTask(ele);
			// } else if (self.runtime2.getAvailableWorker() > 0) {
			// 	console.log('Runtime2 有位子');
			// 	self.queue.pop()
			// 	self.runtime2.addTask(ele);
			// } else {
			// 	console.log('Runtime 滿了');
			// 	var template = $('#queue-item').html();
			// 	var randomTaskId = ele['id']
			// 	var taskType = ele['taskType']
			// 	var load = ele['load']
	  	// 	var rendered = Mustache.render(template, {
	  	// 		id: randomTaskId + '-queue',
	  	// 		taskname: randomTaskId,
	  	// 		type: taskType,
	  	// 		load: load
	  	// 	});
	  	// 	$('.queue-area').append(rendered)
			// }
  	})
  }

   registerQueuePopEvent(arr) {
  	var self = this;
  	this.eventifyArrayPop(arr, function(){
  		console.log('[Queue Pop]')
  	})
  }

  registerRuntimePushEvent(arr, runtimeNum) {
  	// var self = this;
  	// this.eventifyArrayPush(arr, function(arr){
  	// 	console.log('[Runtime Push]')
		// 	console.log("Item added to runtime" + runtimeNum + ", current lenth = " + arr.length);
		// 	console.log(arr)
		// 	var className = 'runtime' + runtimeNum
		// 	var remainTime = 5
		// 	var randomTaskId = arr[arr.length - 1]['id']
		// 	var taskType = arr[arr.length - 1]['taskType']
		// 	//var randomTaskId = arr[0]['id']
		// 	console.log('taskid in push event = ' + randomTaskId);
		// 	// Queue 的 Item (UI) 刪掉
		// 	$('#'+randomTaskId+'-queue').remove()
		// 	var template = $('#task-item').html();
		// 	var rendered = Mustache.render(template, {
	  // 			id: randomTaskId,
	  // 			remain: remainTime,
	  // 			type: taskType
	  // 		});
		// 	$('.'+className).append(rendered)
		// 	var timer = new Timer(randomTaskId, remainTime, className)
  	// })

  }

  registerRuntimePopEvent(arr, runtimeNum) {
  	var self = this
  	this.eventifyArrayPop(arr, function(){
			// // 要 再先檢查 Queue 有沒有東西, 有的話再看 Node 1/2 Runtime 有沒有空有空的話就要從 Queue 再拿東西過來
			// if (self.queue.length > 0) {
			// 	if (self.runtime1.length < self.runtimeQueNumber && self.runtime2.length < self.runtimeQueNumber) {
			// 		console.log("兩邊都有空位, 消化queue")
			// 		// 兩邊都有位子, 隨機丟
			// 		var targetRuntime = getRandomItemFromArray([self.runtime1, self.runtime2])
			// 		targetRuntime.push(self.queue.shift())

			// 	} else if (self.runtime1.length < self.runtimeQueNumber) {
			// 		console.log("Runtime1 有位子, 消化queue")
			// 		self.runtime1.push(self.queue.shift())
			// 	} else {
			// 		console.log("Runtime2 有位子, 消化queue")
			// 		self.runtime2.push(self.queue.shift())
			// 	}
			// } else {
			// 	console.log('[Nothing in Queue]')
			// }

  	})

  }


  bindEvent() {
  	var self = this;
  	console.log("Let's Bind!!!")
  	$(".add-normal-task").on('click', function(){
  		var taskType = $(this).data('tasktype')
  		var load = $(this).data('load')
  		var randomTaskId = makeid(5)

  		self.queue.push({
  			id:randomTaskId,
  			taskType: taskType,
  			load: load
  		})
  	})

  }

}


class Timer {
	constructor(taskId, sec, className) {
		this.remainTime = sec
		this.divId = taskId
		this.className = className
		this.start()
	}

	start() {
		var self = this
		const intervalID = setInterval(function(){
			if (self.remainTime == 0) {
				$('#'+self.divId).remove()
				// 這邊操作 RS 就好
				//window.RS[self.className].pop()
				window.RS.removeTaskFromRuntime(self.className, self.divId)
				clearInterval(intervalID)
			} else {
				//console.log("剩下 " + self.remainTime + " 秒..")
				self.remainTime = self.remainTime - 1;
				//console.log('taskid in Timer = ' + self.divId);
				$('#'+self.divId).find('.counter').text('(' + self.remainTime + ')')
			}
		}, 1000, 'Parameter 1', 'Parameter 2');
	}
}




























