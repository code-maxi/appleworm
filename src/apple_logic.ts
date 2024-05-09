export const ids = [ ' ', '#', 'X', 'a', '*' ]
export const directions: [number, number][] = [[1,0], [0,1], [-1,0], [0,-1]]
export const dir_keys: string[] = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp']

export function v_add(a: [number, number], b: [number, number]): [number, number] { return [a[0] + b[0], a[1] + b[1]] }
export function v_mul(v: [number, number], f: number): [number, number] { return [v[0]*f, v[1]*f] }
export function v_get(gm: number[][], v: [number, number]): number { return gm[v[1]][v[0]] }
export function v_set(gm: number[][], v: [number, number], n: number) { gm[v[1]][v[0]] = n }
export function v_eq(a: [number, number], b: [number, number]): boolean { return  a[0] === b[0] && a[1] === b[1] }
export function v_ang(v: [number, number]): number { return  Math.atan2(v[1], v[0]) }

export function in_range(gm: number[][], p: [number, number]): boolean { return p[0] >= 0 && p[1] >= 0 && p[0] < gm[0].length && p[1] < gm.length }

export function read_game(game: string): number[][] {
    let gm: number[][] = []
    game.split('\n').forEach((line, yc) => {
        for (let y = 0; y < yc; y ++) {
            while (gm[y].length < line.length) gm[y].push(ids.indexOf(' '))
        }
        let nr: number[] = []
        line.split('').forEach(l => {
            nr.push(ids.includes(l) ? ids.indexOf(l) : -l)
        })
        gm.push(nr)
    })
    return gm
}

export function gm_to_str(gm: number[][]): string {
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
    const iys = new Array<number>(gm[0].length).fill(-gm.length)
    const dys = new Array<number>(gm[0].length).fill(gm.length)
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
    if (!in_range(gm, h_next)) return
    const possible_ids = [ids.indexOf('X'), ids.indexOf(' '), ids.indexOf('a')]

    if (!possible_ids.includes(v_get(gm, h_next))) return
    const mode = possible_ids.indexOf(v_get(gm, h_next))
    if (mode === 0) {
        const h_next_next = v_add(worm[worm.length-1], v_mul(dm, 2))
        if (v_get(gm, h_next_next) !== ids.indexOf(' ')) return
        v_set(gm, h_next_next, v_get(gm, h_next))
        for (let i = 0; i < stones.length; i++) {
            if (v_eq(stones[i], h_next)) {
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

export function is_game_over(gm: number[][]): boolean {
    for (let y = 0; y < gm.length; y++) {
        for (let x = 0; x < gm[y].length; x++) {
            if (gm[y][x] < 0) return false
        }
    }
    return true
}

export function is_level_completed(gm: number[][]): boolean {
    let min_pos: [[number, number], number] = [[0,0], 0]
    for (let y = 0; y < gm.length; y++) {
        for (let x = 0; x < gm[y].length; x++) {
            if (gm[y][x] < min_pos[1]) min_pos = [[x, y], gm[y][x]]
        }
    }
    for (let d of directions) {
        if (v_get(gm, v_add(min_pos[0], d)) === ids.indexOf('*')) return true
    }
    return false
}

function get_neighbour_ds(gm: number[][], v: [number, number], is_n: (i: number) => boolean): [number, number][] {
    const ds: [number, number][] = []
    directions.forEach(d => {
        const p = v_add(v, d)
        if (in_range(gm, p) && is_n(gm[p[1]][p[0]])) ds.push(d)
    })
    return ds
}

export function gm_to_img(gm: number[][]) {
    const worm: [number, number][] = []
    const gm_img: string[][] = []
    for (let y = 0; y < gm.length; y++) {
        gm_img.push([])
        for (let x = 0; x < gm[y].length; x++) {
            gm_img[y].push('')
            if (gm[y][x] < 0) {
                while (worm.length < -gm[y][x]) worm.push([0, 0])
                worm[-gm[y][x] - 1] = [x, y]
            }
            else {
                switch (ids[gm[y][x]]) {
                    case ' ':
                        gm_img[y][x] = 'nothing.png#worm-nothing'
                        break
                    case '#':
                        let className = '#worm-wall-shadow '
                        const ds = get_neighbour_ds(gm, [x,y], i => i === ids.indexOf('#'))
                        if (ds.length === 2 && !v_eq(ds[0], v_mul(ds[1], -1))) {
                            const i = Math.round(v_ang(v_add(v_mul(ds[0], -1), v_mul(ds[1], -1)))*2/Math.PI - 0.5)
                            className += `worm-round-corner-${i} `
                        }
                        if (ds.length === 1) {
                            const i = Math.round(v_ang(ds[0])*2/Math.PI)
                            className += `worm-round-corners-${i} `
                        }
                        if (ds.length === 0) {
                            className += 'worm-round-corners-all'
                        }
                        gm_img[y][x] = 'wall.png'+className
                        break
                    case 'X':
                        gm_img[y][x] = 'stone.png'
                        break
                    case 'a':
                        gm_img[y][x] = 'apple.png'
                        break
                    case '*':
                        gm_img[y][x] = 'target.png'
                        break
                }
            }
        }
    }
    worm.forEach((p, i) => {
        const previous = i > 0 ? worm[i-1] : null
        const next = i < worm.length-1 ? worm[i+1] : null
        let className = ''
        let fileName = ''
        if (!previous || !next) {
            fileName = !previous ? 'worm_tail.png' : 'worm_head.png'
            const d = !previous ? v_add(next!, v_mul(p, -1)) : v_add(p, v_mul(previous!, -1))
            className = '#worm-rot-'+Math.round(v_ang(d) / Math.PI * 2)
        }
        else {
            const d1 = v_add(p, v_mul(previous!, -1))
            const d2 = v_add(next!, v_mul(p, -1))
            if (v_eq(d1, d2)) {
                fileName = 'worm_middle.png'
                directions.forEach((d, i) => {
                    if (v_eq(d1, d)) className = '#worm-rot-'+i
                })
            }
            else {
                fileName = 'worm_corner.png'
                const i = v_ang(v_add(d1, v_mul(d2, -1)))*2/Math.PI - 0.5
                className = '#worm-rot-'+i
            }
        }
        gm_img[p[1]][p[0]] = fileName + className
    })
    return gm_img
}

export const test_level = `                 
         X  a
         #   X
        a
      321    #
      ###        
              a #
    #         # #
    #     #   ###
    X            
    #            
         #       
         #       
*                
         #       
     #           `