/**
 * 튜토리얼
 *   ]# npm init
 *   	=> 항목에 맞는 것 기술
 *   ]# npm i --save socket.io express
 *   
 *   실행 : ]# npm run start
 *   
 * 
 * 파일 구조
 * 	client.html : 
 * 	server.js : 서버
 */



var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get("/",function(req, res){
	res.sendfile("client.html");
});

var count=1;
io.sockets.on('connection', function(socket){
	console.log('user connected: ', socket.id);
	var name = "user" + count++;
	var room_id;
	
	io.to(socket.id).emit('change name',name);
	
	/**
	* 이게 맞나....
	* 
	* 특정 클라이언트에게 보내기
	* 	io.to(socket.id).emit('change name',name);
	* 
	* 
	* 전체 보내기(브로드케스트)
	* 	io.emit('receive message', msg);
	* 
	* 자신제외 룸 안의 유저에게 보낼때
	* 	socket.broadcast.to(data.room_id).emit('system', msg);
	* 
	* 자신포함 룸 안의 유저
	* 	io.sockets.in(room_id).emit('receive message',data);
	*/	
	
	socket.emit('connection', {
		type : 'connected'
	});
	
	// 람다식 문법.. 나중에 공부하자...
	socket.on('connection', data => {
	
		if(data.type === 'join') {
			console.log("join: " + data.room);
			socket.join(data.room);
			
			// depracated
			// socket.set('room', data.room);
			socket.room = data.room;
			
			socket.emit('system', {
				message : 'welcome to chat room!!'
			});
			
			socket.broadcast.to(data.room).emit('system', {
				message : '[' + name + '] is connected'
			});
		}
	
	});
	
	socket.on('send message', function(name,text){
		var msg = name + ' : ' + text;
		var room = socket.room;
		console.log("[Room No."+room+"]" +msg);
		
		
		if(room) {
			io.sockets.in(room).emit('receive message',msg);//자신포함 전체 룸안의 유저
			//socket.broadcast.to(room).emit('receive message', msg);  // 자신제외 룸안의 유저
		}
		
		//io.emit('receive message', msg);
	});
	
	socket.on('leaveRoom',function(){
		socket.leave(socket.room);//룸퇴장
		console.log('OUT ROOM LIST', io.sockets.adapter.rooms);
	});
	
	socket.on('disconnect', function(){
		var room = socket.room;
		console.log("[Room No."+room+"]" +'user disconnected: ', socket.id);
	});

});






http.listen('3001', function(){
	console.log("server on!");
});











