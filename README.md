# node-red-contrib-store-reviews
A set of input node to retrieve user reviews on application stores such as Apple App Store or Google Play.

| Branch   |      Status                                                                                                                                |
|----------|:------------------------------------------------------------------------------------------------------------------------------------------:|
| master | [![Build Status](https://travis-ci.org/zippy1978/node-red-contrib-store-reviews.svg?branch=master)](https://travis-ci.org/Backelite/sonar-swift)  |
| develop| [![Build Status](https://travis-ci.org/zippy1978/node-red-contrib-store-reviews.svg?branch=develop)](https://travis-ci.org/Backelite/sonar-swift) |

## Install

	cd ~\.node-red
	npm install node-red-contrib-store-reviews

## Usage

Once installed nodes are available in the *input* section.

### Available nodes

 * **appstore**: a node to retrieve application reviews on Apple App Store
 * **googleplay**: a node to retrieve application reviews on Google Play

### Release notes

#### **0.3.0**
 * complete rewrite for a more readable and testable code
 * added unit tests
  
#### **0.2.2**
 * fixed concurrency issue with appstore node
 
#### **0.2.1**
 * multiple apps supports for a single input
