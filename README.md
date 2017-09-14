# Wrap
This is a small framework for creating and viewing web-based presentations.  It
is aimed at authors with some knowledge of web technologies.  It consists of a
viewer and a custom web server:

- [wrap.js](//raw.githubusercontent.com/csijh/wrap/master/wrap.js)
- [server.js](//raw.githubusercontent.com/csijh/wrap/master/server.js)
- [documentation](//csijh.github.io/wrap/)

There are perhaps three major advantages of web-based presentations.  One is
that they are cross-platform. A second is that a wide range of different types
of resource can be embedded in a presentation, with no need to change programs
while presenting.  A third is that development is completely open ended, with
virtually no limit to what can be achieved.  On the other hand, there are quite
a lot of niggly details to sort out, and the aim of this framework is to handle
a lot of those details.

The framework itself provides only a fairly small range of basic features.  The
bulk of the power of web presentations comes from the capabilities of browsers
and the embedded integrated technologies guaranteed by the HTML5 standard, all
of which are controllable through scripting.

Examples of resources that can be combined seamlessly into a presentation are
images, videos, audio clips, mathematical notation, program fragments with
syntax highlighting, vector-based drawings, and custom scripted animations. With
a little extra work, interactive quizzes and voting systems, mobile-friendly
materials, live sketching or programming or other demos, and much more are
possible. Some of these possibilities are demonstrated, and more are outlined,
in the documentation.
