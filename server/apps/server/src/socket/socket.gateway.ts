import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: { origin: '*' },
})
export class SocketGateway {
  @WebSocketServer()
  server: Server;

  // 连接成功之后会自动进入这个钩子并传入当前链接的 client
  handleConnection(client: Socket) {
    // 默认情况下是通过广播来通知，我们这里每个人的支付都是单独的，因此需要加入单独的房间
    const userId = client.handshake.query.userId; // userId在前端连接的时候会通过query去传入
    if (userId) {
      // 这里必须加判断，因为热更新的时候有时候没有id
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      client.join(`user_${userId}`); //加入到这个房间
    }
  }

  // 支付成功之后通过前端关闭弹框
  emitPaymentSuccess(userId: string) {
    // 通知房间内的用户触发这个事件
    this.server.to(`user_${userId}`).emit('paymentSuccess', userId);
  }
}
