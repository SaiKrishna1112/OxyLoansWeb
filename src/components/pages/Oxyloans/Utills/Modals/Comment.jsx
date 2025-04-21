import { useEffect, useState } from "react";
import "../file.css";
import Modal from "react-bootstrap/Modal";

function Comment(dataapi) {
  const [lgShow, setLgShow] = useState(true);
  const [data1, setdata] = useState(dataapi.data.data);





  console.log(dataapi.data.data)
  return (
    <>
      <Modal
        size="lg"
        show={lgShow}
        onHide={() => setLgShow(false)}
        aria-labelledby="example-modal-sizes-title-lg"
      >
        <Modal.Header closeButton>
          <Modal.Title id="example-modal-sizes-title-lg">
            View Comment
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {dataapi.data.data ? (
            <>
              {console.log(dataapi.data.data)}

              <table class="table table-striped">
                <thead>
                  <tr>
                    <th scope="col">Sno</th>
                    <th scope="col">Admin Comments</th>
                    <th scope="col">Responded By</th>
                    <th scope="col">Responded On</th>
                  </tr>
                </thead>
                <tbody>

                  {dataapi.data.data.map((data, index) =>
                  (  <tr>
                    <th scope="row">{index + 1}</th>
                    <td>{data.pendingQuereis}</td>
                    <td>{data.respondedBy}</td>
                      <td>{data.respondedOn}</td>

                  </tr>
                  ))
               }
                </tbody>
              </table>
              {/* <table>
                <tr>
                  <th colSpan={4}>Admin Comments</th>
                  <th colSpan={5}>Responded On</th>

                </tr>
                {dataapi.data.data.map((data, index) =>
                  <>

                    <tr>
                      <td colSpan={5}>
                        <p style={{ fontSize: '13px' }}>{data.pendingQuereis}</p></td>
                      <td colSpan={4}>{data.respondedOn}</td>
                    </tr></>
                )}


              </table> */}

            </>
          ) : (
            <>
              {/* <table>
                <tr>
                  <th>Company</th>
                  <th>Contact</th>
                  <th>Country</th>
                </tr>
                <tr>
                  <td>Alfreds Futterkiste</td>
                  <td>Maria Anders</td>
                  <td>Germany</td>
                </tr>
                <tr>
                  <td>Centro comercial Moctezuma</td>
                  <td>Francisco Chang</td>
                  <td>Mexico</td>
                </tr>
                <tr>
                  <td>Ernst Handel</td>
                  <td>Roland Mendel</td>
                  <td>Austria</td>
                </tr>
                <tr>
                  <td>Island Trading</td>
                  <td>Helen Bennett</td>
                  <td>UK</td>
                </tr>
                <tr>
                  <td>Laughing Bacchus Winecellars</td>
                  <td>Yoshi Tannamuri</td>
                  <td>Canada</td>
                </tr>
                <tr>
                  <td>Magazzini Alimentari Riuniti</td>
                  <td>Giovanni Rovelli</td>
                  <td>Italy</td>
                </tr>
              </table> */}
            </>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Comment;
