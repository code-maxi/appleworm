import {Component} from "react";
import {dir_keys, directions, fall_things, gm_to_img, gm_to_str, move, read_game, test_level} from "./apple_logic";

type _wg_state = {
    time: number,
    level_index: number,
    cell_size: number,
    running: boolean,
    levels: string[],
    game: number[][]
}
type _wg_probs = any
export class WormGame extends Component<_wg_probs, _wg_state> {
    private fall_interval: NodeJS.Timer | null = null

    constructor(props: any) {
        super(props)
        this.state = {
            time: 0, level_index: -1, cell_size: 50, running: false,
            levels: [test_level], game: []
        }
        document.onkeyup = e => this.keydown(e)
    }

    keydown(e: KeyboardEvent) {
        if (dir_keys.includes(e.key) && this.fall_interval == null) {
            this.move_worm(directions[dir_keys.indexOf(e.key)])
            console.log('MOVE!')
            console.log(gm_to_str(this.state.game))
        }
    }

    move_worm(mv: [number, number]) {
        const valid_move = move(this.state.game, mv)
        if (valid_move && this.fall_interval == null) {
            this.fall_interval = setInterval(() => {
                if (fall_things(this.state.game)) this.setState(this.state)
                else if (this.fall_interval) {
                    console.log('FELL!')
                    console.log(gm_to_str(this.state.game))
                    clearInterval(this.fall_interval)
                    this.fall_interval = null
                }
            }, 75)
        }
        this.setState(this.state)
    }

    set_level(i: number) {
        this.setState({
            ...this.state,
            level_index: i,
            game: read_game(this.state.levels[i])
        })
    }

    componentDidMount() {
        // fetch data
        this.set_level(0)
    }

    render() {
        return <div className="worm-container">
            <div className="worm-grid-container">
                {
                    gm_to_img(this.state.game).map((row, y) => <div key={'r' + y} className="worm-grid-row">
                        {
                            row.map((src_class, x) => (
                                <img key={'c' + x + '' + y} src={'icons/' + src_class.split('#')[0]}
                                     className={src_class.split('#')[1]} width={this.state.cell_size}
                                     height={this.state.cell_size} alt={src_class}/>
                            ))
                        }
                    </div>)
                }
            </div>
        </div>;
    }
}