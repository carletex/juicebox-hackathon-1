import { useContractReader } from "eth-hooks";
import React, { useEffect, useState } from "react";
import { Button, List, Card } from "antd";
import { ipfs } from "../helpers";
import { useJuiceBoxBalance } from "../hooks";

const { ethers } = require("ethers");

function Home({ DEBUG, readContracts, writeContracts, tx, mainnetProvider, blockExplorer, config }) {
  const totalSupply = useContractReader(readContracts, "JBNFT", "totalSupply");
  if (DEBUG) console.log("🤗 totalSupply:", totalSupply);

  const { data: balance } = useJuiceBoxBalance({ provider: mainnetProvider, projectId: config.juiceBoxProjectId });
  const balanceETH = balance ? parseFloat(ethers.utils.formatEther(balance)).toFixed(4) : "...";

  const [levels, setLevels] = useState([]);
  const [loadingLevels, setLoadingLevels] = useState(false);

  useEffect(() => {
    const updateLevels = async () => {
      if (readContracts.JBNFT) {
        setLoadingLevels(true);
        const levelIdCounter = await readContracts.JBNFT.levelIdCounter();
        if (DEBUG) console.log("levelIdCounter:", levelIdCounter);

        if (levelIdCounter > 0) {
          const levelUpdate = [];
          for (let levelId = 0; levelId < levelIdCounter; levelId++) {
            const levelData = await readContracts.JBNFT.levels(levelId);
            const jsonManifestBuffer = await ipfs.getFromIPFS(levelData[1]);
            const jsonManifest = JSON.parse(jsonManifestBuffer.toString());
            levelUpdate.push({ id: levelId, price: levelData[0], image: jsonManifest.image });
          }
          if (DEBUG) console.log("Levels: ", levelUpdate);
          setLevels(levelUpdate);
        }
        setLoadingLevels(false);
      }
    };
    updateLevels();
    // eslint-disable-next-line
  }, [DEBUG, readContracts.JBNFT]);

  return (
    <div>
      <div style={{ margin: "auto", padding: 32, paddingBottom: 0 }}>
        <div style={{ marginTop: 50 }}>
          <div style={{ fontSize: 24 }}>
            <p>Mint an NFT and support our project on JuiceBox.</p>
            <p>In Treasury: Ξ{balanceETH}</p>
          </div>

          <div>
            <List
              grid={{
                xs: 1,
                sm: 2,
                md: 2,
                lg: 3,
                xl: 3,
                xxl: 3,
              }}
              pagination={false}
              loading={loadingLevels}
              dataSource={levels}
              renderItem={level => {
                return (
                  <List.Item key={level.id}>
                    <Card
                      style={{ border: "none" }}
                      headStyle={{ borderBottom: "none" }}
                      title={
                        <div>
                          <Button
                            style={{
                              width: 380,
                              fontSize: 20,
                              height: 50,
                              backgroundColor: "#60f479",
                              borderColor: "#60f479",
                              color: "black",
                              fontWeight: "bold",
                            }}
                            type="primary"
                            onClick={async () => {
                              try {
                                console.log("price: ", level.price);
                                const txCur = await tx(
                                  writeContracts.JBNFT.mintItem(level.id, {
                                    value: level.price,
                                  }),
                                );
                                await txCur.wait();
                              } catch (e) {
                                console.log("mint failed", e);
                              }
                            }}
                          >
                            MINT for Ξ{ethers.utils.formatEther(level.price)}
                          </Button>
                        </div>
                      }
                    >
                      <img src={level.image} alt={"Level #" + level.id} width="380" height="300" />
                    </Card>
                  </List.Item>
                );
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
