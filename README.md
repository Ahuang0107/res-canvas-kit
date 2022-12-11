# README

A reservation data render library base on canvaskit-wasm.

## Architecture

- 因为宽高固定，所以可以计算得到当前屏幕需要显示第几行开始，第几列开始，一共多少行多少列的数据
- 可以减少滚轮移动时视窗的移动的距离大小
- 每次视图一移动，移动结束时将是否渲染和是否能交互置为false，然后通知业务端新的数据从第几行第几列开始，拿到数据后再重新渲染，
  渲染完再重新将是否能交互置为false
- 需要处理时间，所以需要一个专门处理时间的util(希望用rust写，但需要解决现在wasm对类型支持羸弱的问题，之后再写)
-

![architecture](./doc/architecture.png)

## BenchMark

| Cell Number           | FPS | Memory |      Platform      |
|:----------------------|:---:|:------:|:------------------:|
| 1,000*1,000=1,000,000 | 66  | 238MB  | Apple M1 Pro 16 GB |
| 2,000*2,000=4,000,000 | 66  | 918MB  | Apple M1 Pro 16 GB |
| 3,000*3,000=9,000,000 | 66  | 2051MB | Apple M1 Pro 16 GB |
| 20,000*365=7,300,000  | 66  | 1685MB | Apple M1 Pro 16 GB |
| 500*10,000=5,000,000  | 50  | 1169MB | Apple M1 Pro 16 GB |

> performance limited by Memory, when it over 2GB(about 9M data), the FPS will become unstable and app may crash.

> having too many data in one row will reduce FPS.

> when data reduce to 1,500*1,500 = 2,250,000(random half data of 3,000*3,000 = 9,000,000), FPS increase to 125
