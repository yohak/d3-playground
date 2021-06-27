import styled from "styled-components";

export const Aside = styled.aside`
  padding: 20px 10px;

  .scroll-wrapper {
    height: 100%;
  }

  .selectors {
    display: flex;
    gap: 10px;
  }

  .check-group {
    display: flex;
    gap: 6px;

    & > span:last-of-type {
      position: relative;
      top: 1px;
    }
  }

  table {
    font-size: 14px;
    margin-top: 20px;
    width: 100%;
    margin-bottom: 5px;

    thead {
      th {
        padding: 5px;
        font-weight: normal;

        &:first-child {
          vertical-align: bottom;
        }
      }
    }

    tbody {
      tr {
        background-color: transparent;
        transition-property: background-color;
        transition-duration: 0.1s;
        transition-timing-function: ease-out;

        &.focused,
        &:hover {
          background-color: #666666;
        }

        td {
          padding: 5px;
          border-top: 1px solid #cccccc;
          border-bottom: 1px solid #cccccc;
          user-select: none;
        }

        td:first-child span {
          display: flex;
          width: fit-content;
          white-space: nowrap;
        }

        td:nth-child(n + 2) {
          //background-color: blue;
          text-align: center;
          vertical-align: middle;
        }
      }
    }
  }
`;
