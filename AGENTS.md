# Architecture rules

- Render the genealogy layout inside TreeViewport, which measures the natural tree and scales only its presentation; this keeps mobile fitting and zoom independent of family relationships.
- Initialize appearance before React renders and keep ThemeProvider and toast appearance aligned; this prevents stale saved preferences or system settings from changing the app's theme.