import React from 'react';
import PropTypes from 'prop-types';
import {
  InfiniteLoader,
  List,
  WindowScroller,
  AutoSizer,
} from 'react-virtualized';
import MovieCard from './DefaultMovieCard';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';

const ITEM_WIDTH = 400;
const ITEM_HEIGHT = 360;

const styles = (theme) => ({
  grid: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    justifyContent: 'center',
  },
  gridItem: {
    padding: theme.spacing(1.5),
  },
  card: {
    height: '100%',
  },
  row: {
    display: 'flex',
    justifyContent: 'center',
  },
});

function generateIndexesForRow(rowIndex, rowWidth, itemWidth, itemsAmount) {
  const result = [];
  const maxItemsPerRow = getMaxItemsAmountPerRow(rowWidth, itemWidth);
  const startIndex = rowIndex * maxItemsPerRow;

  for (
    let i = startIndex;
    i < Math.min(startIndex + maxItemsPerRow, itemsAmount);
    i++
  ) {
    result.push(i);
  }

  return result;
}

function getMaxItemsAmountPerRow(rowWidth, itemWidth) {
  return Math.max(Math.floor(rowWidth / itemWidth), 1);
}

function getRowsAmount(rowWidth, itemWidth, itemsAmount, hasMore) {
  const maxItemsPerRow = getMaxItemsAmountPerRow(rowWidth, itemWidth);

  return Math.ceil(itemsAmount / maxItemsPerRow) + (hasMore ? 1 : 0);
}

const RowItem = React.memo(function RowItem({
  movieId,
  classes,
  itemComponentType: ItemComponentType,
  width,
}) {
  return (
    <Grid item className={classes.gridItem} style={{ width }}>
      <ItemComponentType movieId={movieId} classes={{ root: classes.card }} />
    </Grid>
  );
});

class InfiniteMoviesList extends React.PureComponent {
  infiniteLoaderRef = React.createRef();

  loadMoreRows = () => {
    if (!this.props.isFetching) {
      this.props.fetchMovies();
    }
  };

  noRowsRenderer = () => (
    <Grid item>
      <Typography>No movies found</Typography>
    </Grid>
  );

  componentDidUpdate(prevProps) {
    if (
      !prevProps.reset &&
      this.props.reset &&
      this.infiniteLoaderRef.current
    ) {
      this.infiniteLoaderRef.current.resetLoadMoreRowsCache(true);
    }
  }

  render() {
    const { classes } = this.props;

    return (
      <section>
        <AutoSizer disableHeight>
          {({ width }) => {
            const { movieIds, hasMore } = this.props;
            const rowCount = getRowsAmount(
              width,
              ITEM_WIDTH,
              movieIds.length,
              hasMore
            );

            return (
              <InfiniteLoader
                ref={this.infiniteLoaderRef}
                rowCount={rowCount}
                isRowLoaded={({ index }) => {
                  const { hasMore, movieIds } = this.props;
                  const allItemsLoaded =
                    generateIndexesForRow(
                      index,
                      width,
                      ITEM_WIDTH,
                      movieIds.length
                    ).length > 0;

                  return !hasMore || allItemsLoaded;
                }}
                loadMoreRows={this.loadMoreRows}
              >
                {({ onRowsRendered, registerChild }) => (
                  <WindowScroller>
                    {({ height, scrollTop }) => (
                      <List
                        className={classes.grid}
                        autoHeight
                        ref={registerChild}
                        height={height}
                        scrollTop={scrollTop}
                        width={width}
                        rowCount={rowCount}
                        rowHeight={ITEM_HEIGHT}
                        onRowsRendered={onRowsRendered}
                        rowRenderer={({ index, style, key }) => {
                          const { movieIds, classes } = this.props;
                          const movieIdsForRow = generateIndexesForRow(
                            index,
                            width,
                            ITEM_WIDTH,
                            movieIds.length
                          ).map((movieIndex) => movieIds[movieIndex]);

                          return (
                            <div
                              style={style}
                              key={key}
                              className={classes.row}
                            >
                              {movieIdsForRow.map((movieId) => (
                                <RowItem
                                  key={movieId}
                                  movieId={movieId}
                                  classes={classes}
                                  itemComponentType={
                                    this.props.itemComponentType
                                  }
                                  width={ITEM_WIDTH}
                                />
                              ))}
                            </div>
                          );
                        }}
                        noRowsRenderer={this.noRowsRenderer}
                      />
                    )}
                  </WindowScroller>
                )}
              </InfiniteLoader>
            );
          }}
        </AutoSizer>
      </section>
    );
  }
}

InfiniteMoviesList.defaultProps = {
  movieIds: [],
  isFetching: false,
  hasMore: false,
  reset: false,
  fetchMovies: () => {},
  itemComponentType: MovieCard,
};

InfiniteMoviesList.propTypes = {
  movieIds: PropTypes.arrayOf(PropTypes.number.isRequired),
  fetchMovies: PropTypes.func,
  hasMore: PropTypes.bool,
  isFetching: PropTypes.bool,
  reset: PropTypes.bool,
  classes: PropTypes.object.isRequired,
  itemComponentType: PropTypes.elementType.isRequired,
};

export default withStyles(styles)(InfiniteMoviesList);