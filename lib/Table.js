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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _addEventListener = require('rc-util/lib/Dom/addEventListener');

var _addEventListener2 = _interopRequireDefault(_addEventListener);

var _ColumnManager = require('./ColumnManager');

var _ColumnManager2 = _interopRequireDefault(_ColumnManager);

var _createStore = require('./createStore');

var _createStore2 = _interopRequireDefault(_createStore);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _defaults(obj, defaults) { var keys = Object.getOwnPropertyNames(defaults); for (var i = 0; i < keys.length; i++) { var key = keys[i]; var value = Object.getOwnPropertyDescriptor(defaults, key); if (value && value.configurable && obj[key] === undefined) { Object.defineProperty(obj, key, value); } } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : _defaults(subClass, superClass); }

var Table = function (_React$Component) {
  _inherits(Table, _React$Component);

  function Table(props, context) {
    _classCallCheck(this, Table);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this, props, context));

    _initialiseProps.call(_this);

    var expandedRowKeys = [];
    var rows = [].concat(_toConsumableArray(props.data));
    _this.columnManager = new _ColumnManager2["default"](props.columns, props.children);
    _this.store = (0, _createStore2["default"])({ currentHoverKey: null });

    if (props.defaultExpandAllRows) {
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        expandedRowKeys.push(_this.getRowKey(row, i));
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

    _this.state = {
      expandedRowKeys: expandedRowKeys,
      data: data,
      endData: endData,
      currentHoverKey: null,
      scrollPosition: 'left',
      scrollYPosition: 'top',
      fixedColumnsHeadRowsHeight: [],
      fixedColumnsBodyRowsHeight: []
    };
    return _this;
  }

  Table.prototype.componentDidMount = function componentDidMount() {
    this.resetScrollY();
    if (this.columnManager.isAnyColumnsFixed()) {
      this.syncFixedTableRowHeight();
      this.debouncedSyncFixedTableRowHeight = (0, _utils.debounce)(this.syncFixedTableRowHeight, 150);
      this.resizeEvent = (0, _addEventListener2["default"])(window, 'resize', this.debouncedSyncFixedTableRowHeight);
    }
  };

  Table.prototype.componentWillReceiveProps = function componentWillReceiveProps(nextProps) {
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
  };

  Table.prototype.componentDidUpdate = function componentDidUpdate() {
    this.syncFixedTableRowHeight();
  };

  Table.prototype.componentWillUnmount = function componentWillUnmount() {
    if (this.resizeEvent) {
      this.resizeEvent.remove();
    }
    if (this.debouncedSyncFixedTableRowHeight) {
      this.debouncedSyncFixedTableRowHeight.cancel();
    }
  };

  Table.prototype.render = function render() {
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
  };

  return Table;
}(_react2["default"].Component);

