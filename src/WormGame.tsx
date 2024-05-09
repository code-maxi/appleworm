import {Component} from "react";
import {dir_keys, directions, gm_to_img, gm_to_str, move, read_game, test_level} from "./apple_logic";

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
    constructor(props: any) {
        super(props)
        this.state = {
            time: 0, level_index: -1, cell_size: 50, running: false,
            levels: [test_level], game: []
        }
        document.onkeyup = e => this.keydown(e)
    }

    keydown(e: KeyboardEvent) {
        if (dir_keys.includes(e.key)) {
            const mv = directions[dir_keys.indexOf(e.key)]
            move(this.state.game, mv)
            this.setState(this.state)
            console.log('move ' + mv)
            console.log(gm_to_str(this.state.game))
        }
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