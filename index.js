const canvas = document.getElementById("canvas")
const text = document.getElementById("text")
const context = canvas.getContext("2d")

const CELL = 30
const COLUMN = 10
const ROW = 20

canvas.width = COLUMN * CELL
canvas.height = ROW * CELL

function drawBackground(){
    context.fillStyle = "black"
    context.fillRect(0,0,canvas.width,canvas.height)
}
drawBackground()
function createBoardMatrix(){
    // Matrix 20 x 10
    let matrix = []
    for(let i = 0; i< ROW; i++){
        matrix.push(new Array(COLUMN).fill(0))
    }
    return matrix
}
function getRandomShape(){
    let allShape = "IJLOZTS"
    let randomIndex = Math.random() * allShape.length | 0
    return allShape[randomIndex]
}
function getRandomMatrix(){
    switch(getRandomShape()){
        case "I":
            return [
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
                [0, 0, 1, 0],
            ]
        case "J":
            return [
                [0,2,0],
                [0,2,0],
                [2,2,0]
            ]
        case "L":
            return [
                [0,3,0],
                [0,3,0],
                [0,3,3]
            ]
        case "O":
            return [
                [4,4],
                [4,4]
            ]
        case "S":
            return [
                [0,5,5],
                [5,5,0],
                [0,0,0]
            ]
        case "Z":
            return [
                [6,6,0],
                [0,6,6],
                [0,0,0]
            ]
        case "T":
            return [
                [7,7,7],
                [0,7,0],
                [0,0,0]
            ]
    }
}
let score = 0
text.innerHTML = score 
let shape = {
    matrix: getRandomMatrix(),
    position:{
        x:3, y:0
    }
}

let boardMatrix = createBoardMatrix()

context.scale(CELL, CELL)
let allColor = [
    'black',
    'red',
    'blue',
    'yellow',
    'green',
    'purple',
    'pink',
    'violet'
]
function drawCube(position, number){
    context.fillStyle = allColor[number]
    context.fillRect(position.x, position.y, 1,1)
}
function drawShape(matrix, position){
    matrix.forEach((row, y) => {
        row.forEach((number, x )=>{
            if(number !== 0){
                drawCube({x:x + position.x,y: y+position.y}, number)
            }
        })
    })
}
drawShape(shape.matrix, shape.position)

function clearScreen(){
    drawBackground()
}

const dropDelaySeconds = 1000
let deltaTime = 0 // delta time between 2 frame
let lastTime = 0 // time of last frame
let dropCounter = 0
// Run after every 1 second
function gameLoop(time=0){
    clearScreen()
    deltaTime = time - lastTime
    lastTime = time
    dropCounter += deltaTime
    if(dropCounter >= dropDelaySeconds){
        dropShape()
    }
    
    drawShape(shape.matrix, shape.position)
    drawShape(boardMatrix, {x:0,y:0})
    requestAnimationFrame(gameLoop)
}

gameLoop()
function isCollide(boardMatrix, shape){
    for(let y = 0; y<shape.matrix.length; y++ ){
        for(let x = 0; x<shape.matrix[y].length; x++ ){
            if(shape.matrix[y][x] !== 0 && boardMatrix[y+shape.position.y]?.[x+shape.position.x] !==0){
                return true
            }
        }
    }
    return false
}
function handleBoardSweep(boardMatrix){
    let totalScore = 0
    let rowScore = 10
    outerLoop: for(let y = boardMatrix.length - 1; y>=0; y--){
        for(let x =0; x<boardMatrix[y].length;x++){
            if(boardMatrix[y][x] == 0){
                continue outerLoop
            }
        }
        totalScore += rowScore
        rowScore *= 2
        let removedRow = boardMatrix.splice(y, 1)[0].fill(0)
        boardMatrix.unshift(removedRow)
        y++
    }
    score+=totalScore
    text.innerHTML = score
}
function mergeShapeMatrixToBoardMatrix(boardMatrix, shape){
    shape.matrix.forEach((row,y)=>{
        row.forEach((number,x)=>{
            if(number !== 0)
                boardMatrix[y+shape.position.y][x+shape.position.x] = number
        })
    })
    // Check an diem
    handleBoardSweep(boardMatrix)
}
function clearBoardMatrix(boardMatrix){
    boardMatrix.forEach(row=>row.fill(0))
}
function resetShape(shape){
    shape.matrix = getRandomMatrix()
    shape.position = {x:3,y:0}
    dropCounter = 0
    if(isCollide(boardMatrix, shape)){
        clearBoardMatrix(boardMatrix)
    }
}
function dropShape(){
    shape.position.y++
    dropCounter = 0
    if(isCollide(boardMatrix, shape)){
        shape.position.y--
        mergeShapeMatrixToBoardMatrix(boardMatrix, shape)
        resetShape(shape)
    }
}

function moveShape(horizontal){
    shape.position.x += horizontal
    if(isCollide(boardMatrix, shape)){
        shape.position.x -= horizontal
    }
}
function rotateMatrix(matrix, clockWise){
    // Hoan vi
    for(let y = 0; y< matrix.length;y++){
        for(let x = 0; x< y; x++){
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]]
        }
    }
    // Nghich dao cot (chieu kim dong ho)
    if(clockWise > 0){
        matrix.forEach(row=>row.reverse())
    }
    // Nhich dao hang (nguoc chieu kim dong ho)
    else if(clockWise<0){
        matrix.reverse()
    }
}

function rotateShape(clockWise){
    rotateMatrix(shape.matrix, clockWise)
    if(isCollide(boardMatrix, shape)){
        rotateMatrix(shape.matrix, - clockWise)
    }
}
document.onkeydown = event =>{
    console.log(event)
    switch(event.keyCode){
        case 40: // Arrow down
            dropShape()
            break;
        case 37: // Arrow left
            moveShape(-1)
            break;
        case 39: // Arrow right
            moveShape(1)
            break;    
        case 32: // Space
            rotateShape(1)
            break;    
    }
}