Table.propTypes = {
  data: _propTypes2["default"].array,
  expandIconAsCell: _propTypes2["default"].bool,
  defaultExpandAllRows: _propTypes2["default"].bool,
  expandedRowKeys: _propTypes2["default"].array,
  defaultExpandedRowKeys: _propTypes2["default"].array,
  useFixedHeader: _propTypes2["default"].bool,
  fixedEndRowCount: _propTypes2["default"].number,
  columns: _propTypes2["default"].array,
  prefixCls: _propTypes2["default"].string,
  bodyStyle: _propTypes2["default"].object,
  style: _propTypes2["default"].object,
  rowKey: _propTypes2["default"].oneOfType([_propTypes2["default"].string, _propTypes2["default"].func]),
  rowClassName: _propTypes2["default"].func,
  expandedRowClassName: _propTypes2["default"].func,
  childrenColumnName: _propTypes2["default"].string,
  onExpand: _propTypes2["default"].func,
  onExpandedRowsChange: _propTypes2["default"].func,
  indentSize: _propTypes2["default"].number,
  onRowClick: _propTypes2["default"].func,
  onRowDoubleClick: _propTypes2["default"].func,
  expandIconColumnIndex: _propTypes2["default"].number,
  showHeader: _propTypes2["default"].bool,
  title: _propTypes2["default"].func,
  footer: _propTypes2["default"].func,
  emptyText: _propTypes2["default"].func,
  scroll: _propTypes2["default"].object,
  rowRef: _propTypes2["default"].func,
  getBodyWrapper: _propTypes2["default"].func,
  children: _propTypes2["default"].node
};
Table.defaultProps = {
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

var _initialiseProps = function _initialiseProps() {
  var _this2 = this;

  this.onExpandedRowsChange = function (expandedRowKeys) {
    if (!_this2.props.expandedRowKeys) {
      _this2.setState({ expandedRowKeys: expandedRowKeys });
    }
    _this2.props.onExpandedRowsChange(expandedRowKeys);
  };

  this.onExpanded = function (expanded, record, e, index) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    var info = _this2.findExpandedRow(record);
    if (typeof info !== 'undefined' && !expanded) {
      _this2.onRowDestroy(record, index);
    } else if (!info && expanded) {
      var expandedRows = _this2.getExpandedRows().concat();
      expandedRows.push(_this2.getRowKey(record, index));
      _this2.onExpandedRowsChange(expandedRows);
    }
    _this2.props.onExpand(expanded, record);
  };

  this.onRowDestroy = function (record, rowIndex) {
    var expandedRows = _this2.getExpandedRows().concat();
    var rowKey = _this2.getRowKey(record, rowIndex);
    var index = -1;
    expandedRows.forEach(function (r, i) {
      if (r === rowKey) {
        index = i;
      }
    });
    if (index !== -1) {
      expandedRows.splice(index, 1);
    }
    _this2.onExpandedRowsChange(expandedRows);
  };

  this.getRowKey = function (record, index) {
    var rowKey = _this2.props.rowKey;
    var key = typeof rowKey === 'function' ? rowKey(record, index) : record[rowKey];
    (0, _utils.warningOnce)(key !== undefined, 'Each record in table should have a unique `key` prop,' + 'or set `rowKey` to an unique primary key.');
    return key === undefined ? index : key;
  };

  this.getExpandedRows = function () {
    return _this2.props.expandedRowKeys || _this2.state.expandedRowKeys;
  };

  this.getHeader = function (columns, fixed) {
    var _props = _this2.props,
        showHeader = _props.showHeader,
        expandIconAsCell = _props.expandIconAsCell,
        prefixCls = _props.prefixCls;

    var rows = _this2.getHeaderRows(columns);

    if (expandIconAsCell && fixed !== 'right') {
      rows[0].unshift({
        key: 'rc-table-expandIconAsCell',
        className: prefixCls + '-expand-icon-th',
        title: '',
        rowSpan: rows.length
      });
    }

    var trStyle = fixed ? _this2.getHeaderRowStyle(columns, rows) : null;

    return showHeader ? _react2["default"].createElement(_TableHeader2["default"], {
      prefixCls: prefixCls,
      rows: rows,
      rowStyle: trStyle
    }) : null;
  };

  this.getHeaderRows = function (columns) {
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
        _this2.getHeaderRows(column.children, currentRow + 1, rows);
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
  };

  this.getExpandedRow = function (key, content, visible, className, fixed) {
    var _props2 = _this2.props,
        prefixCls = _props2.prefixCls,
        expandIconAsCell = _props2.expandIconAsCell;

    var colCount = void 0;
    if (fixed === 'left') {
      colCount = _this2.columnManager.leftLeafColumns().length;
    } else if (fixed === 'right') {
      colCount = _this2.columnManager.rightLeafColumns().length;
    } else {
      colCount = _this2.columnManager.leafColumns().length;
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
      store: _this2.store
    });
  };

  this.getRowsByData = function (data, visible, indent, columns, fixed) {
    var isEnd = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

    var props = _this2.props;
    var childrenColumnName = props.childrenColumnName;
    var expandedRowRender = props.expandedRowRender;
    var expandRowByClick = props.expandRowByClick;
    var fixedColumnsBodyRowsHeight = _this2.state.fixedColumnsBodyRowsHeight;

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
      var key = _this2.getRowKey(record, i);
      var childrenColumn = record[childrenColumnName];
      var isRowExpanded = _this2.isRowExpanded(record, i);
      var expandedRowContent = void 0;
      if (expandedRowRender && isRowExpanded) {
        expandedRowContent = expandedRowRender(record, i, indent);
      }
      var className = rowClassName(record, i, indent);

      var onHoverProps = {};
      if (_this2.columnManager.isAnyColumnsFixed()) {
        onHoverProps.onHover = _this2.handleRowHover;
      }

      var height = fixed && fixedColumnsBodyRowsHeight[i] && !isEnd ? fixedColumnsBodyRowsHeight[i] : null;

      var leafColumns = void 0;
      if (fixed === 'left') {
        leafColumns = _this2.columnManager.leftLeafColumns();
      } else if (fixed === 'right') {
        leafColumns = _this2.columnManager.rightLeafColumns();
      } else {
        leafColumns = _this2.columnManager.leafColumns();
      }

      rst.push(_react2["default"].createElement(_TableRow2["default"], _extends({
        indent: indent,
        indentSize: props.indentSize,
        needIndentSpaced: needIndentSpaced,
        className: className,
        record: record,
        expandIconAsCell: expandIconAsCell,
        onDestroy: _this2.onRowDestroy,
        index: i,
        visible: visible,
        expandRowByClick: expandRowByClick,
        onExpand: _this2.onExpanded,
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
        store: _this2.store
      })));

      var subVisible = visible && isRowExpanded;

      if (expandedRowContent && isRowExpanded) {
        rst.push(_this2.getExpandedRow(key, expandedRowContent, subVisible, expandedRowClassName(record, i, indent), fixed));
      }
      if (childrenColumn) {
        rst = rst.concat(_this2.getRowsByData(childrenColumn, subVisible, indent + 1, columns, fixed));
      }
    }
    return rst;
  };

  this.getRows = function (columns, fixed) {
    var isEnd = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

    var data = isEnd ? _this2.state.endData : _this2.state.data;
    return _this2.getRowsByData(data, true, 0, columns, fixed, isEnd);
  };

  this.getColGroup = function (columns, fixed) {
    var cols = [];
    if (_this2.props.expandIconAsCell && fixed !== 'right') {
      cols.push(_react2["default"].createElement('col', {
        className: _this2.props.prefixCls + '-expand-icon-col',
        key: 'rc-table-expand-icon-col'
      }));
    }
    var leafColumns = void 0;
    if (fixed === 'left') {
      leafColumns = _this2.columnManager.leftLeafColumns();
    } else if (fixed === 'right') {
      leafColumns = _this2.columnManager.rightLeafColumns();
    } else {
      leafColumns = _this2.columnManager.leafColumns();
    }
    cols = cols.concat(leafColumns.map(function (c) {
      return _react2["default"].createElement('col', { key: c.key, style: { width: c.width, minWidth: c.width } });
    }));
    return _react2["default"].createElement(
      'colgroup',
      null,
      cols
    );
  };

  this.getLeftFixedTable = function () {
    return _this2.getTable({
      columns: _this2.columnManager.leftColumns(),
      fixed: 'left'
    });
  };

  this.getRightFixedTable = function () {
    return _this2.getTable({
      columns: _this2.columnManager.rightColumns(),
      fixed: 'right'
    });
  };

  this.getTable = function () {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
    var columns = options.columns,
        fixed = options.fixed;
    var _props3 = _this2.props,
        prefixCls = _props3.prefixCls,
        _props3$scroll = _props3.scroll,
        scroll = _props3$scroll === undefined ? {} : _props3$scroll,
        getBodyWrapper = _props3.getBodyWrapper;
    var useFixedHeader = _this2.props.useFixedHeader;

    var bodyStyle = _extends({}, _this2.props.bodyStyle);
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

      // Add negative margin bottom for scroll bar overflow bug
      var scrollbarWidth = (0, _utils.measureScrollbar)();
      if (!scroll.x && fixed) {
        endStyle.bottom = '-' + scrollbarWidth + 'px';
      }

      if (scrollbarWidth > 0) {
        var marginBottom = '-' + scrollbarWidth + 'px';
        var paddingBottom = '0px';

        if (fixed) {
          bodyStyle.marginBottom = marginBottom;
          bodyStyle.paddingBottom = paddingBottom;
        } else {
          headStyle.marginBottom = marginBottom;
          headStyle.paddingBottom = paddingBottom;

          endStyle.right = scrollbarWidth + 'px';
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
          onMouseOver: _this2.detectScrollTarget,
          onTouchStart: _this2.detectScrollTarget,
          onScroll: _this2.handleBodyScroll
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
        onMouseOver: _this2.detectScrollTarget,
        onTouchStart: _this2.detectScrollTarget,
        onScroll: _this2.handleBodyScroll
      },
      renderTable(!useFixedHeader)
    );

    var endTable = void 0;

    if (_this2.state.endData) {
      endTable = _react2["default"].createElement(
        'div',
        {
          className: prefixCls + '-fixed-end',
          ref: fixed ? null : 'endTable',
          style: endStyle,
          onMouseOver: _this2.detectScrollTarget,
          onTouchStart: _this2.detectScrollTarget,
          onScroll: _this2.handleBodyScroll
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
            onMouseOver: _this2.detectScrollTarget,
            onTouchStart: _this2.detectScrollTarget,
            onScroll: _this2.handleBodyScroll
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
  };

  this.getTitle = function () {
    var _props4 = _this2.props,
        title = _props4.title,
        prefixCls = _props4.prefixCls;

    return title ? _react2["default"].createElement(
      'div',
      { className: prefixCls + '-title' },
      title(_this2.state.data)
    ) : null;
  };

  this.getFooter = function () {
    var _props5 = _this2.props,
        footer = _props5.footer,
        prefixCls = _props5.prefixCls;

    return footer ? _react2["default"].createElement(
      'div',
      { className: prefixCls + '-footer' },
      footer(_this2.state.data)
    ) : null;
  };

  this.getEmptyText = function () {
    var _props6 = _this2.props,
        emptyText = _props6.emptyText,
        prefixCls = _props6.prefixCls,
        data = _props6.data;

    return !data.length ? _react2["default"].createElement(
      'div',
      { className: prefixCls + '-placeholder' },
      emptyText()
    ) : null;
  };

  this.getHeaderRowStyle = function (columns, rows) {
    var fixedColumnsHeadRowsHeight = _this2.state.fixedColumnsHeadRowsHeight;

    var headerHeight = fixedColumnsHeadRowsHeight[0];
    if (headerHeight && columns) {
      if (headerHeight === 'auto') {
        return { height: 'auto' };
      }
      return { height: headerHeight / rows.length };
    }
    return null;
  };

  this.syncFixedTableRowHeight = function () {
    var prefixCls = _this2.props.prefixCls;

    var headRows = _this2.refs.headTable ? _this2.refs.headTable.querySelectorAll('thead') : _this2.refs.bodyTable.querySelectorAll('thead');
    var bodyRows = _this2.refs.bodyTable.querySelectorAll('.' + prefixCls + '-row') || [];
    var fixedColumnsHeadRowsHeight = [].map.call(headRows, function (row) {
      return row.getBoundingClientRect().height || 'auto';
    });
    var fixedColumnsBodyRowsHeight = [].map.call(bodyRows, function (row) {
      return row.getBoundingClientRect().height || 'auto';
    });
    if ((0, _shallowequal2["default"])(_this2.state.fixedColumnsHeadRowsHeight, fixedColumnsHeadRowsHeight) && (0, _shallowequal2["default"])(_this2.state.fixedColumnsBodyRowsHeight, fixedColumnsBodyRowsHeight)) {
      return;
    }
    _this2.setState({
      fixedColumnsHeadRowsHeight: fixedColumnsHeadRowsHeight,
      fixedColumnsBodyRowsHeight: fixedColumnsBodyRowsHeight
    });
  };

  this.resetScrollY = function () {
    if (_this2.refs.headTable) {
      _this2.refs.headTable.scrollLeft = 0;
    }
    if (_this2.refs.bodyTable) {
      _this2.refs.bodyTable.scrollLeft = 0;
    }
  };

  this.findExpandedRow = function (record, index) {
    var rows = _this2.getExpandedRows().filter(function (i) {
      return i === _this2.getRowKey(record, index);
    });
    return rows[0];
  };

  this.isRowExpanded = function (record, index) {
    return typeof _this2.findExpandedRow(record, index) !== 'undefined';
  };

  this.detectScrollTarget = function (e) {
    if (_this2.scrollTarget !== e.currentTarget) {
      _this2.scrollTarget = e.currentTarget;
    }
  };

  this.handleBodyScroll = function (e) {
    // Prevent scrollTop setter trigger onScroll event
    // http://stackoverflow.com/q/1386696
    if (e.target !== _this2.scrollTarget) {
      return;
    }
    var _props$scroll = _this2.props.scroll,
        scroll = _props$scroll === undefined ? {} : _props$scroll;
    var _refs = _this2.refs,
        headTable = _refs.headTable,
        bodyTable = _refs.bodyTable,
        endTable = _refs.endTable,
        fixedColumnsBodyLeft = _refs.fixedColumnsBodyLeft,
        fixedColumnsBodyRight = _refs.fixedColumnsBodyRight;

    if (scroll.x && e.target.scrollLeft !== _this2.lastScrollLeft) {
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
        _this2.setState({ scrollPosition: 'left' });
      } else if (e.target.scrollLeft + 1 >= e.target.children[0].getBoundingClientRect().width - e.target.getBoundingClientRect().width) {
        _this2.setState({ scrollPosition: 'right' });
      } else if (_this2.state.scrollPosition !== 'middle') {
        _this2.setState({ scrollPosition: 'middle' });
      }
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

      var scrollbarWidth = (0, _utils.measureScrollbar)();

      if (e.target.scrollTop === 0) {
        _this2.setState({ scrollYPosition: 'top' });
      } else if (e.target.scrollTop - scrollbarWidth + 1 >= e.target.children[0].getBoundingClientRect().height - e.target.getBoundingClientRect().height) {
        _this2.setState({ scrollYPosition: 'bottom' });
      } else if (_this2.state.scrollYPosition !== 'middle') {
        _this2.setState({ scrollYPosition: 'middle' });
      }
    }
    // Remember last scrollLeft for scroll direction detecting.
    _this2.lastScrollLeft = e.target.scrollLeft;
  };

  this.handleRowHover = function (isHover, key) {
    _this2.store.setState({
      currentHoverKey: isHover ? key : null
    });
  };
};

exports["default"] = Table;
module.exports = exports['default'];