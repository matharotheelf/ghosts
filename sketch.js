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
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < connections.length; j++) {
      let pointAIndex = connections[j][0];
      let pointBIndex = connections[j][1];
      let pointA = pose.keypoints[pointAIndex];
      let pointB = pose.keypoints[pointBIndex];
      // Only draw a line if both points are confident enough
      if (pointA.confidence > 0.1 && pointB.confidence > 0.1) {
        stroke(255, 0, 0);
        strokeWeight(2);
        line(pointA.x, pointA.y, pointB.x, pointB.y);
      }
    }
  }

  drawBodyShapes();

  // Draw all the tracked landmark points
  for (let i = 0; i < poses.length; i++) {
    let pose = poses[i];
    for (let j = 0; j < pose.keypoints.length; j++) {
      let keypoint = pose.keypoints[j];
      // Only draw a circle if the keypoint's confidence is bigger than 0.1
      if (keypoint.confidence > 0.1) {
        fill(0, 255, 0);
        noStroke();
        circle(keypoint.x, keypoint.y, 10);
      }
    }
  }
}

function drawHead() {
  let pose = poses[0];

  let leftEarPosition = pose.keypoints[LEFTEARINDEX];
  let rightEarPosition =  pose.keypoints[RIGHTEARINDEX];
  let headCentre = createVector(leftEarPosition.x + rightEarPosition.x, leftEarPosition.y + rightEarPosition.y).mult(0.5);
  let headWidth = dist(leftEarPosition.x, leftEarPosition.y, rightEarPosition.x, rightEarPosition.y);
  let headHeight = headWidth * 1.5;

  ellipse(headCentre.x, headCentre.y, headWidth, headHeight);
}

function drawChest() {
  let pose = poses[0];

  let leftShoulderPosition = pose.keypoints[LEFTSHOULDERINDEX];
  let rightShoulderPosition =  pose.keypoints[RIGHTSHOULDERINDEX];

  let leftWaistPosition = pose.keypoints[LEFTWAISTINDEX];
  let rightWaistPosition =  pose.keypoints[RIGHTWAISTINDEX];

  quad(
    leftShoulderPosition.x, leftShoulderPosition.y,
    rightShoulderPosition.x, rightShoulderPosition.y,
    leftWaistPosition.x, leftWaistPosition.y,
    rightWaistPosition.x, rightWaistPosition.y
  );
}

function drawBodyShapes() {
  if (poses.length < 1) {
    return;
  }

  drawHead();
  drawChest();
}

// Callback function for when bodyPose outputs data
function gotPoses(results) {
  // Save the output to the poses variable
  poses = results;
}
