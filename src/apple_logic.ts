export const ids = [ ' ', '#', 'X', 'a', '*' ]

export function v_add(a: [number, number], b: [number, number]): [number, number] { return [a[0] + b[0], a[1] + b[1]] }
export function v_mul(v: [number, number], f: number): [number, number] { return [v[0]*f, v[1]*f] }
export function v_get(gm: number[][], v: [number, number]): number { return gm[v[1]][v[0]] }
export function v_set(gm: number[][], v: [number, number], n: number) { gm[v[1]][v[0]] = n }
export function v_eq(a: [number, number], b: [number, number]): boolean { return  a[0] == b[0] && a[1] == b[1] }

export function read_game(game: string): number[][] {
    let gm: number[][] = []
    game.split('\n').forEach(line => {
        let nr: number[] = []
        line.split('').forEach(l => {
            nr.push(ids.includes(l) ? ids.indexOf(l) : -l)
        })
        gm.push(nr)
    })
    return gm
}

export function game_to_str(gm: number[][]): string {
    let str = ''
    for (let y = 0; y < gm.length; y++) {
        for (let x = 0; x < gm[y].length; x++) {
            str += gm[y][x] >= 0 ? ids[gm[y][x]] : ''+-gm[y][x]
        }
        str += '\n'
    }
    return str
}

function fall(gm: number[][], items: [number, number][], is_own: (n: number) => boolean) {
    console.log(items)
    let iys = new Array<number>(gm[0].length).fill(-gm.length)
    let dys = new Array<number>(gm[0].length).fill(gm.length)
    for (let x = 0; x < iys.length; x++) {
        for (let p of items) {
            if (p[0] === x && iys[x] < p[1]) { iys[x] = p[1] }
        }
    }
    for (let y = 0; y < gm.length; y++) {
        for (let x = 0; x < gm[y].length; x++) {
            const dy = y - iys[x] - 1
            if (dy >= 0 && gm[y][x] !== ids.indexOf(' ') && !is_own(gm[y][x]) && dys[x] > dy) dys[x] = dy
        }
    }
    const mdy = Math.min(...dys)
    console.log('iys '+ iys, 'mdy ' + mdy, 'dys ' + dys)
    if (mdy > 0) {
        for (let p of items) {
            if (mdy < gm.length) gm[p[1] + mdy][p[0]] = gm[p[1]][p[0]]
            gm[p[1]][p[0]] = 0
        }
    }
}

export function move(gm: number[][], dm: [number, number]) {
    const worm: [number, number][] = []
    const stones: [number, number][] = []
    for (let y = 0; y < gm.length; y++) {
        for (let x = 0; x < gm[y].length; x++) {
            if (gm[y][x] < 0) {
                while (worm.length < -gm[y][x]) worm.push([0, 0])
                worm[-gm[y][x] - 1] = [x, y]
            } else if (gm[y][x] === ids.indexOf('X')) {
                stones.push([x, y])
            }
        }
    }

    const h_next = v_add(worm[worm.length-1], dm)
    const possible_ids = [ids.indexOf('X'), ids.indexOf(' '), ids.indexOf('a')]

    if (!possible_ids.includes(v_get(gm, h_next))) return
    const mode = possible_ids.indexOf(v_get(gm, h_next))
    if (mode === 0) {
        const h_next_next = v_add(worm[worm.length-1], v_mul(dm, 2))
        if (v_get(gm, h_next_next) !== ids.indexOf(' ')) return
        v_set(gm, h_next_next, v_get(gm, h_next))
        for (let i = 0; i < stones.length; i++) {
            if (v_eq(stones[i], h_next)) {
                console.log('CHANGING STONE')
                stones[i] = h_next_next
            }
        }
    }
    const worm2 = JSON.parse(JSON.stringify(worm))
    if (mode === 0 || mode === 1) {
        v_set(gm, h_next, -worm.length)
        worm2[worm.length-1] = h_next
        for (let i = 0; i < worm.length; i++) {
            v_set(gm, worm[i], v_get(gm, worm[i]) + 1)
            if (i > 0) worm2[i-1] = worm[i]
        }
    }
    if (mode === 2) {
        v_set(gm, h_next, -worm.length - 1)
        worm2.push(h_next)
    }

    stones.forEach(stone => fall(gm, [stone], n => n === ids.indexOf('X')))
    fall(gm, worm2, n => n < 0)
}

export function test_apple() {
    const game = `   ###  
    a   
   1Xa a
   ##   
   *### `
    console.log('START DEBUG')
    const gm = read_game(game)
    console.log(game_to_str(gm))
    console.log('MOVE!')
    move(gm, [1, 0])
    console.log(game_to_str(gm))
}

export const test_game = `   ###  
    a   
 123Xa a
   ##   
   *### `