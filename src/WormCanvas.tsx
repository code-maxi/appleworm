import React, {useEffect, useRef} from "react";
import useImage from 'use-image';

export function WormCanvas({ gm, mw, mh }: { gm: number[][], mw: number, mh: number }) {
    const cs = Math.min(mw / gm[0].length, mh / gm.length)
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    useEffect(() => {

        if (canvasRef.current) {
            const con = canvasRef.current.getContext("2d");
            if (con) {
                con.strokeStyle = 'black'
                con.lineWidth = 1
                for (let y = 0; y < gm.length; y++) {
                    for (let x = 0; x < gm[y].length; x++) {
                        con.strokeRect(x * cs, y * cs, cs, cs)
                    }
                }
            }
        }
    })
    return (<canvas width={cs*gm[0].length} height={cs*gm.length} ref={canvasRef} />)
}