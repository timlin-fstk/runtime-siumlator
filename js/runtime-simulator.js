


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


class RuntimeSimulator {
  
  constructor() {

  	this.runtimeQueNumber = 5
  	
  	// Queue Task Array
  	this.queue = []
  	this.bindEvent()

  	// Runtime Task Array
  	this.runtime1 = []
  	this.runtime2 = []


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

		this.registerRuntimePushEvent(this.runtime1, 1);
		this.registerRuntimePushEvent(this.runtime2, 2);

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
	    callback(arr);
	  };
  }

  eventifyArrayPop(arr, callback) {
  	arr.pop = function(e) {
	      Array.prototype.pop.call(arr, e);
	      callback(arr);
	  };
  }

  registerQueuePushEvent(arr) {
  	var self = this
  	this.eventifyArrayPush(arr, function(arr){
  		console.log('[Queue Push]')
			console.log("Item added to queue, current lenth = " + arr.length);
			console.log(arr)
			//先檢查 Node 1/2 Runtime 有沒有空
			if (self.runtime1.length < self.runtimeQueNumber && self.runtime2.length < self.runtimeQueNumber) {
				console.log('兩邊 Runtime 都有位子');
				var targetRuntime = getRandomItemFromArray([self.runtime1, self.runtime2])
				targetRuntime.push(arr.shift())
			} else if (self.runtime1.length < self.runtimeQueNumber) {
				console.log('Runtime1 有位子');
				self.runtime1.push(arr.shift());
			} else if (self.runtime2.length < self.runtimeQueNumber) {
				console.log('Runtime2 有位子');
				self.runtime2.push(arr.shift());
			} else {
				// 需要放 queue 了
				var template = $('#queue-item').html();
				var randomTaskId = arr[arr.length - 1]['id']
				var taskType = arr[arr.length - 1]['taskType']
	  		var rendered = Mustache.render(template, {
	  			id: randomTaskId + '-queue',
	  			taskname: randomTaskId,
	  			type: taskType,
	  		});
	  		$('.queue-area').append(rendered)

			}
  	})
  }

   registerQueuePopEvent(arr) {
  	var self = this;
  	this.eventifyArrayPop(arr, function(){
  		console.log('[Queue Pop]')
  	})
  }

  registerRuntimePushEvent(arr, runtimeNum) {
  	var self = this;
  	this.eventifyArrayPush(arr, function(arr){
  		console.log('[Runtime Push]')
			console.log("Item added to runtime" + runtimeNum + ", current lenth = " + arr.length);
			console.log(arr)
			var className = 'runtime' + runtimeNum
			var remainTime = 5
			var randomTaskId = arr[arr.length - 1]['id']
			var taskType = arr[arr.length - 1]['taskType']
			//var randomTaskId = arr[0]['id']
			console.log('taskid in push event = ' + randomTaskId);
			// Queue 的 Item (UI) 刪掉
			$('#'+randomTaskId+'-queue').remove()
			var template = $('#task-item').html();
			var rendered = Mustache.render(template, {
	  			id: randomTaskId,
	  			remain: remainTime,
	  			type: taskType
	  		});
			$('.'+className).append(rendered)
			var timer = new Timer(randomTaskId, remainTime, className)
  	})

  }

  registerRuntimePopEvent(arr, runtimeNum) {
  	var self = this
  	this.eventifyArrayPop(arr, function(){
  		console.log('[Runtime Pop]')
			console.log("Item removed from runtime" + runtimeNum + ", current lenth = " + arr.length);
			// 要 再先檢查 Queue 有沒有東西, 有的話再看 Node 1/2 Runtime 有沒有空有空的話就要從 Queue 再拿東西過來
			if (self.queue.length > 0) {
				if (self.runtime1.length < self.runtimeQueNumber && self.runtime2.length < self.runtimeQueNumber) {
					console.log("兩邊都有空位, 消化queue")
					// 兩邊都有位子, 隨機丟
					var targetRuntime = getRandomItemFromArray([self.runtime1, self.runtime2])
					targetRuntime.push(self.queue.shift())

				} else if (self.runtime1.length < self.runtimeQueNumber) {
					console.log("Runtime1 有位子, 消化queue")
					self.runtime1.push(self.queue.shift())
				} else {
					console.log("Runtime2 有位子, 消化queue")
					self.runtime2.push(self.queue.shift())
				}
			} else {
				console.log('[Nothing in Queue]')
			}

  	})

  }


  bindEvent() {
  	var self = this;
  	console.log("Let's Bind!!!")
  	$(".add-priority-task").on('click', function(){
  		var data = $(this).data('tasktype')
  		// TODO: 結構資料是啥
  		var randomTaskId = makeid(5)
  		self.queue.push({
  			id:randomTaskId,
  			taskType: 'a'
  		})
  		//{id:randomTaskId}
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
				window.RS[self.className].pop()
				clearInterval(intervalID)
				console.log("砍掉 Interval");
			} else {
				console.log("剩下 " + self.remainTime + " 秒..")
				self.remainTime = self.remainTime - 1;
				console.log('taskid in Timer = ' + self.divId);
				console.log($('#'+self.divId).find('.counter'));
				$('#'+self.divId).find('.counter').text('(' + self.remainTime + ')')
			}
		}, 1000, 'Parameter 1', 'Parameter 2');
	}
}




























