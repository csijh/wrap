# Wrap
This is a small framework for creating and viewing web-based presentations.  It
is aimed at authors who have or are prepared to gain some knowledge of web
technologies, and who want something more flexible or customizable than a
conventional presentation tool.  It consists of a viewer, plus an optional
custom web server for development and/or self-contained delivery:

- [wrap.mjs](//raw.githubusercontent.com/csijh/wrap/master/wrap.mjs)
- [server.mjs](//raw.githubusercontent.com/csijh/wrap/master/server.mjs)
- [documentation](//csijh.github.io/wrap/)

There are perhaps three major advantages of web-based presentations.  One is
that they are cross-platform. A second is that a wide range of different types
of resource can be embedded in a presentation, with no need to change programs
while presenting.  A third is that the approach is completely open ended, using
free and open source software, with no proprietary lock-in, and virtually no
limit to what can be achieved.  On the other hand, there are quite a lot of
niggly details to sort out, and the aim of this framework and its documentation
is to handle some of those details.

This framework provides only a fairly small range of basic features.  The
bulk of the power of web presentations comes from the capabilities of browsers
and the embedded integrated technologies guaranteed by the HTML5 standard, all
of which are controllable through scripting.

Examples of resources that can be combined seamlessly into a presentation are
images, video and audio clips, mathematical notation, program fragments with
syntax highlighting, vector-based drawings, and custom scripted animations. With
some extra work, mobile-friendly materials, audience interaction, and live
sketching or programming demos, are possible. Demos are provided for some of
these possibilities in the documentation, and suggestions are provided for
others.
