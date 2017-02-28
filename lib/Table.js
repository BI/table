'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _TableRow = require('./TableRow');

var _TableRow2 = _interopRequireDefault(_TableRow);

var _TableHeader = require('./TableHeader');

var _TableHeader2 = _interopRequireDefault(_TableHeader);

var _utils = require('./utils');

var _shallowequal = require('shallowequal');

var _shallowequal2 = _interopRequireDefault(_shallowequal);

var _addEventListener = require('rc-util/lib/Dom/addEventListener');

var _addEventListener2 = _interopRequireDefault(_addEventListener);

var _ColumnManager = require('./ColumnManager');

var _ColumnManager2 = _interopRequireDefault(_ColumnManager);

var _createStore = require('./createStore');

var _createStore2 = _interopRequireDefault(_createStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var Table = _react2["default"].createClass({
  displayName: 'Table',

  propTypes: {
    data: _react.PropTypes.array,
    expandIconAsCell: _react.PropTypes.bool,
    defaultExpandAllRows: _react.PropTypes.bool,
    expandedRowKeys: _react.PropTypes.array,
    defaultExpandedRowKeys: _react.PropTypes.array,
    useFixedHeader: _react.PropTypes.bool,
    fixedEndRowCount: _react.PropTypes.number,
    columns: _react.PropTypes.array,
    prefixCls: _react.PropTypes.string,
    bodyStyle: _react.PropTypes.object,
    style: _react.PropTypes.object,
    rowKey: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.func]),
    rowClassName: _react.PropTypes.func,
    expandedRowClassName: _react.PropTypes.func,
    childrenColumnName: _react.PropTypes.string,
    onExpand: _react.PropTypes.func,
    onExpandedRowsChange: _react.PropTypes.func,
    indentSize: _react.PropTypes.number,
    onRowClick: _react.PropTypes.func,
    onRowDoubleClick: _react.PropTypes.func,
    expandIconColumnIndex: _react.PropTypes.number,
    showHeader: _react.PropTypes.bool,
    title: _react.PropTypes.func,
    footer: _react.PropTypes.func,
    emptyText: _react.PropTypes.func,
    scroll: _react.PropTypes.object,
    rowRef: _react.PropTypes.func,
    getBodyWrapper: _react.PropTypes.func,
    children: _react.PropTypes.node
  },

  getDefaultProps: function getDefaultProps() {
    return {
      data: [],
      useFixedHeader: false,
      expandIconAsCell: false,
      defaultExpandAllRows: false,
      defaultExpandedRowKeys: [],
      rowKey: 'key',
      rowClassName: function rowClassName() {
        return '';
      },
      expandedRowClassName: function expandedRowClassName() {
        return '';
      },
      onExpand: function onExpand() {},
      onExpandedRowsChange: function onExpandedRowsChange() {},
      onRowClick: function onRowClick() {},
      onRowDoubleClick: function onRowDoubleClick() {},

      prefixCls: 'rc-table',
      bodyStyle: {},
      style: {},
      childrenColumnName: 'children',
      indentSize: 15,
      expandIconColumnIndex: 0,
      showHeader: true,
      scroll: {},
      rowRef: function rowRef() {
        return null;
      },
      getBodyWrapper: function getBodyWrapper(body) {
        return body;
      },
      emptyText: function emptyText() {
        return 'No Data';
      }
    };
  },
  getInitialState: function getInitialState() {
    var props = this.props;
    var expandedRowKeys = [];
    var rows = [].concat(_toConsumableArray(props.data));
    this.columnManager = new _ColumnManager2["default"](props.columns, props.children);
    this.store = (0, _createStore2["default"])({ currentHoverKey: null });

    if (props.defaultExpandAllRows) {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        expandedRowKeys.push(this.getRowKey(row, i));
        rows = rows.concat(row[props.childrenColumnName] || []);
      }
    } else {
      expandedRowKeys = props.expandedRowKeys || props.defaultExpandedRowKeys;
    }

    var end = props.fixedEndRowCount;
    var data = props.data;
    var endData = null;

    if (end && end > 0) {
      endData = props.data.slice(-end);
    }

    return {
      expandedRowKeys: expandedRowKeys,
      data: data,
      endData: endData,
      currentHoverKey: null,
      scrollPosition: 'left',
      scrollYPosition: 'top',
      fixedColumnsHeadRowsHeight: [],
      fixedColumnsBodyRowsHeight: []
    };
  },
  componentDidMount: function componentDidMount() {
    this.resetScrollY();
    if (this.columnManager.isAnyColumnsFixed()) {
      this.syncFixedTableRowHeight();
      this.debouncedSyncFixedTableRowHeight = (0, _utils.debounce)(this.syncFixedTableRowHeight, 150);
      this.resizeEvent = (0, _addEventListener2["default"])(window, 'resize', this.debouncedSyncFixedTableRowHeight);
    }
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    if ('data' in nextProps || 'fixedEndRowCount' in nextProps) {
      var end = nextProps.fixedEndRowCount;
      var data = nextProps.data;
      var endData = null;

      if (end && end > 0) {
        endData = nextProps.data.slice(-end);
      }

      this.setState({
        data: data,
        endData: endData
      });
      if (!nextProps.data || nextProps.data.length === 0) {
        this.resetScrollY();
      }
    }
    if ('expandedRowKeys' in nextProps) {
      this.setState({
        expandedRowKeys: nextProps.expandedRowKeys
      });
    }
    if (nextProps.columns && nextProps.columns !== this.props.columns) {
      this.columnManager.reset(nextProps.columns);
    } else if (nextProps.children !== this.props.children) {
      this.columnManager.reset(null, nextProps.children);
    }
  },
  componentDidUpdate: function componentDidUpdate() {
    this.syncFixedTableRowHeight();
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.resizeEvent) {
      this.resizeEvent.remove();
    }
    if (this.debouncedSyncFixedTableRowHeight) {
      this.debouncedSyncFixedTableRowHeight.cancel();
    }
  },
  onExpandedRowsChange: function onExpandedRowsChange(expandedRowKeys) {
    if (!this.props.expandedRowKeys) {
      this.setState({ expandedRowKeys: expandedRowKeys });
    }
    this.props.onExpandedRowsChange(expandedRowKeys);
  },
  onExpanded: function onExpanded(expanded, record, e, index) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    var info = this.findExpandedRow(record);
    if (typeof info !== 'undefined' && !expanded) {
      this.onRowDestroy(record, index);
    } else if (!info && expanded) {
      var expandedRows = this.getExpandedRows().concat();
      expandedRows.push(this.getRowKey(record, index));
      this.onExpandedRowsChange(expandedRows);
    }
    this.props.onExpand(expanded, record);
  },
  onRowDestroy: function onRowDestroy(record, rowIndex) {
    var expandedRows = this.getExpandedRows().concat();
    var rowKey = this.getRowKey(record, rowIndex);
    var index = -1;
    expandedRows.forEach(function (r, i) {
      if (r === rowKey) {
        index = i;
      }
    });
    if (index !== -1) {
      expandedRows.splice(index, 1);
    }
    this.onExpandedRowsChange(expandedRows);
  },
  getRowKey: function getRowKey(record, index) {
    var rowKey = this.props.rowKey;
    var key = typeof rowKey === 'function' ? rowKey(record, index) : record[rowKey];
    (0, _utils.warningOnce)(key !== undefined, 'Each record in table should have a unique `key` prop,' + 'or set `rowKey` to an unique primary key.');
    return key === undefined ? index : key;
  },
  getExpandedRows: function getExpandedRows() {
    return this.props.expandedRowKeys || this.state.expandedRowKeys;
  },
  getHeader: function getHeader(columns, fixed) {
    var _props = this.props,
        showHeader = _props.showHeader,
        expandIconAsCell = _props.expandIconAsCell,
        prefixCls = _props.prefixCls;

    var rows = this.getHeaderRows(columns);

    if (expandIconAsCell && fixed !== 'right') {
      rows[0].unshift({
        key: 'rc-table-expandIconAsCell',
        className: prefixCls + '-expand-icon-th',
        title: '',
        rowSpan: rows.length
      });
    }

    var trStyle = fixed ? this.getHeaderRowStyle(columns, rows) : null;

    return showHeader ? _react2["default"].createElement(_TableHeader2["default"], {
      prefixCls: prefixCls,
      rows: rows,
      rowStyle: trStyle
    }) : null;
  },
  getHeaderRows: function getHeaderRows(columns) {
    var _this = this;

    var currentRow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    var rows = arguments[2];

    rows = rows || [];
    rows[currentRow] = rows[currentRow] || [];

    columns.forEach(function (column) {
      if (column.rowSpan && rows.length < column.rowSpan) {
        while (rows.length < column.rowSpan) {
          rows.push([]);
        }
      }
      var cell = {
        key: column.key,
        className: column.className || '',
        children: column.title
      };
      if (column.children) {
        _this.getHeaderRows(column.children, currentRow + 1, rows);
      }
      if ('colSpan' in column) {
        cell.colSpan = column.colSpan;
      }
      if ('rowSpan' in column) {
        cell.rowSpan = column.rowSpan;
      }
      if (cell.colSpan !== 0) {
        rows[currentRow].push(cell);
      }
    });
    return rows.filter(function (row) {
      return row.length > 0;
    });
  },
  getExpandedRow: function getExpandedRow(key, content, visible, className, fixed) {
    var _props2 = this.props,
        prefixCls = _props2.prefixCls,
        expandIconAsCell = _props2.expandIconAsCell;

    var colCount = void 0;
    if (fixed === 'left') {
      colCount = this.columnManager.leftLeafColumns().length;
    } else if (fixed === 'right') {
      colCount = this.columnManager.rightLeafColumns().length;
    } else {
      colCount = this.columnManager.leafColumns().length;
    }
    var columns = [{
      key: 'extra-row',
      render: function render() {
        return {
          props: {
            colSpan: colCount
          },
          children: fixed !== 'right' ? content : '&nbsp;'
        };
      }
    }];
    if (expandIconAsCell && fixed !== 'right') {
      columns.unshift({
        key: 'expand-icon-placeholder',
        render: function render() {
          return null;
        }
      });
    }
    return _react2["default"].createElement(_TableRow2["default"], {
      columns: columns,
      visible: visible,
      className: className,
      key: key + '-extra-row',
      prefixCls: prefixCls + '-expanded-row',
      indent: 1,
      expandable: false,
      store: this.store
    });
  },
  getRowsByData: function getRowsByData(data, visible, indent, columns, fixed) {
    var isEnd = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

    var props = this.props;
    var childrenColumnName = props.childrenColumnName;
    var expandedRowRender = props.expandedRowRender;
    var expandRowByClick = props.expandRowByClick;
    var fixedColumnsBodyRowsHeight = this.state.fixedColumnsBodyRowsHeight;

    var rst = [];
    var rowClassName = props.rowClassName;
    var rowRef = props.rowRef;
    var expandedRowClassName = props.expandedRowClassName;
    var needIndentSpaced = props.data.some(function (record) {
      return record[childrenColumnName];
    });
    var onRowClick = props.onRowClick;
    var onRowDoubleClick = props.onRowDoubleClick;

    var expandIconAsCell = fixed !== 'right' ? props.expandIconAsCell : false;
    var expandIconColumnIndex = fixed !== 'right' ? props.expandIconColumnIndex : -1;

    for (var i = 0; i < data.length; i++) {
      var record = data[i];
      var key = this.getRowKey(record, i);
      var childrenColumn = record[childrenColumnName];
      var isRowExpanded = this.isRowExpanded(record, i);
      var expandedRowContent = void 0;
      if (expandedRowRender && isRowExpanded) {
        expandedRowContent = expandedRowRender(record, i, indent);
      }
      var className = rowClassName(record, i, indent);

      var onHoverProps = {};
      if (this.columnManager.isAnyColumnsFixed()) {
        onHoverProps.onHover = this.handleRowHover;
      }

      var height = fixed && fixedColumnsBodyRowsHeight[i] && !isEnd ? fixedColumnsBodyRowsHeight[i] : null;

      var leafColumns = void 0;
      if (fixed === 'left') {
        leafColumns = this.columnManager.leftLeafColumns();
      } else if (fixed === 'right') {
        leafColumns = this.columnManager.rightLeafColumns();
      } else {
        leafColumns = this.columnManager.leafColumns();
      }

      rst.push(_react2["default"].createElement(_TableRow2["default"], _extends({
        indent: indent,
        indentSize: props.indentSize,
        needIndentSpaced: needIndentSpaced,
        className: className,
        record: record,
        expandIconAsCell: expandIconAsCell,
        onDestroy: this.onRowDestroy,
        index: i,
        visible: visible,
        expandRowByClick: expandRowByClick,
        onExpand: this.onExpanded,
        expandable: childrenColumn || expandedRowRender,
        expanded: isRowExpanded,
        prefixCls: props.prefixCls + '-row',
        childrenColumnName: childrenColumnName,
        columns: leafColumns,
        expandIconColumnIndex: expandIconColumnIndex,
        onRowClick: onRowClick,
        onRowDoubleClick: onRowDoubleClick,
        height: height
      }, onHoverProps, {
        key: key,
        hoverKey: key,
        ref: rowRef(record, i, indent),
        store: this.store
      })));

      var subVisible = visible && isRowExpanded;

      if (expandedRowContent && isRowExpanded) {
        rst.push(this.getExpandedRow(key, expandedRowContent, subVisible, expandedRowClassName(record, i, indent), fixed));
      }
      if (childrenColumn) {
        rst = rst.concat(this.getRowsByData(childrenColumn, subVisible, indent + 1, columns, fixed));
      }
    }
    return rst;
  },
  getRows: function getRows(columns, fixed) {
    var isEnd = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var data = isEnd ? this.state.endData : this.state.data;
    return this.getRowsByData(data, true, 0, columns, fixed, isEnd);
  },
  getColGroup: function getColGroup(columns, fixed) {
    var cols = [];
    if (this.props.expandIconAsCell && fixed !== 'right') {
      cols.push(_react2["default"].createElement('col', {
        className: this.props.prefixCls + '-expand-icon-col',
        key: 'rc-table-expand-icon-col'
      }));
    }
    var leafColumns = void 0;
    if (fixed === 'left') {
      leafColumns = this.columnManager.leftLeafColumns();
    } else if (fixed === 'right') {
      leafColumns = this.columnManager.rightLeafColumns();
    } else {
      leafColumns = this.columnManager.leafColumns();
    }
    cols = cols.concat(leafColumns.map(function (c) {
      return _react2["default"].createElement('col', { key: c.key, style: { width: c.width, minWidth: c.width } });
    }));
    return _react2["default"].createElement(
      'colgroup',
      null,
      cols
    );
  },
  getLeftFixedTable: function getLeftFixedTable() {
    return this.getTable({
      columns: this.columnManager.leftColumns(),
      fixed: 'left'
    });
  },
  getRightFixedTable: function getRightFixedTable() {
    return this.getTable({
      columns: this.columnManager.rightColumns(),
      fixed: 'right'
    });
  },
  getTable: function getTable() {
    var _this2 = this;

    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var columns = options.columns,
        fixed = options.fixed;
    var _props3 = this.props,
        prefixCls = _props3.prefixCls,
        _props3$scroll = _props3.scroll,
        scroll = _props3$scroll === undefined ? {} : _props3$scroll,
        getBodyWrapper = _props3.getBodyWrapper;
    var _props4 = this.props,
        useFixedHeader = _props4.useFixedHeader,
        useFixedFooter = _props4.useFixedFooter;

    var bodyStyle = _extends({}, this.props.bodyStyle);
    var headStyle = {};
    var endStyle = {};

    var tableClassName = '';
    if (scroll.x || fixed) {
      tableClassName = prefixCls + '-fixed';
      bodyStyle.overflowX = bodyStyle.overflowX || 'auto';

      endStyle = _extends({}, bodyStyle);
    }

    if (scroll.y) {
      // maxHeight will make fixed-Table scrolling not working
      // so we only set maxHeight to body-Table here
      if (fixed) {
        bodyStyle.height = bodyStyle.height || scroll.y;
      } else {
        bodyStyle.maxHeight = bodyStyle.maxHeight || scroll.y;
      }
      bodyStyle.overflowY = bodyStyle.overflowY || 'scroll';
      useFixedHeader = true;

      if (!scroll.x && fixed) {
        endStyle.bottom = '-' + _scrollbarWidth + 'px';
      }

      // Add negative margin bottom for scroll bar overflow bug
      var _scrollbarWidth = (0, _utils.measureScrollbar)();
      if (_scrollbarWidth > 0) {
        var marginBottom = '-' + _scrollbarWidth + 'px';
        var paddingBottom = '0px';

        if (fixed) {
          bodyStyle.marginBottom = marginBottom;
          bodyStyle.paddingBottom = paddingBottom;
        } else {
          headStyle.marginBottom = marginBottom;
          headStyle.paddingBottom = paddingBottom;

          endStyle.right = _scrollbarWidth + 'px';
        }
      }
    }

    var renderTable = function renderTable() {
      var hasHead = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      var hasBody = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
      var hasEnd = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

      var tableStyle = {};
      if (!fixed && scroll.x) {
        // not set width, then use content fixed width
        if (scroll.x === true) {
          tableStyle.tableLayout = 'fixed';
        } else {
          tableStyle.width = scroll.x;
        }
      }
      var tableBody = hasBody ? getBodyWrapper(_react2["default"].createElement(
        'tbody',
        { className: prefixCls + '-tbody' },
        _this2.getRows(columns, fixed, hasEnd)
      )) : null;
      return _react2["default"].createElement(
        'table',
        { className: tableClassName, style: tableStyle },
        _this2.getColGroup(columns, fixed),
        hasHead ? _this2.getHeader(columns, fixed) : null,
        tableBody
      );
    };

    var headTable = void 0;

    if (useFixedHeader) {
      headTable = _react2["default"].createElement(
        'div',
        {
          className: prefixCls + '-header',
          ref: fixed ? null : 'headTable',
          style: headStyle,
          onMouseOver: this.detectScrollTarget,
          onTouchStart: this.detectScrollTarget,
          onScroll: this.handleBodyScroll
        },
        renderTable(true, false)
      );
    }

    var BodyTable = _react2["default"].createElement(
      'div',
      {
        className: prefixCls + '-body',
        style: bodyStyle,
        ref: 'bodyTable',
        onMouseOver: this.detectScrollTarget,
        onTouchStart: this.detectScrollTarget,
        onScroll: this.handleBodyScroll
      },
      renderTable(!useFixedHeader)
    );

    var endTable = void 0;

    if (this.state.endData) {
      endTable = _react2["default"].createElement(
        'div',
        {
          className: prefixCls + '-fixed-end',
          ref: fixed ? null : 'endTable',
          style: endStyle,
          onMouseOver: this.detectScrollTarget,
          onTouchStart: this.detectScrollTarget,
          onScroll: this.handleBodyScroll
        },
        renderTable(false, true, true)
      );
    }

    if (fixed && columns.length) {
      var refName = void 0;
      if (columns[0].fixed === 'left' || columns[0].fixed === true) {
        refName = 'fixedColumnsBodyLeft';
      } else if (columns[0].fixed === 'right') {
        refName = 'fixedColumnsBodyRight';
      }
      delete bodyStyle.overflowX;
      delete bodyStyle.overflowY;
      BodyTable = _react2["default"].createElement(
        'div',
        {
          className: prefixCls + '-body-outer',
          style: _extends({}, bodyStyle)
        },
        _react2["default"].createElement(
          'div',
          {
            className: prefixCls + '-body-inner',
            ref: refName,
            onMouseOver: this.detectScrollTarget,
            onTouchStart: this.detectScrollTarget,
            onScroll: this.handleBodyScroll
          },
          renderTable(!useFixedHeader)
        )
      );
    }

    return _react2["default"].createElement(
      'span',
      null,
      headTable,
      BodyTable,
      endTable
    );
  },
  getTitle: function getTitle() {
    var _props5 = this.props,
        title = _props5.title,
        prefixCls = _props5.prefixCls;

    return title ? _react2["default"].createElement(
      'div',
      { className: prefixCls + '-title' },
      title(this.state.data)
    ) : null;
  },
  getFooter: function getFooter() {
    var _props6 = this.props,
        footer = _props6.footer,
        prefixCls = _props6.prefixCls;

    return footer ? _react2["default"].createElement(
      'div',
      { className: prefixCls + '-footer' },
      footer(this.state.data)
    ) : null;
  },
  getEmptyText: function getEmptyText() {
    var _props7 = this.props,
        emptyText = _props7.emptyText,
        prefixCls = _props7.prefixCls,
        data = _props7.data;

    return !data.length ? _react2["default"].createElement(
      'div',
      { className: prefixCls + '-placeholder' },
      emptyText()
    ) : null;
  },
  getHeaderRowStyle: function getHeaderRowStyle(columns, rows) {
    var fixedColumnsHeadRowsHeight = this.state.fixedColumnsHeadRowsHeight;

    var headerHeight = fixedColumnsHeadRowsHeight[0];
    if (headerHeight && columns) {
      if (headerHeight === 'auto') {
        return { height: 'auto' };
      }
      return { height: headerHeight / rows.length };
    }
    return null;
  },
  syncFixedTableRowHeight: function syncFixedTableRowHeight() {
    var prefixCls = this.props.prefixCls;

    var headRows = this.refs.headTable ? this.refs.headTable.querySelectorAll('thead') : this.refs.bodyTable.querySelectorAll('thead');
    var bodyRows = this.refs.bodyTable.querySelectorAll('.' + prefixCls + '-row') || [];
    var fixedColumnsHeadRowsHeight = [].map.call(headRows, function (row) {
      return row.getBoundingClientRect().height || 'auto';
    });
    var fixedColumnsBodyRowsHeight = [].map.call(bodyRows, function (row) {
      return row.getBoundingClientRect().height || 'auto';
    });
    if ((0, _shallowequal2["default"])(this.state.fixedColumnsHeadRowsHeight, fixedColumnsHeadRowsHeight) && (0, _shallowequal2["default"])(this.state.fixedColumnsBodyRowsHeight, fixedColumnsBodyRowsHeight)) {
      return;
    }
    this.setState({
      fixedColumnsHeadRowsHeight: fixedColumnsHeadRowsHeight,
      fixedColumnsBodyRowsHeight: fixedColumnsBodyRowsHeight
    });
  },
  resetScrollY: function resetScrollY() {
    if (this.refs.headTable) {
      this.refs.headTable.scrollLeft = 0;
    }
    if (this.refs.bodyTable) {
      this.refs.bodyTable.scrollLeft = 0;
    }
  },
  findExpandedRow: function findExpandedRow(record, index) {
    var _this3 = this;

    var rows = this.getExpandedRows().filter(function (i) {
      return i === _this3.getRowKey(record, index);
    });
    return rows[0];
  },
  isRowExpanded: function isRowExpanded(record, index) {
    return typeof this.findExpandedRow(record, index) !== 'undefined';
  },
  detectScrollTarget: function detectScrollTarget(e) {
    if (this.scrollTarget !== e.currentTarget) {
      this.scrollTarget = e.currentTarget;
    }
  },
  handleBodyScroll: function handleBodyScroll(e) {
    var _this4 = this;

    // Prevent scrollTop setter trigger onScroll event
    // http://stackoverflow.com/q/1386696
    if (e.target !== this.scrollTarget) {
      return;
    }
    var _props$scroll = this.props.scroll,
        scroll = _props$scroll === undefined ? {} : _props$scroll;
    var _refs = this.refs,
        headTable = _refs.headTable,
        bodyTable = _refs.bodyTable,
        endTable = _refs.endTable,
        fixedColumnsBodyLeft = _refs.fixedColumnsBodyLeft,
        fixedColumnsBodyRight = _refs.fixedColumnsBodyRight;

    if (scroll.x && e.target.scrollLeft !== this.lastScrollLeft) {
      (function () {
        var toUpdate = [headTable, bodyTable, endTable];
        toUpdate = toUpdate.filter(function (table) {
          return table;
        }); // only get tables that exist

        var syncTableScroll = function syncTableScroll(checkTable) {
          toUpdate.filter(function (table) {
            return table !== checkTable;
          }).forEach(function (u) {
            u.scrollLeft = e.target.scrollLeft;
          });
        };

        if (e.target === bodyTable) {
          syncTableScroll(bodyTable);
        } else if (e.target === headTable) {
          syncTableScroll(headTable);
        } else if (e.target === endTable) {
          syncTableScroll(endTable);
        }

        if (e.target.scrollLeft === 0) {
          _this4.setState({ scrollPosition: 'left' });
        } else if (e.target.scrollLeft + 1 >= e.target.children[0].getBoundingClientRect().width - e.target.getBoundingClientRect().width) {
          _this4.setState({ scrollPosition: 'right' });
        } else if (_this4.state.scrollPosition !== 'middle') {
          _this4.setState({ scrollPosition: 'middle' });
        }
      })();
    }

    if (scroll.y) {
      if (fixedColumnsBodyLeft && e.target !== fixedColumnsBodyLeft) {
        fixedColumnsBodyLeft.scrollTop = e.target.scrollTop;
      }
      if (fixedColumnsBodyRight && e.target !== fixedColumnsBodyRight) {
        fixedColumnsBodyRight.scrollTop = e.target.scrollTop;
      }
      if (bodyTable && e.target !== bodyTable) {
        bodyTable.scrollTop = e.target.scrollTop;
      }

      var _scrollbarWidth2 = (0, _utils.measureScrollbar)();

      if (e.target.scrollTop === 0) {
        this.setState({ scrollYPosition: 'top' });
      } else if (e.target.scrollTop - _scrollbarWidth2 + 1 >= e.target.children[0].getBoundingClientRect().height - e.target.getBoundingClientRect().height) {
        this.setState({ scrollYPosition: 'bottom' });
      } else if (this.state.scrollYPosition !== 'middle') {
        this.setState({ scrollYPosition: 'middle' });
      }
    }
    // Remember last scrollLeft for scroll direction detecting.
    this.lastScrollLeft = e.target.scrollLeft;
  },
  handleRowHover: function handleRowHover(isHover, key) {
    this.store.setState({
      currentHoverKey: isHover ? key : null
    });
  },
  render: function render() {
    var props = this.props;
    var prefixCls = props.prefixCls;

    var className = props.prefixCls;
    if (props.className) {
      className += ' ' + props.className;
    }
    if (props.useFixedHeader || props.scroll && props.scroll.y) {
      className += ' ' + prefixCls + '-fixed-header';
    }
    className += ' ' + prefixCls + '-scroll-position-' + this.state.scrollPosition;
    className += ' ' + prefixCls + '-scroll-y-position-' + this.state.scrollYPosition;

    var isTableScroll = this.columnManager.isAnyColumnsFixed() || props.scroll.x || props.scroll.y;

    return _react2["default"].createElement(
      'div',
      { className: className, style: props.style },
      this.getTitle(),
      _react2["default"].createElement(
        'div',
        { className: prefixCls + '-content' },
        this.columnManager.isAnyColumnsLeftFixed() && _react2["default"].createElement(
          'div',
          { className: prefixCls + '-fixed-left' },
          this.getLeftFixedTable()
        ),
        _react2["default"].createElement(
          'div',
          { className: isTableScroll ? prefixCls + '-scroll' : '' },
          this.getTable({ columns: this.columnManager.groupedColumns() }),
          this.getEmptyText(),
          this.getFooter()
        ),
        this.columnManager.isAnyColumnsRightFixed() && _react2["default"].createElement(
          'div',
          { className: prefixCls + '-fixed-right' },
          this.getRightFixedTable()
        )
      )
    );
  }
});

exports["default"] = Table;
module.exports = exports['default'];