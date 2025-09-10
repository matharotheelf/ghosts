/*
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 * ml5.js license and Code of Conduct: https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md
 *
 * This example demonstrates drawing skeletons on poses for the MoveNet model.
 */

const LEFTEARINDEX = 3;
const RIGHTEARINDEX = 4;
const LEFTSHOULDERINDEX = 5;
const RIGHTSHOULDERINDEX = 6;
const LEFTWAISTINDEX = 12;
const RIGHTWAISTINDEX = 11;
const LEFTELBOWINDEX = 7;
const RIGHTELBOWINDEX = 8;
const LEFTWRISTINDEX = 9;
const RIGHTWRISTINDEX = 10;

const SEQUENCELENGTH = 200;

const DISTANCERANGE = 100;
const ALPHARANGE = 100;

let isRecording = false;
let currentSequence = [];
let frameNumber = 0;
let currentPose;
let pastSequences = [];
let video;
let bodyPose;
let poses = [];
let connections;

function preload() {
  // Load the bodyPose model
  bodyPose = ml5.bodyPose();
}

function setup() {
  createCanvas(640, 480);

  // Create the video and hide it
  video = createCapture(VIDEO);
  video.size(640, 480);
  video.hide();

  // Start detecting poses in the webcam video
  bodyPose.detectStart(video, gotPoses);
  // Get the skeleton connection information
  connections = bodyPose.getSkeleton();
}

function draw() {
  // Draw the webcam video
  image(video, 0, 0, width, height);

  // Draw the skeleton connections
  // for (let i = 0; i < poses.length; i++) {
  //   let pose = poses[i];
  //   for (let j = 0; j < connections.length; j++) {
  //     let pointAIndex = connections[j][0];
  //     let pointBIndex = connections[j][1];
  //     let pointA = pose.keypoints[pointAIndex];
  //     let pointB = pose.keypoints[pointBIndex];
  //     // Only draw a line if both points are confident enough
  //     if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
  //       stroke(0, 255, 0, 50);
  //       strokeWeight(2);
  //       line(pointA.x, pointA.y, pointB.x, pointB.y);
  //     }
  //   }
  // }
  
  currentPose = poses.length > 0 ? poses[0] : null;

  if (isRecording) {
    fill(255, 0, 0);
    noStroke();
    circle(20, 20, 20);

    addPoseToSequence();
  }

  // drawBodyShapes(currentPose);
  drawPastSequences();

  // Draw all the tracked landmark points
  // for (let i = 0; i < poses.length; i++) {
  //   let pose = poses[i];
  //   for (let j = 0; j < pose.keypoints.length; j++) {
  //     let keypoint = pose.keypoints[j];
  //     // Only draw a circle if the keypoint's confidence is bigger than 0.1
  //     if (keypoint.confidence > 0.1) {
  //       fill(0, 255, 0);
  //       noStroke();
  //       circle(keypoint.x, keypoint.y, 10);
  //     }
  //   }
  // }
}

function addPoseToSequence() {
  if (currentPose != null) {
    let keypoints = currentPose.keypoints.map((keypoint) => {
      return {
        x: keypoint.x,
        y: keypoint.y,
        confidence: keypoint.confidence
      };
    });
    currentSequence.push(keypoints);

    if (currentSequence.length >= SEQUENCELENGTH) {
      pastSequences.push(currentSequence);
      currentSequence = [];
      console.log('Saved a sequence! Total sequences:', pastSequences.length);
    }
  }
}

function drawHead(keypoints) {
  let leftEarPosition = keypoints[LEFTEARINDEX];
  let rightEarPosition =  keypoints[RIGHTEARINDEX];
  let headCentre = createVector(leftEarPosition.x + rightEarPosition.x, leftEarPosition.y + rightEarPosition.y).mult(0.5);
  let headWidth = dist(leftEarPosition.x, leftEarPosition.y, rightEarPosition.x, rightEarPosition.y);
  let headHeight = headWidth * 1.5;

  ellipse(headCentre.x, headCentre.y, headWidth, headHeight);
}

function drawChest(keypoints) {
  let leftShoulderPosition = keypoints[LEFTSHOULDERINDEX];
  let rightShoulderPosition =  keypoints[RIGHTSHOULDERINDEX];

  let leftWaistPosition = keypoints[LEFTWAISTINDEX];
  let rightWaistPosition =  keypoints[RIGHTWAISTINDEX];

  quad(
    leftShoulderPosition.x, leftShoulderPosition.y,
    rightShoulderPosition.x, rightShoulderPosition.y,
    leftWaistPosition.x, leftWaistPosition.y,
    rightWaistPosition.x, rightWaistPosition.y
  );
}

function drawLeftArm(keypoints) {
  let leftShoulderPosition = keypoints[LEFTSHOULDERINDEX];
  let leftElbowPosition = keypoints[LEFTELBOWINDEX];
  let leftWristPosition = keypoints[LEFTWRISTINDEX];

  strokeWeight(50);
  line(leftShoulderPosition.x, leftShoulderPosition.y, leftElbowPosition.x, leftElbowPosition.y);
  line(leftElbowPosition.x, leftElbowPosition.y, leftWristPosition.x, leftWristPosition.y);
  strokeWeight(1);
}

function drawRightArm(keypoints) {
  let rightShoulderPosition = keypoints[RIGHTSHOULDERINDEX];
  let rightElbowPosition = keypoints[RIGHTELBOWINDEX];
  let rightWristPosition = keypoints[RIGHTWRISTINDEX];

  strokeWeight(50);
  line(rightShoulderPosition.x, rightShoulderPosition.y, rightElbowPosition.x, rightElbowPosition.y);
  line(rightElbowPosition.x, rightElbowPosition.y, rightWristPosition.x, rightWristPosition.y);
  strokeWeight(1);
}

function drawPastSequences() {
  for (let i = 0; i < pastSequences.length; i++) {
    let sequence = pastSequences[i];
    let frame = sequence[frameNumber % sequence.length];
    drawSequenceFrame(frame);
  }

  frameNumber = (frameNumber + 1) % SEQUENCELENGTH;
}

function drawSequenceFrame(keypoints) {
  if (currentPose == null) {
    return;
  }

  averageDistance = averageDistanceToPose(keypoints);

  alpha = map(averageDistance, DISTANCERANGE, 0, 0, ALPHARANGE);

  stroke(0, 255, 255, alpha);
  fill(0, 255, 255, alpha);

  drawHead(keypoints);
  drawChest(keypoints);
  drawLeftArm(keypoints);
  drawRightArm(keypoints);
}

function averageDistanceToPose(keypoints) {
  distance = 0;

  for (let i = 0; i < keypoints.length; i++) {
    let framekeypoint = keypoints[i];
    let currentkeypoint = currentPose.keypoints[i];
    distance += dist(framekeypoint.x, framekeypoint.y, currentkeypoint.x, currentkeypoint.y);
  }

  return distance/keypoints.length;
}

function mousePressed() {
  isRecording = !isRecording;
}

function drawBodyShapes(pose) {
  if (pose != null) {
    stroke(0, 255, 0, 50);
    fill(0, 255, 0, 50);

    keypoints = pose.keypoints;

    drawHead(keypoints);
    drawChest(keypoints);
    drawLeftArm(keypoints);
    drawRightArm(keypoints);
  }
}

// Callback function for when bodyPose outputs data
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
}
